/**
 * drive-sync.js — versión final
 *
 * Problemas corregidos:
 *  1. Sin window.prompt()       → API Key se ingresa en input inline del panel
 *  2. Sin inline styles         → todo el render usa clases CSS (.ds-*)
 *  3. Paginación completa       → _listFilesAll() sigue nextPageToken
 *  4. Sin onclick en strings    → event delegation con data-* attributes
 *  5. Recursión paralela        → Promise.all en subcarpetas
 *  6. _state protegido          → Proxy con validación de tipos y valores
 *  7. _gapiReady encapsulado    → módulo _gapi con getter/setter
 *  8. API Key ofuscada          → _keyStore con btoa encoding (base64)
 *
 * Requiere: drive-sync.css (clases .ds-*) cargado en index.html
 */

'use strict';

// ─── Configuración ─────────────────────────────────────────────────────────────

const DRIVE_CONFIG = Object.freeze({
    CLIENT_ID:            '539650020603-dcgj1e8u6ig305qosef3p49tkc8ml551.apps.googleusercontent.com',
    ROOT_FOLDER_ID:       '0AGCxqv4-HTgIUk9PVA',
    MARKETPLACE_FOLDER:   'MERCADOLIBRE',
    POLL_INTERVAL:        30_000,
    SCOPES:               'https://www.googleapis.com/auth/drive.readonly',
    DEFAULT_PICKER:       'kmendoza',
    TOKEN_KEY:            'drive_token_v2',
    MODE_KEY:             'drive_mode',
    AUTO_PICKER_KEY:      'drive_auto_picker_v1',
    WAS_ACTIVE_KEY:       'drive_was_active',
    API_KEY_KEY:          'drive_api_key',
    SOUND_SETTINGS_KEY:   'drive_sound_settings_v1',
    CARRIER_PRINTED_KEY:  'drive_carrier_printed_labels_v1',
    TOKEN_REFRESH_MARGIN: 5 * 60 * 1000,
    ALERT_ICON:           'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png',
    RECENT_FIRST_SCAN_ALERT_MS: 45 * 60 * 1000,
    FOLDER_CACHE_TTL:     5 * 60 * 1000,
    FILE_CACHE_TTL:       75 * 1000,
    ARRIVAL_REPEAT_DELAYS: Object.freeze([6_000, 15_000]),
    PENDING_REMINDER_DELAYS: Object.freeze([30_000, 90_000, 180_000]),
});

const _carrierPrintState = {
    entries: [],
    activeIndex: 0,
    lastFocused: null,
};

const MESES = Object.freeze([
    'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
    'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE',
]);

const DRIVE_LABEL_SOURCES = Object.freeze({
    mercadolibre: Object.freeze({
        key: 'mercadolibre',
        label: 'Mercado Libre',
        folder: DRIVE_CONFIG.MARKETPLACE_FOLDER,
        fileLabel: 'TXT',
        mimeType: 'text/plain',
        fallbackToRoot: true,
    }),
    bluexpress: Object.freeze({
        key: 'bluexpress',
        label: 'Bluexpress',
        folder: 'BLUEXPRESS',
        aliases: ['BLUEXPRESS'],
        fileLabel: 'PDF',
        mimeType: 'application/pdf',
        fallbackToRoot: false,
    }),
    walmart: Object.freeze({
        key: 'walmart',
        label: 'Walmart',
        folder: 'WALLMART',
        aliases: ['WALMART'],
        fileLabel: 'PDF',
        mimeType: 'application/pdf',
        fallbackToRoot: false,
    }),
});

const PDF_LABEL_SOURCE_KEYS = Object.freeze(['bluexpress', 'walmart']);

// ─── FIX #8 — _keyStore: API Key ofuscada con base64 ──────────────────────────
// No es cifrado real (imposible sin backend), pero evita que la key quede
// legible en texto plano en localStorage. Prefix 'ds1:' identifica el formato
// y permite compatibilidad con versiones anteriores (plain text).

const _keyStore = {
    _PREFIX: 'ds1:',

    _encode(val) {
        try { return this._PREFIX + btoa(unescape(encodeURIComponent(val))); }
        catch { return val; }
    },

    _decode(raw) {
        try {
            if (raw.startsWith(this._PREFIX))
                return decodeURIComponent(escape(atob(raw.slice(this._PREFIX.length))));
            return raw;     // compatibilidad plain text legacy
        } catch { return null; }
    },

    save(key) {
        try { localStorage.setItem(DRIVE_CONFIG.API_KEY_KEY, this._encode(key.trim())); }
        catch (e) { console.warn('[DriveSync] No se pudo guardar API Key:', e); }
    },

    load() {
        try {
            const raw = localStorage.getItem(DRIVE_CONFIG.API_KEY_KEY);
            return raw ? this._decode(raw) : null;
        } catch { return null; }
    },

    exists() { return !!this.load(); },
    clear()  { try { localStorage.removeItem(DRIVE_CONFIG.API_KEY_KEY); } catch {} },
};

// ─── FIX #7 — _gapi: flag encapsulado ─────────────────────────────────────────
// En vez de un `let _gapiReady` suelto en el módulo, lo centralizamos aquí.
// Cambios en _gapiReady desde fuera del módulo ya no son posibles por accidente.

const _gapi = {
    _ready: false,
    get ready()  { return this._ready; },
    setReady()   { this._ready = true; },
    reset()      { this._ready = false; },
};

// ─── Token Store ───────────────────────────────────────────────────────────────

const _tokenStore = {
    save(tokenResponse) {
        const payload = {
            access_token: tokenResponse.access_token,
            expires_at:   Date.now() + (tokenResponse.expires_in ?? 3600) * 1000,
        };
        try { localStorage.setItem(DRIVE_CONFIG.TOKEN_KEY, JSON.stringify(payload)); }
        catch {}
        return payload;
    },

    load() {
        try {
            const raw = localStorage.getItem(DRIVE_CONFIG.TOKEN_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    isValid(margin = DRIVE_CONFIG.TOKEN_REFRESH_MARGIN) {
        const t = this.load();
        return !!(t?.access_token && t.expires_at > Date.now() + margin);
    },

    applyToGapi() {
        const t = this.load();
        if (t?.access_token) { gapi.client.setToken({ access_token: t.access_token }); return true; }
        return false;
    },

    clear() { try { localStorage.removeItem(DRIVE_CONFIG.TOKEN_KEY); } catch {} },
};

// ─── Procesados del día ────────────────────────────────────────────────────────

function _todayKey() {
    const d = new Date();
    return `drive_processed_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

// IDs procesados (Set) — evita reprocesar el mismo archivo
function _loadProcessedIds() {
    try {
        const saved = localStorage.getItem(_todayKey());
        return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
}

function _saveProcessedIds() {
    try { localStorage.setItem(_todayKey(), JSON.stringify([..._state.processedIds])); }
    catch {}
}

// Lista de display (Array) — persiste lo que se muestra en "Procesados hoy"
function _loadProcessedList() {
    try {
        const saved = localStorage.getItem(_todayKey() + '_list');
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
            ? parsed.map(item => ({ ...item, processedAt: new Date(item.processedAt) }))
            : [];
    } catch { return []; }
}

function _saveProcessedList() {
    try { localStorage.setItem(_todayKey() + '_list', JSON.stringify(_state.processed)); }
    catch {}
}

function _seenFilesKey() {
    return _todayKey() + '_seen_files';
}

function _loadSeenFiles() {
    try {
        const raw = localStorage.getItem(_seenFilesKey());
        const saved = raw ? JSON.parse(raw) : {};
        return {
            ids: new Set(Array.isArray(saved.ids) ? saved.ids : []),
            names: new Set(Array.isArray(saved.names) ? saved.names : []),
        };
    } catch {
        return { ids: new Set(), names: new Set() };
    }
}

const _initialSeenFiles = _loadSeenFiles();

function _saveSeenFiles() {
    try {
        localStorage.setItem(_seenFilesKey(), JSON.stringify({
            ids: [..._state.knownIds],
            names: [..._state.knownNames],
        }));
    } catch {}
}

// ─── FIX #6 — _state con Proxy ────────────────────────────────────────────────
// Valida tipos y valores al asignar. Errores de tipeo o asignaciones de tipo
// incorrecto generan un warning en consola y se ignoran silenciosamente,
// sin romper el flujo de la aplicación.

function _loadCarrierPrintedLabels() {
    try {
        const raw = localStorage.getItem(DRIVE_CONFIG.CARRIER_PRINTED_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function _saveCarrierPrintedLabels() {
    try {
        localStorage.setItem(DRIVE_CONFIG.CARRIER_PRINTED_KEY, JSON.stringify(_state.carrierPrinted || {}));
    } catch {}
}

function _carrierPrintKey(sourceKey, fileId) {
    const id = typeof fileId === 'object' ? fileId?.id : fileId;
    return sourceKey && id ? `${sourceKey}:${id}` : '';
}

function _getCarrierPrintedInfo(sourceKey, fileId) {
    const key = _carrierPrintKey(sourceKey, fileId);
    return key ? (_state.carrierPrinted?.[key] || null) : null;
}

function _formatCarrierPrintedAt(info) {
    if (!info?.printedAt) return '';
    return [_formatDriveDate(info.printedAt), _formatDriveTime(info.printedAt)].filter(Boolean).join(', ');
}

function _carrierPrintStatusText(info) {
    const printedAt = _formatCarrierPrintedAt(info);
    return info ? `Impresa${printedAt ? ` ${printedAt}` : ''}` : 'Pendiente';
}

function _carrierPrintStatusHtml(sourceKey, fileId) {
    const info = _getCarrierPrintedInfo(sourceKey, fileId);
    const stateClass = info ? 'is-printed' : 'is-pending';
    const label = info ? 'Impresa' : 'Pendiente';
    const title = _carrierPrintStatusText(info);
    return `<span class="carrier-print-status ${stateClass}" title="${_esc(title)}">${_esc(label)}</span>`;
}

function _markCarrierPrinted(entry) {
    const key = _carrierPrintKey(entry?.sourceKey, entry?.id);
    if (!key) return null;

    const info = {
        sourceKey: entry.sourceKey,
        fileId: entry.id,
        name: entry.name || '',
        printedAt: new Date().toISOString(),
    };
    _state.carrierPrinted = {
        ...(_state.carrierPrinted || {}),
        [key]: info,
    };
    _saveCarrierPrintedLabels();
    return info;
}

const _VALID_MODES = new Set(['auto', 'manual']);

const _stateRaw = {
    mode:         localStorage.getItem(DRIVE_CONFIG.MODE_KEY) || 'auto',
    isPolling:    false,
    pollTimer:    null,
    tokenClient:  null,
    knownIds:     _initialSeenFiles.ids,
    knownNames:   _initialSeenFiles.names,
    knownFiles:   [],
    carrierFiles: { bluexpress: [], walmart: [] },
    carrierPrinted: _loadCarrierPrintedLabels(),
    activeLabelSource: 'mercadolibre',
    pending:      [],
    processed:    _loadProcessedList(),
    processedIds: _loadProcessedIds(),
    arrivalAlertTimers: Object.create(null),
    panelOpen:    true,
    offsetDay:    0,
    _refreshing:  false,
    _scanning:    false,
    scanDayKey:   _todayKey(),
    folderCache:  Object.create(null),
    driveFileCache: Object.create(null),
    dayRequestSeq: 0,
};

const _state = new Proxy(_stateRaw, {
    set(target, key, value) {
        if (key === 'mode' && !_VALID_MODES.has(value)) {
            console.warn(`[DriveSync] mode inválido: "${value}". Usar: auto | manual`);
            return true;
        }
        if ((key === 'isPolling' || key === '_refreshing' || key === '_scanning') && typeof value !== 'boolean') {
            console.warn(`[DriveSync] ${key} debe ser boolean, recibido: ${typeof value}`);
            return true;
        }
        if (key === 'offsetDay' && !Number.isInteger(value)) {
            console.warn(`[DriveSync] offsetDay debe ser entero, recibido: ${value}`);
            return true;
        }
        target[key] = value;
        return true;
    },
});

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function _getMes(d = new Date()) { return `${MESES[d.getMonth()]} ${d.getFullYear()}`; }
function _getDia(d = new Date()) { return `${d.getDate()} ${MESES[d.getMonth()]}`; }
function _getOffsetDate(offset = 0) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
}

function _getOffsetDateKey(offset = 0) {
    const d = _getOffsetDate(offset);
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
    ].join('-');
}

function _timeStr(d = new Date()) {
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function _esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── FIX #2 — UI helpers sin inline styles ────────────────────────────────────

function _setStatus(text, active = false) {
    const s = document.getElementById('drive-sync-status');
    if (!s) return;
    s.textContent = text;
    s.classList.toggle('drive-sync-status--active', active);
    document.getElementById('drive-sync-panel')?.classList.toggle('is-monitoring', active);
}

function _setFileCount(n) {
    const el  = document.getElementById('drive-file-count');
    const num = document.getElementById('drive-file-count-num');
    const banner = document.getElementById('drive-alert-banner');
    const bannerText = document.getElementById('drive-alert-text');
    const dayStatus = document.getElementById('drive-day-status');
    if (!el) return;
    if (n === null || n === undefined) {
        el.style.display = 'none';
        if (banner) banner.hidden = true;
        dayStatus?.classList.remove('has-files');
        return;
    }
    el.style.display = 'flex';
    if (num) num.textContent = n;
    el.title = 'Ver archivos del día';
    el.classList.toggle('has-files', Number(n) > 0);
    const count = Number(n) || 0;
    dayStatus?.classList.toggle('has-files', count > 0);
    if (banner) {
        banner.hidden = count <= 0;
        banner.classList.toggle('is-active', count > 0);
    }
    if (bannerText) {
        bannerText.textContent = count === 1
            ? 'Se encontró 1 archivo disponible.'
            : `Se encontraron ${count} archivos disponibles.`;
    }
}

function _setToast(text, ok = true, timeout = 6000, urgent = false) {
    const t = document.getElementById('drive-sync-toast');
    if (!t) return;
    t.textContent = text;
    t.classList.toggle('drive-sync-toast--error', !ok);
    t.classList.toggle('drive-sync-toast--urgent', Boolean(urgent));
    t.classList.remove('ds-hidden');
    const snap = text;
    setTimeout(() => {
        if (t.textContent === snap) {
            t.classList.add('ds-hidden');
            t.classList.remove('drive-sync-toast--urgent');
        }
    }, timeout);
}

function _driveFolderUrl(folderId) {
    const id = folderId || DRIVE_CONFIG.ROOT_FOLDER_ID;
    return `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`;
}

async function _resolveDriveOpenUrl() {
    let folderId = DRIVE_CONFIG.ROOT_FOLDER_ID;

    try {
        if (typeof gapi !== 'undefined' && _gapi.ready && _getDriveAccessToken()) {
            folderId = await _getDayFolderId(_state.offsetDay || 0, 'mercadolibre', { silent: true }) || folderId;
        }
    } catch (error) {
        console.warn('[DriveSync] No se pudo resolver carpeta para abrir Drive:', error);
    }

    return _driveFolderUrl(folderId);
}

function _openDriveWindow(event) {
    if (event?.target?.closest?.('#drive-file-count, button, select, input, a')) return;

    const fallbackUrl = _driveFolderUrl(DRIVE_CONFIG.ROOT_FOLDER_ID);
    const popup = window.open(fallbackUrl, '_blank');

    if (!popup) {
        const message = 'El navegador bloqueo la ventana de Google Drive. Permite ventanas emergentes para esta pagina.';
        _setToast(message, false, 9000, true);
        _showAppAlert('Google Drive', message, 'warning', 9000);
        return;
    }

    try { popup.opener = null; } catch {}
    _setToast('Abriendo Google Drive...', true, 3500);

    _resolveDriveOpenUrl().then(url => {
        if (url && url !== fallbackUrl) popup.location.href = url;
    }).catch(error => console.warn('[DriveSync] No se pudo redirigir la ventana de Drive:', error));
}

function _showAppAlert(title, message, type = 'warning', timeout = 9000) {
    try {
        if (window.App?.ui?.showMessage) {
            window.App.ui.showMessage(message, type, { title, timeout });
            return;
        }

        if (window.App?.notifications?.record) {
            window.App.notifications.record({ title, message, type });
            window.App.notifications.updateBadge?.();
        }
    } catch (error) {
        console.warn('[DriveSync] No se pudo registrar alerta en la app:', error);
    }
}

function _notifyNative(title, body, tag) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    try {
        new Notification(title, {
            body,
            icon: DRIVE_CONFIG.ALERT_ICON,
            tag,
            renotify: true,
            requireInteraction: true,
        });
    } catch (error) {
        console.warn('[DriveSync] No se pudo mostrar notificacion nativa:', error);
    }
}

function _pulseAlertTargets() {
    const panel = document.getElementById('drive-sync-panel');
    if (panel) {
        panel.classList.remove('drive-panel--urgent');
        void panel.offsetWidth;
        panel.classList.add('drive-panel--urgent');
        window.setTimeout(() => panel.classList.remove('drive-panel--urgent'), 12000);
    }

    [
        document.getElementById('notificationBellBtn'),
        panel,
        document.getElementById('drive-file-count'),
    ].filter(Boolean).forEach((el) => {
        el.classList.remove('drive-alert-pulse');
        void el.offsetWidth;
        el.classList.add('drive-alert-pulse');
        window.setTimeout(() => el.classList.remove('drive-alert-pulse'), 5200);
    });
}

function _clearArrivalReminders(fileId) {
    const key = String(fileId || '');
    if (!key || !_state.arrivalAlertTimers[key]) return;
    _state.arrivalAlertTimers[key].forEach(timerId => window.clearTimeout(timerId));
    delete _state.arrivalAlertTimers[key];
}

function _clearAllArrivalReminders() {
    Object.keys(_state.arrivalAlertTimers).forEach(_clearArrivalReminders);
}

function _hasPendingFile(fileId) {
    return _state.pending.some(item => item.id === fileId);
}

function _scheduleArrivalReminders({ fileId, title, message, pendingOnly = false }) {
    const key = String(fileId || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`);
    const delays = pendingOnly
        ? [...DRIVE_CONFIG.ARRIVAL_REPEAT_DELAYS, ...DRIVE_CONFIG.PENDING_REMINDER_DELAYS]
        : DRIVE_CONFIG.ARRIVAL_REPEAT_DELAYS;

    _clearArrivalReminders(key);
    _state.arrivalAlertTimers[key] = delays.map((delay, index) => window.setTimeout(() => {
        if (pendingOnly && !_hasPendingFile(fileId)) {
            _clearArrivalReminders(key);
            return;
        }

        const reminderMessage = pendingOnly
            ? `${message}. Sigue pendiente de procesar.`
            : message;

        _audioAlert(index >= 2 ? 'warning' : 'arrival');
        _setToast(reminderMessage, true, 10000, true);
        _notifyNative(title, reminderMessage, `drive-alert-${key}`);
        _showAppAlert(title, reminderMessage, 'warning', 9000);
        _pulseAlertTargets();

        if (index === delays.length - 1) {
            delete _state.arrivalAlertTimers[key];
        }
    }, delay));
}

function _announceDriveArrival({ title, message, fileId, pendingOnly = false }) {
    _audioAlert('arrival');
    _setToast(message, true, 10000, true);
    _notifyNative(title, message, `drive-arrival-${fileId || Date.now()}`);
    _showAppAlert(title, message, 'warning', 9000);
    _pulseAlertTargets();
    _scheduleArrivalReminders({ fileId, title, message, pendingOnly });
}

function _announceDriveProcessed({ name, bulkCount, picker, fileId, autoOutput = false }) {
    const message = `"${name}" procesado: ${bulkCount} pedido${bulkCount !== 1 ? 's' : ''} para ${picker}${autoOutput ? '. Descarga e impresion automatica ejecutadas.' : '.'}`;
    _audioAlert('arrival');
    _setToast(message, true, 12000, true);
    _notifyNative('Etiqueta procesada', message, `drive-processed-${fileId || Date.now()}`);
    _showAppAlert('Etiqueta procesada', message, 'warning', 12000);
    _pulseAlertTargets();
    _scheduleArrivalReminders({
        fileId: `processed-${fileId || Date.now()}`,
        title: 'Etiqueta procesada',
        message,
        pendingOnly: false,
    });
}

function _restoreConnectBtn() {
    const btn = document.getElementById('drive-sync-btn');
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg> ${_keyStore.exists() ? 'Reconectar Drive' : 'Conectar Drive'}`;
}

// ─── FIX #1 — API Key inline (sin window.prompt) ──────────────────────────────

function _showApiKeyInput() {
    const panel = document.getElementById('drive-sync-panel');
    if (!panel || document.getElementById('drive-apikey-row')) return;

    const row = document.createElement('div');
    row.id        = 'drive-apikey-row';
    row.className = 'ds-apikey-row';
    row.innerHTML = `
        <input id="drive-apikey-input" name="driveApiKey" type="password" class="ds-apikey-input"
               placeholder="Google API Key…" autocomplete="off" spellcheck="false" />
        <button id="drive-apikey-save" class="ds-btn ds-btn--save">Guardar</button>`;

    const anchor = panel.querySelector('.drive-user-action-row') ?? panel.querySelector('.lp-drive-btns-row');
    panel.insertBefore(row, anchor?.parentElement === panel ? anchor : null);

    const input = row.querySelector('#drive-apikey-input');
    const save  = row.querySelector('#drive-apikey-save');
    const doSave = () => {
        const val = input.value.trim();
        if (!val) { input.classList.add('ds-apikey-input--error'); return; }
        input.classList.remove('ds-apikey-input--error');
        _keyStore.save(val);
        row.remove();
        _gapi.reset();
        DriveSync.connect();
    };
    save.addEventListener('click', doSave);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSave(); });
}

function _removeApiKeyInput() {
    document.getElementById('drive-apikey-row')?.remove();
}

// ─── FIX #2 — _applyMode con clases CSS ──────────────────────────────────────

function _applyMode() {
    document.getElementById('drive-mode-auto')?.classList.toggle('is-active', _state.mode === 'auto');
    document.getElementById('drive-mode-manual')?.classList.toggle('is-active', _state.mode === 'manual');
    _renderDrivePickerControl();
    _renderPending();
}

// ─── FIX #2 + #4 — Render pendientes ─────────────────────────────────────────

function _renderPending() {
    const section = document.getElementById('drive-pending-section');
    const list    = document.getElementById('drive-pending-list');
    const noPend  = document.getElementById('drive-no-pending');
    if (!list || !section) return;

    const panel = document.getElementById('drive-sync-panel');
    const pendingCount = _state.pending.length;
    const label = section.querySelector('.lp-pending-label');
    section.classList.toggle('has-pending', pendingCount > 0);
    panel?.classList.toggle('drive-has-pending', _state.mode === 'manual' && pendingCount > 0);
    if (label) {
        label.innerHTML = pendingCount > 0
            ? `<span>Pendientes</span><strong>${pendingCount}</strong>`
            : `<span>Pendientes</span>`;
    }

    if (_state.mode !== 'manual') { section.style.display = 'none'; return; }
    section.style.display = 'flex';

    list.querySelectorAll('.ds-pending-row').forEach(r => r.remove());

    if (pendingCount === 0) {
        if (noPend) noPend.style.display = 'block';
        return;
    }
    if (noPend) noPend.style.display = 'none';

    const opts = _getPickerOptions();
    const selectedPicker = _getAutoPickerValue();
    const frag = document.createDocumentFragment();

    for (const item of _sortPendingNewestFirst(_state.pending)) {
        const optHtml = opts.map(o =>
            `<option value="${_esc(o.v)}"
                ${o.v.toLowerCase() === selectedPicker.toLowerCase() ? 'selected' : ''}>
                ${_esc(o.l)}</option>`
        ).join('');

        const row = document.createElement('div');
        row.className  = 'ds-pending-row';
        row.dataset.id = item.id;
        row.innerHTML  = `
            <div class="ds-pending-header">
                <span class="ds-pending-name" title="${_esc(item.name)}">${_esc(item.name)}</span>
                <span class="ds-pending-time">
                    ${item.uploadedAt
                        ? `${_formatDriveDate(item.uploadedAt)} · ${_formatDriveTime(item.uploadedAt)}`
                        : _timeStr(item.detectedAt)}
                </span>
            </div>
            <div class="ds-pending-tags">
                <span class="ds-tag ds-tag--folder">${_esc(item.folder || 'Drive')}</span>
                <span class="ds-tag ds-tag--bulk">${item.bulkCount} bulto${item.bulkCount !== 1 ? 's' : ''}</span>
                <span class="ds-tag ds-tag--pending">Pendiente</span>
            </div>
            <div class="ds-pending-actions">
                <select class="ds-pending-select" id="drive-pending-picker-${_esc(item.id)}" name="drivePendingPicker">${optHtml}</select>
                <button class="ds-btn ds-btn--process">Procesar</button>
                <button class="ds-btn ds-btn--dismiss">✕</button>
            </div>`;
        frag.appendChild(row);
    }
    list.appendChild(frag);
}

// FIX #4 — Un solo listener delegado, registrado una vez
function _initPendingListeners() {
    const list = document.getElementById('drive-pending-list');
    if (!list || list.dataset.delegated) return;
    list.dataset.delegated = '1';

    list.addEventListener('click', async (e) => {
        const row = e.target.closest('.ds-pending-row');
        if (!row) return;
        const id = row.dataset.id;

        if (e.target.closest('.ds-btn--process')) {
            const picker = row.querySelector('.ds-pending-select')?.value || _getAutoPickerValue();
            const btn    = row.querySelector('.ds-btn--process');
            if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }
            await DriveSync.processItem(id, picker);
        } else if (e.target.closest('.ds-btn--dismiss')) {
            DriveSync.dismissItem(id);
        }
    });
}

// ─── FIX #2 — Render procesados ───────────────────────────────────────────────

function _renderProcessed() {
    const list    = document.getElementById('drive-processed-list');
    const section = document.getElementById('drive-processed-section');
    if (!list || !section) return;

    if (_state.processed.length === 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    list.innerHTML = '';

    const frag = document.createDocumentFragment();
    for (const item of [..._state.processed].reverse()) {
        const row = document.createElement('div');
        row.className = 'ds-proc-row';
        row.innerHTML = `
            <span class="ds-proc-name" title="${_esc(item.name)}">✅ ${_esc(item.name)}</span>
            <div class="ds-proc-meta">
                <span class="ds-proc-picker">${_esc(item.picker)}</span>
                <span class="ds-tag ds-tag--bulk">${item.bulkCount} bulto${item.bulkCount !== 1 ? 's' : ''}</span>
                <span class="ds-proc-time">${_timeStr(item.processedAt)}</span>
            </div>`;
        frag.appendChild(row);
    }
    list.appendChild(frag);
}

// ─── FIX #2 + #4 — Panel archivos existentes ─────────────────────────────────
// El panel y sus listeners se crean UNA sola vez.
// Solo se actualiza el contenido de header y body en cada render.

function _renderExistingPanel() {
    let panel = document.getElementById('drive-existing-panel');

    if (!panel) {
        panel = document.createElement('div');
        panel.id        = 'drive-existing-panel';
        panel.className = 'ds-ep-panel';

        const header = document.createElement('div');
        header.id        = 'drive-ep-header';
        header.className = 'ds-ep-header';

        const body = document.createElement('div');
        body.id        = 'drive-ep-body';
        body.className = 'ds-ep-body';

        panel.appendChild(header);
        panel.appendChild(body);
        document.getElementById('drive-sync-panel')?.appendChild(panel);

        // FIX #4: listener registrado UNA SOLA VEZ en el panel
        panel.addEventListener('click', async (e) => {
            if (e.target.closest('.ds-ep-close'))    { _state.panelOpen = true; _renderExistingPanel(); return; }
            if (e.target.closest('[data-ep-prev]'))  { DriveSync.changeDay(-1); return; }
            if (e.target.closest('[data-ep-next]'))  { DriveSync.changeDay(1);  return; }

            const btn = e.target.closest('.ds-ep-btn-process');
            if (btn && !btn.disabled) {
                const fileId = btn.dataset.fileId;
                const sel    = panel.querySelector(`.ds-ep-select[data-file-id="${CSS.escape(fileId)}"]`);
                const picker = sel?.value || _getAutoPickerValue();
                btn.disabled    = true;
                btn.textContent = 'Procesando...';
                await DriveSync.processExisting(fileId, picker);
            }
        });
    }

    const header = document.getElementById('drive-ep-header');
    const body   = document.getElementById('drive-ep-body');

    // ── Header ──
    const offsetD  = new Date();
    offsetD.setDate(offsetD.getDate() + _state.offsetDay);
    const diaStr   = _getDia(offsetD);
    const dayLabel = _state.offsetDay === 0  ? `HOY · ${diaStr}`
                   : _state.offsetDay === -1 ? `AYER · ${diaStr}`
                   : _state.offsetDay ===  1 ? `MAÑANA · ${diaStr}`
                   : diaStr;
    const count = _state.knownFiles.length;

    header.innerHTML = `
        <div class="ds-ep-nav">
            <button class="ds-ep-btn-nav" type="button" data-ep-prev aria-label="Dia anterior">‹</button>
            <div class="ds-ep-title-wrap">
                <span class="ds-ep-title">${dayLabel}</span>
                <span class="ds-ep-subtitle">${count} archivo${count !== 1 ? 's' : ''}</span>
            </div>
            <button class="ds-ep-btn-nav" type="button" data-ep-next aria-label="Dia siguiente">›</button>
        </div>
        <button class="ds-ep-close" type="button" aria-label="Lista de archivos siempre visible" hidden>×</button>`;

    // ── Body ──
    const opts    = _getPickerOptions();
    const selectedPicker = _getAutoPickerValue();
    const optHtml = opts.map(o =>
        `<option value="${_esc(o.v)}" ${o.v.toLowerCase() === selectedPicker.toLowerCase() ? 'selected' : ''}>${_esc(o.l)}</option>`
    ).join('');

    if (_state.knownFiles.length === 0) {
        body.innerHTML = `<div class="ds-ep-empty">Sin archivos en esta carpeta.</div>`;
    } else {
        const frag = document.createDocumentFragment();
        const orderedFiles = _sortDriveFilesNewestFirst(_state.knownFiles);
        for (const f of orderedFiles) {
            const isDone = _state.processedIds.has(f.id);
            const row    = document.createElement('div');
            row.className = `ds-ep-file-row${isDone ? ' ds-ep-file-row--done' : ''}`;
            const uploadDate = _formatDriveDate(f.createdTime);
            const uploadTime = _formatDriveTime(f.createdTime);
            const folderName = f.folder || 'Drive';
            const folderKey = _normalizeFolder(folderName);
            const typeKey = folderKey.includes('colecta') ? 'colecta'
                : folderKey.includes('flex') ? 'flex'
                : '';
            const typeLabel = typeKey ? typeKey.toUpperCase() : '';
            row.innerHTML = `
                <div class="ds-ep-file-top">
                    <span class="ds-ep-file-kind">TXT</span>
                    <div class="ds-ep-file-copy">
                        <span class="ds-ep-file-name" title="${_esc(f.name)}">${_esc(f.name)}</span>
                        <span class="ds-ep-file-folder">${_esc(folderName)}</span>
                    </div>
                    <div class="ds-ep-file-meta">
                        ${uploadDate ? `<span class="ds-ep-file-date">${uploadDate}</span>` : ''}
                        ${uploadTime ? `<span class="ds-ep-file-time">${uploadTime}</span>` : ''}
                    </div>
                </div>
                <div class="ds-ep-file-actions${isDone ? ' is-done' : ''}">
                    ${isDone
                        ? `<span class="ds-ep-done-badge">Procesado</span>${typeLabel ? `<span class="ds-ep-type-chip ds-ep-type-chip--${typeKey}">${typeLabel}</span>` : ''}`
                        : `<select class="ds-ep-select" id="drive-existing-picker-${_esc(f.id)}" name="driveExistingPicker" data-file-id="${_esc(f.id)}">${optHtml}</select>
                           <button class="ds-btn ds-btn--process ds-ep-btn-process"
                               data-file-id="${_esc(f.id)}">Procesar</button>`
                    }
                </div>`;
            frag.appendChild(row);
        }
        body.replaceChildren(frag);
        const processedCount = orderedFiles.filter(f => _state.processedIds.has(f.id)).length;
        const summary = document.createElement('div');
        summary.className = 'ds-ep-summary';
        summary.textContent = processedCount === _state.knownFiles.length
            ? 'Todo actualizado'
            : `${processedCount} de ${_state.knownFiles.length} procesados`;
        body.appendChild(summary);
    }

    _state.panelOpen = true;
    panel.style.display = 'block';
}

function _updateLabelSourceControls() {
    const active = _state.activeLabelSource || 'mercadolibre';

    document.querySelectorAll('.stat-item--carrier[data-label-source]').forEach(btn => {
        const isActive = btn.dataset.labelSource === active;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
}

function _updateCarrierStats() {
    const blueCount = _state.carrierFiles.bluexpress?.length || 0;
    const walmartCount = _state.carrierFiles.walmart?.length || 0;
    const blueEl = document.getElementById('countBluexpress');
    const walmartEl = document.getElementById('countWalmart');
    if (blueEl) blueEl.textContent = String(blueCount);
    if (walmartEl) walmartEl.textContent = String(walmartCount);
}

function _getActiveCarrierFiles(sourceKey = _state.activeLabelSource) {
    return _state.carrierFiles[sourceKey] || [];
}

function _renderCarrierPanel() {
    _updateCarrierStats();
    _updateLabelSourceControls();

    const active = _state.activeLabelSource || 'mercadolibre';
    const isCarrier = active !== 'mercadolibre';
    const source = _getSourceConfig(active);
    const results = document.getElementById('results');
    const table = document.querySelector('#results .table-container');
    const panel = document.getElementById('carrierLabelsPanel');
    const pdfPrinter = document.getElementById('pdfLabelPrinter');

    if (results) results.classList.toggle('is-carrier-label-mode', isCarrier);
    if (table) table.classList.toggle('is-hidden', isCarrier);
    if (panel) panel.classList.toggle('is-hidden', !isCarrier);
    if (pdfPrinter) pdfPrinter.classList.toggle('is-hidden', !isCarrier);

    if (!isCarrier) return;

    const files = _getActiveCarrierFiles(active);
    const title = document.getElementById('carrierLabelsTitle');
    const summary = document.getElementById('carrierLabelsSummary');
    const body = document.getElementById('carrierLabelsBody');
    const meta = document.getElementById('resultsMeta');
    const printAllBtn = document.getElementById('carrierPrintAllBtn');

    if (title) title.textContent = `Etiquetas ${source.label}`;
    if (summary) {
        summary.textContent = files.length
            ? `${files.length} archivo(s) PDF detectado(s) en Drive.`
            : `Sin PDFs detectados en ${source.folder}.`;
    }
    if (meta) {
        meta.textContent = files.length
            ? `Mostrando ${files.length} etiqueta(s) PDF de ${source.label}.`
            : `No hay etiquetas PDF de ${source.label} para mostrar.`;
    }
    if (printAllBtn) {
        printAllBtn.disabled = files.length === 0;
        printAllBtn.dataset.carrierPrintAllSource = active;
        printAllBtn.title = files.length
            ? `Imprimir ${files.length} etiqueta(s) PDF de ${source.label}`
            : `No hay etiquetas PDF de ${source.label} para imprimir`;
    }
    if (!body) return;

    if (files.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="carrier-empty">Sin archivos PDF de ${_esc(source.label)} para mostrar.</td></tr>`;
        return;
    }

    body.innerHTML = files.map(file => {
        const date = _formatDriveDate(file.createdTime || file.modifiedTime);
        const time = _formatDriveTime(file.createdTime || file.modifiedTime);
        const folder = file.folder || source.folder;
        return `
            <tr>
                <td>
                    <div class="carrier-file-main">
                        <strong>${_esc(file.name)}</strong>
                        <span>${_esc(source.fileLabel)} desde Google Drive</span>
                    </div>
                </td>
                <td><span class="carrier-source-pill">${_esc(folder)}</span></td>
                <td>
                    <div class="meta-cell">
                        <strong>${_esc(date || 'Sin fecha')}</strong>
                        <span>${_esc(time || '')}</span>
                    </div>
                </td>
                <td>${_carrierPrintStatusHtml(active, file.id)}</td>
                <td>
                    <div class="carrier-row-actions">
                        <button class="carrier-preview-btn" type="button"
                            data-carrier-preview-source="${_esc(active)}"
                            data-carrier-preview-file-id="${_esc(file.id)}">Visualizar</button>
                        <button class="carrier-open-btn" type="button"
                            data-carrier-source="${_esc(active)}"
                            data-carrier-file-id="${_esc(file.id)}">${_getCarrierPrintedInfo(active, file.id) ? 'Reimprimir' : 'Imprimir'}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function _setActiveLabelSource(sourceKey) {
    const source = _getSourceConfig(sourceKey);
    _state.activeLabelSource = source.key;
    _renderCarrierPanel();

    if (source.key === 'mercadolibre') {
        window.App?.table?.renderCurrentResults?.();
        return;
    }

    if (source.key !== 'mercadolibre' && _state.isPolling && _getActiveCarrierFiles(source.key).length === 0) {
        _refreshCarrierLabels(true);
    }
}

async function _printAllCarrierFilesToZebra(sourceKey, button) {
    const source = _getSourceConfig(sourceKey || _state.activeLabelSource);
    const files = _getActiveCarrierFiles(source.key);

    if (!PDF_LABEL_SOURCE_KEYS.includes(source.key)) {
        _setToast('Selecciona Bluexpress o Walmart para imprimir etiquetas PDF.', false);
        return;
    }
    if (!files.length) {
        _setToast(`No hay etiquetas PDF de ${source.label} para imprimir.`, false);
        return;
    }

    const app = window.App;
    if (!app?.pdfLabels?.printPdfBlob) {
        _setToast('El impresor PDF Zebra no esta disponible. Recarga la pagina.', false);
        return;
    }

    const originalText = button?.textContent || 'Imprimir todo';
    if (button) {
        button.disabled = true;
        button.textContent = `0/${files.length}`;
    }

    let printed = 0;
    try {
        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            const entry = {
                sourceKey: source.key,
                id: file.id,
                name: file.name || `Etiqueta ${source.label}`,
            };

            if (button?.isConnected) button.textContent = `${index + 1}/${files.length}`;
            _setToast(`Imprimiendo ${index + 1}/${files.length}: ${entry.name}`);

            const blob = await _downloadDriveBlob(file.id, 'application/pdf');
            await app.pdfLabels.printPdfBlob(blob, entry.name, {
                onProgress: message => _setToast(`${index + 1}/${files.length}: ${message}`)
            });

            _markCarrierPrinted(entry);
            printed += 1;
        }

        _renderCarrierPanel();
        _setToast(`${printed} etiqueta(s) de ${source.label} enviada(s) a Zebra.`);
    } catch (err) {
        console.warn('[DriveSync] printAllCarrierFilesToZebra:', err);
        _renderCarrierPanel();
        _setToast(`Se imprimieron ${printed} de ${files.length}. ${err?.message || 'No se pudo completar la impresion masiva.'}`, false);
    } finally {
        if (button?.isConnected) {
            button.disabled = files.length === 0;
            button.textContent = originalText;
        }
    }
}

async function _printCarrierFileToZebra(sourceKey, fileId, button) {
    const source = _getSourceConfig(sourceKey);
    const file = (_state.carrierFiles[sourceKey] || []).find(item => item.id === fileId);
    if (!file?.id) {
        _setToast('No se pudo encontrar el PDF de Drive.', false);
        return;
    }

    const printedInfo = _getCarrierPrintedInfo(source.key, file.id);
    if (printedInfo) {
        const when = _formatCarrierPrintedAt(printedInfo);
        const ok = window.confirm(`Esta etiqueta ya figura como impresa${when ? ` (${when})` : ''}. Quieres imprimirla otra vez?`);
        if (!ok) return;
    }

    const app = window.App;
    if (!app?.pdfLabels?.printPdfBlob) {
        _setToast('El impresor PDF Zebra no esta disponible. Recarga la pagina.', false);
        return;
    }

    const originalText = button?.textContent || 'Imprimir';
    if (button) {
        button.disabled = true;
        button.textContent = 'Imprimiendo...';
    }

    try {
        _setToast(`Preparando ${file.name || `Etiqueta ${source.label}`} para Zebra...`);
        const blob = await _downloadDriveBlob(file.id, 'application/pdf');
        const entry = {
            sourceKey: source.key,
            id: file.id,
            name: file.name || `Etiqueta ${source.label}`,
        };
        const result = await app.pdfLabels.printPdfBlob(blob, entry.name, {
            onProgress: message => _setToast(message)
        });

        _markCarrierPrinted(entry);
        _renderCarrierPanel();
        _setToast(`${entry.name} enviada a ${result.printer}.`);
    } catch (err) {
        console.warn('[DriveSync] printCarrierFileToZebra:', err);
        _setToast(err?.message || 'No se pudo imprimir el PDF de Drive en Zebra.', false);
    } finally {
        if (button?.isConnected) {
            button.disabled = false;
            button.textContent = _getCarrierPrintedInfo(source.key, file.id) ? 'Reimprimir' : originalText;
        }
    }
}

async function _previewCarrierFile(sourceKey, fileId, button) {
    const source = _getSourceConfig(sourceKey);
    const file = (_state.carrierFiles[source.key] || []).find(item => item.id === fileId);
    if (!file?.id) {
        _setToast('No se pudo encontrar el PDF de Drive.', false);
        return;
    }

    const originalText = button?.textContent || 'Visualizar';
    if (button) {
        button.disabled = true;
        button.textContent = 'Cargando...';
    }

    try {
        _setToast(`Preparando vista de ${file.name || `Etiqueta ${source.label}`}...`);
        const blob = await _downloadDriveBlob(file.id, 'application/pdf');
        const date = _formatDriveDate(file.createdTime || file.modifiedTime) || 'Sin fecha';
        const time = _formatDriveTime(file.createdTime || file.modifiedTime) || '';
        const folder = file.folder || source.folder;

        _showCarrierPrintModal(source, [{
            sourceKey: source.key,
            id: file.id,
            name: file.name || `Etiqueta ${source.label}`,
            meta: [folder, date, time].filter(Boolean).join(' - '),
            url: URL.createObjectURL(blob),
            blob,
            printedInfo: _getCarrierPrintedInfo(source.key, file.id),
        }]);
        _setToast(`${file.name || `Etiqueta ${source.label}`} lista para visualizar.`);
    } catch (err) {
        console.warn('[DriveSync] previewCarrierFile:', err);
        _setToast(err?.message || 'No se pudo visualizar el PDF de Drive.', false);
    } finally {
        if (button?.isConnected) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

function _cleanupCarrierPrintEntries() {
    for (const entry of _carrierPrintState.entries) {
        if (entry?.url) URL.revokeObjectURL(entry.url);
    }
    _carrierPrintState.entries = [];
    _carrierPrintState.activeIndex = 0;
}

function _ensureCarrierPrintModal() {
    let modal = document.getElementById('carrierPrintModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'carrierPrintModal';
    modal.className = 'carrier-print-modal';
    modal.hidden = true;
    modal.innerHTML = `
        <div class="carrier-print-backdrop" data-carrier-print-close></div>
        <section class="carrier-print-dialog" role="dialog" aria-modal="true" aria-labelledby="carrierPrintTitle">
            <header class="carrier-print-head">
                <div>
                    <span class="carrier-print-kicker" id="carrierPrintKicker">Etiquetas PDF</span>
                    <h2 id="carrierPrintTitle">Etiquetas</h2>
                    <p id="carrierPrintMeta">Selecciona un PDF para revisar e imprimir.</p>
                </div>
                <button class="carrier-print-close" type="button" data-carrier-print-close aria-label="Cerrar visor">x</button>
            </header>
            <div class="carrier-print-body">
                <aside class="carrier-print-side">
                    <label for="carrierPrintSelect">Archivo PDF</label>
                    <select id="carrierPrintSelect" name="carrierPrintSelect"></select>
                    <div class="carrier-print-file-list" id="carrierPrintFileList"></div>
                </aside>
                <div class="carrier-print-viewer">
                    <iframe id="carrierPrintFrame" title="Vista de etiqueta PDF"></iframe>
                </div>
            </div>
            <footer class="carrier-print-actions">
                <button class="carrier-print-secondary" type="button" data-carrier-print-close>Cerrar</button>
                <button class="carrier-print-primary" id="carrierPrintPrintBtn" type="button">Imprimir en Zebra</button>
            </footer>
        </section>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', event => {
        const closeBtn = event.target.closest('[data-carrier-print-close]');
        if (closeBtn && modal.contains(closeBtn)) {
            _closeCarrierPrintModal();
            return;
        }

        const fileBtn = event.target.closest('[data-carrier-print-index]');
        if (fileBtn && modal.contains(fileBtn)) {
            _setCarrierPrintActiveIndex(Number(fileBtn.dataset.carrierPrintIndex) || 0);
        }
    });

    modal.querySelector('#carrierPrintSelect')?.addEventListener('change', event => {
        _setCarrierPrintActiveIndex(Number(event.target.value) || 0);
    });

    modal.querySelector('#carrierPrintPrintBtn')?.addEventListener('click', _printCurrentCarrierPdf);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.hidden) _closeCarrierPrintModal();
    });

    return modal;
}

function _closeCarrierPrintModal() {
    const modal = document.getElementById('carrierPrintModal');
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove('carrier-print-lock');
    const frame = modal.querySelector('#carrierPrintFrame');
    if (frame) frame.removeAttribute('src');
    _cleanupCarrierPrintEntries();

    if (_carrierPrintState.lastFocused && typeof _carrierPrintState.lastFocused.focus === 'function') {
        _carrierPrintState.lastFocused.focus();
    }
}

function _renderCarrierPrintMessage(source, message, isError = false) {
    const modal = _ensureCarrierPrintModal();
    _cleanupCarrierPrintEntries();
    _carrierPrintState.lastFocused = document.activeElement;

    modal.querySelector('#carrierPrintKicker').textContent = source.label;
    modal.querySelector('#carrierPrintTitle').textContent = `Etiquetas ${source.label}`;
    modal.querySelector('#carrierPrintMeta').textContent = message;
    modal.querySelector('#carrierPrintSelect').innerHTML = '';
    modal.querySelector('#carrierPrintFileList').innerHTML = `<div class="carrier-print-empty${isError ? ' is-error' : ''}">${_esc(message)}</div>`;
    modal.querySelector('#carrierPrintPrintBtn').disabled = true;
    modal.querySelector('#carrierPrintFrame')?.removeAttribute('src');

    modal.hidden = false;
    document.body.classList.add('carrier-print-lock');
}

function _syncCarrierPrintStatusUi() {
    const modal = document.getElementById('carrierPrintModal');
    if (!modal) return;

    _carrierPrintState.entries.forEach((entry, index) => {
        const info = _getCarrierPrintedInfo(entry.sourceKey, entry.id);
        entry.printedInfo = info;

        const button = modal.querySelector(`[data-carrier-print-index="${index}"]`);
        if (button) {
            button.classList.toggle('is-printed', !!info);
            const status = button.querySelector('.carrier-print-file-status');
            if (status) {
                status.classList.toggle('is-printed', !!info);
                status.classList.toggle('is-pending', !info);
                status.textContent = _carrierPrintStatusText(info);
            }
        }

        const option = modal.querySelector(`#carrierPrintSelect option[value="${index}"]`);
        if (option) {
            option.textContent = `${info ? 'Impresa - ' : ''}${entry.name}`;
        }
    });
}

function _setCarrierPrintActiveIndex(index) {
    const modal = _ensureCarrierPrintModal();
    const entries = _carrierPrintState.entries;
    if (!entries.length) return;

    const nextIndex = Math.max(0, Math.min(index, entries.length - 1));
    const entry = entries[nextIndex];
    _carrierPrintState.activeIndex = nextIndex;

    const select = modal.querySelector('#carrierPrintSelect');
    const frame = modal.querySelector('#carrierPrintFrame');
    const printBtn = modal.querySelector('#carrierPrintPrintBtn');
    const meta = modal.querySelector('#carrierPrintMeta');
    const printedInfo = _getCarrierPrintedInfo(entry.sourceKey, entry.id);
    entry.printedInfo = printedInfo;

    if (select) select.value = String(nextIndex);
    if (frame) {
        frame.dataset.loaded = '0';
        frame.src = entry.url;
    }
    if (printBtn) {
        printBtn.disabled = false;
        printBtn.textContent = printedInfo ? 'Reimprimir en Zebra' : 'Imprimir en Zebra';
        printBtn.classList.toggle('is-reprint', !!printedInfo);
    }
    if (meta) {
        meta.textContent = printedInfo
            ? `Esta etiqueta ya fue marcada como impresa: ${_carrierPrintStatusText(printedInfo)}.`
            : `${entries.length} PDF(s) listo(s). Visualiza la etiqueta y presiona Imprimir en Zebra.`;
    }

    modal.querySelectorAll('[data-carrier-print-index]').forEach(button => {
        const isActive = Number(button.dataset.carrierPrintIndex) === nextIndex;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
    _syncCarrierPrintStatusUi();
}

function _showCarrierPrintModal(source, entries) {
    const modal = _ensureCarrierPrintModal();
    _cleanupCarrierPrintEntries();
    _carrierPrintState.entries = entries;
    _carrierPrintState.lastFocused = document.activeElement;

    modal.querySelector('#carrierPrintKicker').textContent = source.label;
    modal.querySelector('#carrierPrintTitle').textContent = `Etiquetas ${source.label}`;
    modal.querySelector('#carrierPrintMeta').textContent = `${entries.length} PDF(s) listo(s). Visualiza la etiqueta y presiona Imprimir en Zebra.`;

    const select = modal.querySelector('#carrierPrintSelect');
    const list = modal.querySelector('#carrierPrintFileList');
    if (select) {
        select.innerHTML = entries.map((entry, index) => {
            const info = _getCarrierPrintedInfo(entry.sourceKey, entry.id);
            return `<option value="${index}">${_esc(`${info ? 'Impresa - ' : ''}${entry.name}`)}</option>`;
        }).join('');
    }
    if (list) {
        list.innerHTML = entries.map((entry, index) => {
            const info = _getCarrierPrintedInfo(entry.sourceKey, entry.id);
            entry.printedInfo = info;
            return `
            <button class="carrier-print-file${info ? ' is-printed' : ''}" type="button" data-carrier-print-index="${index}" aria-pressed="false">
                <strong>${_esc(entry.name)}</strong>
                <span class="carrier-print-file-meta">${_esc(entry.meta)}</span>
                <span class="carrier-print-file-status ${info ? 'is-printed' : 'is-pending'}">${_esc(_carrierPrintStatusText(info))}</span>
            </button>
        `;
        }).join('');
    }

    const frame = modal.querySelector('#carrierPrintFrame');
    if (frame) {
        frame.onload = () => { frame.dataset.loaded = '1'; };
    }

    modal.hidden = false;
    document.body.classList.add('carrier-print-lock');
    _setCarrierPrintActiveIndex(0);
    modal.querySelector('#carrierPrintPrintBtn')?.focus();
}

async function _printCurrentCarrierPdf() {
    const modal = _ensureCarrierPrintModal();
    const button = modal.querySelector('#carrierPrintPrintBtn');
    const entry = _carrierPrintState.entries[_carrierPrintState.activeIndex];

    if (!entry?.id) {
        _setToast('Selecciona un PDF para imprimir.', false);
        return;
    }

    const printedInfo = entry ? _getCarrierPrintedInfo(entry.sourceKey, entry.id) : null;
    if (printedInfo) {
        const when = _formatCarrierPrintedAt(printedInfo);
        const ok = window.confirm(`Esta etiqueta ya figura como impresa${when ? ` (${when})` : ''}. Quieres imprimirla otra vez?`);
        if (!ok) return;
    }

    const app = window.App;
    if (!app?.pdfLabels?.printPdfBlob) {
        _setToast('El impresor PDF Zebra no esta disponible. Recarga la pagina.', false);
        return;
    }

    const originalText = button?.textContent || 'Imprimir en Zebra';
    if (button) {
        button.disabled = true;
        button.textContent = 'Imprimiendo...';
    }

    try {
        const blob = entry.blob || await _downloadDriveBlob(entry.id, 'application/pdf');
        entry.blob = blob;
        const result = await app.pdfLabels.printPdfBlob(blob, entry.name, {
            onProgress: message => _setToast(message)
        });
        entry.printedInfo = _markCarrierPrinted(entry);
        _renderCarrierPanel();
        _syncCarrierPrintStatusUi();
        const meta = modal.querySelector('#carrierPrintMeta');
        if (meta) {
            meta.textContent = `Esta etiqueta ya fue marcada como impresa: ${_carrierPrintStatusText(entry.printedInfo)}.`;
        }
        if (button) {
            button.textContent = 'Reimprimir en Zebra';
            button.classList.add('is-reprint');
        }
        _setToast(`${entry.name} enviada a ${result.printer}.`);
    } catch (err) {
        console.warn('[DriveSync] print current carrier PDF:', err);
        _setToast(err?.message || 'No se pudo imprimir el PDF de Drive en Zebra.', false);
    } finally {
        if (button) {
            const currentPrinted = _getCarrierPrintedInfo(entry.sourceKey, entry.id);
            button.textContent = currentPrinted ? 'Reimprimir en Zebra' : originalText;
            button.disabled = false;
        }
    }
}

async function _printCarrierLabels(sourceKey) {
    const source = _getSourceConfig(sourceKey);
    if (!PDF_LABEL_SOURCE_KEYS.includes(source.key)) {
        const message = 'Este boton solo imprime etiquetas PDF de Bluexpress o Walmart.';
        _setToast(message, false);
        return { ok: false, message };
    }

    if (!_state.isPolling && !_tokenStore.isValid(0)) {
        const message = 'Conecta Drive para imprimir etiquetas PDF.';
        _setToast(message, false);
        return { ok: false, message };
    }

    _setActiveLabelSource(source.key);

    try {
        await _ensureFreshToken();

        let files = _getActiveCarrierFiles(source.key);
        if (files.length === 0) {
            files = await _loadPdfSourceFiles(source.key, _state.offsetDay || 0);
            _state.carrierFiles = { ..._state.carrierFiles, [source.key]: files };
            _updateCarrierStats();
            _renderCarrierPanel();
        }

        if (files.length === 0) {
            const message = `No hay etiquetas PDF de ${source.label} para imprimir.`;
            _renderCarrierPrintMessage(source, message, true);
            _setToast(message, false);
            return { ok: false, message, count: 0 };
        }

        const entries = [];
        for (const file of files) {
            const blob = await _downloadDriveBlob(file.id, 'application/pdf');
            const url = URL.createObjectURL(blob);
            const date = _formatDriveDate(file.createdTime || file.modifiedTime) || 'Sin fecha';
            const time = _formatDriveTime(file.createdTime || file.modifiedTime) || '';
            const folder = file.folder || source.folder;
            entries.push({
                sourceKey: source.key,
                id: file.id,
                name: file.name || `Etiqueta ${source.label}`,
                meta: [folder, date, time].filter(Boolean).join(' - '),
                url,
                printedInfo: _getCarrierPrintedInfo(source.key, file.id),
            });
        }

        _showCarrierPrintModal(source, entries);

        const message = `${entries.length} PDF(s) de ${source.label} listos para imprimir.`;
        _setToast(message);
        return { ok: true, message, count: entries.length, source: source.key };
    } catch (err) {
        console.warn('[DriveSync] printCarrierLabels:', err);
        const message = `No se pudieron preparar las etiquetas PDF de ${source.label}.`;
        _renderCarrierPrintMessage(source, message, true);
        _setToast(message, false);
        return { ok: false, message, error: err };
    }
}

async function _refreshCarrierLabels(silent = false) {
    if (!_state.isPolling && !_tokenStore.isValid(0)) {
        if (!silent) _setToast('Conecta Drive para revisar PDFs de Bluexpress y Walmart.', false);
        return;
    }

    try {
        await _ensureFreshToken();
        _state.carrierFiles = { ..._state.carrierFiles, ...(await _loadAllPdfSources(_state.offsetDay || 0)) };
        _updateCarrierStats();
        _renderCarrierPanel();
        if (!silent) _setToast('Etiquetas PDF actualizadas.');
    } catch (err) {
        console.warn('[DriveSync] refreshCarrierLabels:', err);
        if (!silent) _setToast('No se pudieron actualizar las etiquetas PDF.', false);
    }
}

function _initCarrierLabelsUi() {
    if (_state.carrierUiReady) return;
    _state.carrierUiReady = true;

    const results = document.getElementById('results');
    if (!results) return;

    results.addEventListener('click', event => {
        const previewBtn = event.target.closest('[data-carrier-preview-file-id]');
        if (previewBtn) {
            event.preventDefault();
            _previewCarrierFile(
                previewBtn.dataset.carrierPreviewSource,
                previewBtn.dataset.carrierPreviewFileId,
                previewBtn
            );
            return;
        }

        const openBtn = event.target.closest('[data-carrier-file-id]');
        if (openBtn) {
            event.preventDefault();
            _printCarrierFileToZebra(openBtn.dataset.carrierSource, openBtn.dataset.carrierFileId, openBtn);
            return;
        }

        const sourceBtn = event.target.closest('[data-label-source]');
        if (sourceBtn && results.contains(sourceBtn)) {
            event.preventDefault();
            _setActiveLabelSource(sourceBtn.dataset.labelSource);
        }
    });

    const refreshBtn = document.getElementById('carrierLabelsRefreshBtn');
    refreshBtn?.addEventListener('click', () => _refreshCarrierLabels(false));
    const printAllBtn = document.getElementById('carrierPrintAllBtn');
    printAllBtn?.addEventListener('click', () => {
        _printAllCarrierFilesToZebra(printAllBtn.dataset.carrierPrintAllSource || _state.activeLabelSource, printAllBtn);
    });

    _updateCarrierStats();
    _renderCarrierPanel();
}

// ─── FIX #3 — Paginación completa ─────────────────────────────────────────────

async function _listFilesAll(params) {
    const results = [];
    let pageToken;
    do {
        const res = await gapi.client.drive.files.list({
            ...params,
            pageSize:  1000,
            pageToken: pageToken || undefined,
        });
        results.push(...(res.result.files || []));
        pageToken = res.result.nextPageToken;
    } while (pageToken);
    return results;
}

// ─── FIX #5 — Recursión paralela ──────────────────────────────────────────────

function _getSourceConfig(sourceKey = 'mercadolibre') {
    return DRIVE_LABEL_SOURCES[sourceKey] || DRIVE_LABEL_SOURCES.mercadolibre;
}

async function _getAllDriveFilesRecursive(folderId, sourceKey = 'mercadolibre', folderName = '', _seenIds = new Set()) {
    const source = _getSourceConfig(sourceKey);
    const [matchingFiles, subFolders] = await Promise.all([
        _listFilesAll({
            q:      `'${folderId}' in parents and mimeType='${source.mimeType}' and trashed=false`,
            fields: 'files(id,name,createdTime,modifiedTime,mimeType,webViewLink,webContentLink)',
            supportsAllDrives: true, includeItemsFromAllDrives: true, corpora: 'allDrives',
        }),
        _listFilesAll({
            q:      `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id,name)',
            supportsAllDrives: true, includeItemsFromAllDrives: true, corpora: 'allDrives',
        }),
    ]);

    const results = [];
    for (const f of matchingFiles) {
        if (_seenIds.has(f.id)) continue;
        _seenIds.add(f.id);
        results.push({ ...f, folder: folderName, source: source.key });
    }

    const nested = await Promise.all(
        subFolders.map(sub => _getAllDriveFilesRecursive(sub.id, source.key, sub.name, _seenIds))
    );
    nested.forEach(arr => results.push(...arr));
    return results;
}

async function _getAllTxtRecursive(folderId, folderName = '', _seenIds = new Set()) {
    return _getAllDriveFilesRecursive(folderId, 'mercadolibre', folderName, _seenIds);
}

async function _getAllPdfRecursive(folderId, sourceKey, folderName = '', _seenIds = new Set()) {
    return _getAllDriveFilesRecursive(folderId, sourceKey, folderName, _seenIds);
}

function _nameKey(f) {
    return `${(f.source || 'mercadolibre').toLowerCase().trim()}|${(f.folder || '').toLowerCase().trim()}|${f.name.toLowerCase().trim()}`;
}

function _syncSeenFilesForToday() {
    const todayKey = _todayKey();
    if (_state.scanDayKey === todayKey) return;

    const seenFiles = _loadSeenFiles();
    _state.knownIds = seenFiles.ids;
    _state.knownNames = seenFiles.names;
    _state.scanDayKey = todayKey;
}

function _hasSeenFile(file) {
    if (file?.id) {
        return _state.knownIds.has(file.id);
    }

    return _state.knownNames.has(_nameKey(file));
}

function _rememberSeenFile(file, persist = true) {
    if (file?.id) {
        _state.knownIds.add(file.id);
    }
    _state.knownNames.add(_nameKey(file));
    if (persist) _saveSeenFiles();
}

function _isRecentDriveFile(file, maxAgeMs = DRIVE_CONFIG.RECENT_FIRST_SCAN_ALERT_MS) {
    const createdTime = Date.parse(file?.createdTime || '');
    return Number.isFinite(createdTime) && Date.now() - createdTime <= maxAgeMs;
}

function _isCacheFresh(entry, ttlMs) {
    return !!(entry && Number.isFinite(entry.cachedAt) && Date.now() - entry.cachedAt <= ttlMs);
}

function _cloneDriveFiles(files = []) {
    return Array.isArray(files) ? files.map(file => ({ ...file })) : [];
}

function _driveFileCacheKey(kind, sourceKey, offset = 0) {
    return `${kind}|${sourceKey || 'mercadolibre'}|${_getOffsetDateKey(offset)}`;
}

function _getDriveFileCache(kind, sourceKey, offset = 0, options = {}) {
    const entry = _state.driveFileCache[_driveFileCacheKey(kind, sourceKey, offset)];
    if (!entry) return null;
    if (!options.allowStale && !_isCacheFresh(entry, DRIVE_CONFIG.FILE_CACHE_TTL)) return null;
    return _cloneDriveFiles(entry.files);
}

function _setDriveFileCache(kind, sourceKey, offset = 0, files = []) {
    _state.driveFileCache[_driveFileCacheKey(kind, sourceKey, offset)] = {
        cachedAt: Date.now(),
        files: _cloneDriveFiles(files),
    };
}

function _applyVisibleDayFiles(offset, files, options = {}) {
    if (Number(offset) !== _state.offsetDay) return false;
    const cloned = _cloneDriveFiles(files);
    _state.knownFiles = cloned;
    _setFileCount(cloned.length);
    if (options.render !== false) _renderExistingPanel();
    return true;
}

async function _loadTxtFilesForOffset(offset = 0, options = {}) {
    const cached = options.force
        ? null
        : _getDriveFileCache('txt', 'mercadolibre', offset, { allowStale: !!options.allowStale });
    if (cached) return cached;

    const dayId = await _getDayFolderId(offset, 'mercadolibre', { silent: !!options.silent });
    const files = _sortDriveFilesNewestFirst(dayId ? await _getAllTxtRecursive(dayId) : []);
    _setDriveFileCache('txt', 'mercadolibre', offset, files);
    return files;
}

// ─── Matching flexible de carpetas ────────────────────────────────────────────
// Normaliza nombres a mayúsculas y elimina acentos para comparar sin importar
// si el operador escribió "07 MAYO", "7 Mayo", "7 mayo", etc.

function _normalizeFolder(name) {
    return String(name).trim().toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Variantes del nombre del mes: "MAYO 2026" (con y sin año) */
function _getMesVariants(d) {
    const mes  = MESES[d.getMonth()];
    const year = d.getFullYear();
    return [`${mes} ${year}`, mes].map(_normalizeFolder);
}

/** Variantes del nombre del día: "7 MAYO" y "07 MAYO" */
function _getDiaVariants(d) {
    const day = d.getDate();
    const mes = MESES[d.getMonth()];
    return [
        `${day} ${mes}`,
        `${String(day).padStart(2, '0')} ${mes}`,
    ].map(_normalizeFolder);
}

/**
 * Lista TODAS las subcarpetas de parentId y devuelve la primera
 * cuyo nombre (normalizado) coincide con alguna de las variantes dadas.
 */
async function _findFolderFlexible(parentId, variants, options = {}) {
    const normalizedVariants = variants.map(_normalizeFolder);
    const cacheKey = `${parentId}|${normalizedVariants.join('|')}`;
    const cached = _state.folderCache[cacheKey];
    if (!options.force && _isCacheFresh(cached, DRIVE_CONFIG.FOLDER_CACHE_TTL)) {
        return cached.folder ? { ...cached.folder } : null;
    }

    const folders = await _listFilesAll({
        q:      `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)',
        supportsAllDrives: true, includeItemsFromAllDrives: true, corpora: 'allDrives',
    });
    const folder = folders.find(f => normalizedVariants.includes(_normalizeFolder(f.name))) ?? null;
    _state.folderCache[cacheKey] = {
        cachedAt: Date.now(),
        folder: folder ? { ...folder } : null,
    };
    return folder;
}

async function _getMarketplaceRootFolderId() {
    const marketplaceFolder = await _findFolderFlexible(
        DRIVE_CONFIG.ROOT_FOLDER_ID,
        [_normalizeFolder(DRIVE_CONFIG.MARKETPLACE_FOLDER)]
    );
    return marketplaceFolder?.id || DRIVE_CONFIG.ROOT_FOLDER_ID;
}

async function _getSourceRootFolderId(sourceKey = 'mercadolibre') {
    const source = _getSourceConfig(sourceKey);
    if (source.key === 'mercadolibre') return _getMarketplaceRootFolderId();

    const sourceFolder = await _findFolderFlexible(
        DRIVE_CONFIG.ROOT_FOLDER_ID,
        [source.folder, ...(source.aliases || [])].map(_normalizeFolder)
    );
    return sourceFolder?.id || (source.fallbackToRoot ? DRIVE_CONFIG.ROOT_FOLDER_ID : null);
}

async function _getDayFolderId(offset = 0, sourceKey = 'mercadolibre', options = {}) {
    const d = _getOffsetDate(offset);
    const source = _getSourceConfig(sourceKey);
    const silent = !!options.silent;

    const rootFolderId = await _getSourceRootFolderId(source.key);
    if (!rootFolderId) {
        if (!silent) _setStatus(`Sin carpeta "${source.folder}"`, false);
        return null;
    }
    const mesCarpeta = await _findFolderFlexible(rootFolderId, _getMesVariants(d));
    if (!mesCarpeta && silent) return null;
    if (!mesCarpeta) { _setStatus(`⚠ Sin carpeta "${_getMes(d)}"`); return null; }

    const diaCarpeta = await _findFolderFlexible(mesCarpeta.id, _getDiaVariants(d));
    if (!diaCarpeta && silent) return null;
    if (!diaCarpeta) { _setStatus(`Sin carpeta "${_getDia(d)}" en ${_getMes(d)}`, true); return null; }

    return diaCarpeta.id;
}

/** Formatea createdTime de Drive (ISO 8601) como fecha local DD-MM-AAAA */
function _formatDriveDate(isoString) {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch { return ''; }
}

/** Formatea createdTime de Drive (ISO 8601) como hora local HH:MM */
function _formatDriveTime(isoString) {
    if (!isoString) return '';
    try { return new Date(isoString).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
}

function _isDriveDateOnOffset(isoString, offset = 0) {
    if (!isoString) return false;
    try {
        const target = new Date();
        target.setDate(target.getDate() + offset);
        const value = new Date(isoString);
        return value.getFullYear() === target.getFullYear()
            && value.getMonth() === target.getMonth()
            && value.getDate() === target.getDate();
    } catch {
        return false;
    }
}

function _sortDriveFilesNewestFirst(files) {
    return [...files].sort((a, b) => {
        const at = new Date(a.createdTime || a.modifiedTime || 0).getTime();
        const bt = new Date(b.createdTime || b.modifiedTime || 0).getTime();
        return bt - at;
    });
}

function _driveFilesChanged(prevFiles = [], nextFiles = []) {
    if (prevFiles.length !== nextFiles.length) return true;
    return nextFiles.some((file, index) => {
        const prev = prevFiles[index];
        return !prev
            || prev.id !== file.id
            || prev.name !== file.name
            || prev.folder !== file.folder
            || prev.createdTime !== file.createdTime
            || prev.modifiedTime !== file.modifiedTime;
    });
}

function _sortPendingNewestFirst(items) {
    return [...items].sort((a, b) => {
        const at = new Date(a.uploadedAt || a.detectedAt || 0).getTime();
        const bt = new Date(b.uploadedAt || b.detectedAt || 0).getTime();
        return bt - at;
    });
}

async function _loadPdfSourceFiles(sourceKey, offset = 0, options = {}) {
    const source = _getSourceConfig(sourceKey);
    const cached = options.force
        ? null
        : _getDriveFileCache('pdf', source.key, offset, { allowStale: !!options.allowStale });
    if (cached) return cached;

    const dayId = await _getDayFolderId(offset, source.key, { silent: true });
    let files = [];

    if (dayId) {
        files = await _getAllPdfRecursive(dayId, source.key);
    } else {
        const sourceRootId = await _getSourceRootFolderId(source.key);
        if (!sourceRootId) return [];
        files = await _getAllPdfRecursive(sourceRootId, source.key);
        files = files.filter(file => _isDriveDateOnOffset(file.createdTime || file.modifiedTime, offset));
    }

    const sorted = _sortDriveFilesNewestFirst(files);
    _setDriveFileCache('pdf', source.key, offset, sorted);
    return sorted;
}

async function _loadAllPdfSources(offset = 0, options = {}) {
    const entries = await Promise.all(PDF_LABEL_SOURCE_KEYS.map(async sourceKey => {
        try {
            return [sourceKey, await _loadPdfSourceFiles(sourceKey, offset, options)];
        } catch (err) {
            console.warn(`[DriveSync] No se pudieron leer PDFs ${sourceKey}:`, err);
            return [sourceKey, []];
        }
    }));

    return Object.fromEntries(entries);
}

function _getDriveAccessToken() {
    const gapiToken = typeof gapi !== 'undefined' && gapi.auth?.getToken
        ? gapi.auth.getToken()
        : null;
    return gapiToken?.access_token || _tokenStore.load()?.access_token || '';
}

async function _downloadDriveBlob(fileId, fallbackMimeType = 'application/octet-stream') {
    await _ensureFreshToken();
    const accessToken = _getDriveAccessToken();
    if (!accessToken) throw new Error('Sin token de acceso');

    const r = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    const blob = await r.blob();
    return blob.type ? blob : new Blob([blob], { type: fallbackMimeType });
}

async function _downloadText(fileId) {
    const accessToken = _getDriveAccessToken();
    if (!accessToken) throw new Error('Sin token de acceso');
    const r = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
}

function _countBulks(text) {
    const zpl = (text.match(/\^XA/gi) || []).length;
    return zpl > 0 ? zpl : (text.match(/"id"\s*:\s*"?\d+"?/gi) || []).length;
}

// ─── Reloj de expiración del token ────────────────────────────────────────────
// Muestra una cuenta regresiva en el header del panel mientras se está
// monitoreando. Notifica al usuario cuando quedan 10 y 5 minutos.

const _countdown = {
    timer:      null,
    notifiedAt: new Set(),   // umbrales ya notificados en este ciclo de token

    start() {
        this.stop();
        this.notifiedAt.clear();
        _injectCountdownEl();
        _tickCountdown();                                         // tick inmediato
        this.timer = setInterval(_tickCountdown, 1_000);
    },

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        document.getElementById('drive-token-clock')?.remove();
    },

    /** Llamar después de un refresh exitoso para reiniciar el ciclo */
    reset() {
        this.notifiedAt.clear();
        // El timer sigue corriendo; el próximo tick leerá el nuevo expires_at
    },
};

/** Inyecta el elemento del reloj en el header del panel Drive */
function _injectCountdownEl() {
    if (document.getElementById('drive-token-clock')) return;
    const header = document.querySelector('#drive-sync-panel .lp-drive-header');
    if (!header) return;
    const el      = document.createElement('span');
    el.id         = 'drive-token-clock';
    el.className  = 'ds-token-clock';
    el.title      = 'Tiempo restante del token de Google';
    header.appendChild(el);
}

/** Se ejecuta cada segundo mientras el polling está activo */
function _tickCountdown() {
    const el = document.getElementById('drive-token-clock');
    if (!el) return;

    const token = _tokenStore.load();
    if (!token?.expires_at) { el.textContent = ''; return; }

    const remaining = token.expires_at - Date.now();

    if (remaining <= 0) {
        el.textContent = '⏱ 0:00';
        el.className   = 'ds-token-clock ds-token-clock--critical';
        return;
    }

    const totalSecs = Math.floor(remaining / 1_000);
    const mins      = Math.floor(totalSecs / 60);
    const secs      = totalSecs % 60;
    el.textContent  = `⏱ ${mins}:${String(secs).padStart(2, '0')}`;

    if (remaining < 5 * 60_000) {
        el.className = 'ds-token-clock ds-token-clock--critical';
    } else if (remaining < 10 * 60_000) {
        el.className = 'ds-token-clock ds-token-clock--warning';
    } else {
        el.className = 'ds-token-clock';
    }

    // Notificaciones en umbrales exactos (una sola vez por umbral)
    for (const threshold of [10, 5]) {
        if (mins === threshold && secs === 0 && !_countdown.notifiedAt.has(threshold)) {
            _countdown.notifiedAt.add(threshold);
            _notifyTokenExpiry(threshold);
        }
    }
}

// ─── Alertas sonoras del token ────────────────────────────────────────────────
// Usa Web Audio API para generar beeps sin depender de archivos externos.
// El AudioContext se crea de forma lazy para respetar la política de autoplay
// de los navegadores (requiere gesto previo del usuario — que ya ocurrió al
// hacer clic en "Conectar Drive").

let _audioCtx = null;

function _getAudioCtx() {
    if (!_audioCtx) {
        try {
            _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            return null;
        }
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
}

async function _ensureAudioReady() {
    const ctx = _getAudioCtx();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (e) {
            console.warn('[DriveSync] No se pudo activar el audio:', e);
        }
    }
    return ctx;
}

/**
 * Genera un beep simple con envelope suave para evitar clicks audibles.
 * @param {number} frequency  — Hz (ej: 440 = La, 880 = La+octava)
 * @param {number} duration   — segundos de duración del tono
 * @param {number} volume     — ganancia pico (0.0–1.0)
 * @param {number} startDelay — segundos desde ahora para iniciar
 */
/**
 * Genera un tono con envelope ADSR simplificado.
 * @param {number} frequency  — Hz
 * @param {number} duration   — segundos de duración total
 * @param {number} volume     — ganancia pico (0.0 – 1.0)
 * @param {number} startDelay — segundos desde ahora para iniciar
 * @param {string} waveType   — 'sine' | 'triangle' | 'square' | 'sawtooth'
 */
function _beep(frequency, duration, volume = 0.6, startDelay = 0, waveType = 'sine') {
    const ctx = _getAudioCtx();
    if (!ctx) return;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(_getAudioOutput(ctx));

    const t0      = ctx.currentTime + startDelay;
    const attack  = 0.015;
    const release = duration * 0.45;   // decaimiento en la segunda mitad del tono

    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, t0);

    gain.gain.setValueAtTime(0,      t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + attack);
    gain.gain.setValueAtTime(volume, t0 + duration - release);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.start(t0);
    osc.stop(t0 + duration);
}

let _audioOutput = null;

function _getAudioOutput(ctx) {
    if (_audioOutput?.context === ctx) return _audioOutput.input;

    const boost = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();

    boost.gain.value = 1.55;
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.18;

    boost.connect(compressor);
    compressor.connect(ctx.destination);

    _audioOutput = { context: ctx, input: boost };
    return boost;
}

const SOUND_PRESETS = Object.freeze({
    clearBell: Object.freeze({
        label: 'Campana clara',
        steps: Object.freeze([
            Object.freeze([659, 0.24, 0.62, 0.00, 'sine']),
            Object.freeze([784, 0.28, 0.66, 0.18, 'sine']),
            Object.freeze([988, 0.34, 0.70, 0.40, 'triangle']),
        ]),
    }),
    softDouble: Object.freeze({
        label: 'Doble suave',
        steps: Object.freeze([
            Object.freeze([523, 0.24, 0.58, 0.00, 'triangle']),
            Object.freeze([659, 0.28, 0.62, 0.34, 'triangle']),
        ]),
    }),
    brightPing: Object.freeze({
        label: 'Ping brillante',
        steps: Object.freeze([
            Object.freeze([880, 0.18, 0.58, 0.00, 'sine']),
            Object.freeze([1175, 0.24, 0.64, 0.18, 'sine']),
        ]),
    }),
    risingChime: Object.freeze({
        label: 'Subida corta',
        steps: Object.freeze([
            Object.freeze([523, 0.18, 0.56, 0.00, 'sine']),
            Object.freeze([659, 0.18, 0.60, 0.16, 'sine']),
            Object.freeze([784, 0.24, 0.66, 0.32, 'triangle']),
        ]),
    }),
    warmBell: Object.freeze({
        label: 'Campana tibia',
        steps: Object.freeze([
            Object.freeze([392, 0.24, 0.56, 0.00, 'sine']),
            Object.freeze([523, 0.30, 0.62, 0.20, 'sine']),
        ]),
    }),
    softPulse: Object.freeze({
        label: 'Pulso suave',
        steps: Object.freeze([
            Object.freeze([440, 0.16, 0.54, 0.00, 'triangle']),
            Object.freeze([440, 0.16, 0.54, 0.24, 'triangle']),
        ]),
    }),
    firmAlert: Object.freeze({
        label: 'Alerta firme',
        steps: Object.freeze([
            Object.freeze([659, 0.22, 0.74, 0.00, 'triangle']),
            Object.freeze([659, 0.22, 0.74, 0.28, 'triangle']),
            Object.freeze([784, 0.34, 0.80, 0.58, 'triangle']),
        ]),
    }),
    shortTone: Object.freeze({
        label: 'Tono corto',
        steps: Object.freeze([
            Object.freeze([988, 0.18, 0.58, 0.00, 'sine']),
        ]),
    }),
    loudBell: Object.freeze({
        label: 'Campana fuerte',
        steps: Object.freeze([
            Object.freeze([784, 0.22, 0.78, 0.00, 'triangle']),
            Object.freeze([988, 0.28, 0.84, 0.18, 'triangle']),
            Object.freeze([1319, 0.36, 0.88, 0.40, 'sine']),
        ]),
    }),
    urgentTriple: Object.freeze({
        label: 'Triple urgente',
        steps: Object.freeze([
            Object.freeze([988, 0.18, 0.82, 0.00, 'square']),
            Object.freeze([988, 0.18, 0.82, 0.24, 'square']),
            Object.freeze([1175, 0.24, 0.88, 0.48, 'square']),
        ]),
    }),
    digitalAlarm: Object.freeze({
        label: 'Alarma digital',
        steps: Object.freeze([
            Object.freeze([1047, 0.16, 0.80, 0.00, 'square']),
            Object.freeze([784, 0.16, 0.78, 0.20, 'square']),
            Object.freeze([1047, 0.20, 0.84, 0.40, 'square']),
        ]),
    }),
    sirenRise: Object.freeze({
        label: 'Sirena subida',
        steps: Object.freeze([
            Object.freeze([440, 0.20, 0.72, 0.00, 'sawtooth']),
            Object.freeze([659, 0.20, 0.78, 0.18, 'sawtooth']),
            Object.freeze([880, 0.28, 0.84, 0.36, 'sawtooth']),
        ]),
    }),
    rapidPulse: Object.freeze({
        label: 'Pulso rápido',
        steps: Object.freeze([
            Object.freeze([698, 0.12, 0.76, 0.00, 'triangle']),
            Object.freeze([698, 0.12, 0.76, 0.16, 'triangle']),
            Object.freeze([698, 0.12, 0.76, 0.32, 'triangle']),
            Object.freeze([880, 0.20, 0.82, 0.48, 'triangle']),
        ]),
    }),
    bassKnock: Object.freeze({
        label: 'Golpe grave',
        steps: Object.freeze([
            Object.freeze([220, 0.20, 0.84, 0.00, 'square']),
            Object.freeze([220, 0.20, 0.84, 0.28, 'square']),
        ]),
    }),
    highFlash: Object.freeze({
        label: 'Destello agudo',
        steps: Object.freeze([
            Object.freeze([1319, 0.14, 0.72, 0.00, 'sine']),
            Object.freeze([1568, 0.16, 0.80, 0.14, 'sine']),
            Object.freeze([1760, 0.20, 0.86, 0.30, 'sine']),
        ]),
    }),
    longAlarm: Object.freeze({
        label: 'Alarma larga',
        steps: Object.freeze([
            Object.freeze([587, 0.28, 0.78, 0.00, 'square']),
            Object.freeze([784, 0.28, 0.82, 0.28, 'square']),
            Object.freeze([587, 0.34, 0.80, 0.58, 'square']),
        ]),
    }),
    silent: Object.freeze({
        label: 'Sin sonido',
        steps: Object.freeze([]),
    }),
});

const SOUND_EVENT_LABELS = Object.freeze({
    arrival: 'Archivo nuevo',
    warning: 'Aviso 10 min',
    critical: 'Crítico 5 min',
});

const DEFAULT_SOUND_SELECTION = Object.freeze({
    arrival: 'loudBell',
    warning: 'softDouble',
    critical: 'firmAlert',
});

function _loadSoundSelections() {
    try {
        const saved = JSON.parse(localStorage.getItem(DRIVE_CONFIG.SOUND_SETTINGS_KEY) || '{}');
        if (saved?.arrival === 'clearBell') {
            saved.arrival = DEFAULT_SOUND_SELECTION.arrival;
        }
        return Object.fromEntries(
            Object.entries(DEFAULT_SOUND_SELECTION).map(([type, fallback]) => [
                type,
                SOUND_PRESETS[saved?.[type]] ? saved[type] : fallback,
            ])
        );
    } catch {
        return { ...DEFAULT_SOUND_SELECTION };
    }
}

const _soundSelections = _loadSoundSelections();

function _saveSoundSelections() {
    try {
        localStorage.setItem(DRIVE_CONFIG.SOUND_SETTINGS_KEY, JSON.stringify(_soundSelections));
    } catch {}
}

function _getSoundPresetId(type) {
    const selected = _soundSelections[type];
    return SOUND_PRESETS[selected] ? selected : DEFAULT_SOUND_SELECTION[type];
}

function _setSoundSelection(type, presetId) {
    if (!DEFAULT_SOUND_SELECTION[type] || !SOUND_PRESETS[presetId]) return;
    _soundSelections[type] = presetId;
    _saveSoundSelections();
}

function _playSoundPreset(presetId) {
    const preset = SOUND_PRESETS[presetId];
    if (!preset) return;
    preset.steps.forEach(step => _beep(...step));
}

function _audioAlert(type) {
    try {
        _playSoundPreset(_getSoundPresetId(type));
    } catch (e) {
        console.warn('[DriveSync] Error reproduciendo alerta sonora:', e);
    }
}

function _notifyTokenExpiry(minutesLeft) {
    const isUrgent = minutesLeft <= 5;
    const body = isUrgent
        ? `Quedan ${minutesLeft} minutos. Intentando renovar sesión automáticamente...`
        : `Quedan ${minutesLeft} minutos antes de que venza la sesión de Drive.`;

    _setToast(`⏱ ${body}`, !isUrgent);
    _audioAlert(isUrgent ? 'critical' : 'warning');

    if (Notification.permission === 'granted') {
        new Notification('Drive — Sesión por vencer', {
            body,
            icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png',
        });
    }
}

// ─── Polling ───────────────────────────────────────────────────────────────────

async function _startPolling() {
    if (_state.isPolling) return;
    _state.isPolling = true;
    _state.offsetDay = 0;
    localStorage.setItem(DRIVE_CONFIG.WAS_ACTIVE_KEY, 'true');

    const bc = document.getElementById('drive-sync-btn');
    const bs = document.getElementById('drive-sync-stop');
    if (bc) bc.style.display = 'none';
    if (bs) bs.style.display = '';

    const dayName   = document.getElementById('drive-day-name');
    const dayStatus = document.getElementById('drive-day-status');
    if (dayName)   dayName.textContent   = 'Carpeta: ' + _getDia();
    if (dayStatus) dayStatus.style.display = 'grid';

    _setStatus('● Monitoreando en vivo', true);
    _applyMode();
    _countdown.start();
    await _scan(true);
    _state.pollTimer = setInterval(() => _scan(false), DRIVE_CONFIG.POLL_INTERVAL);
}

function _stopPolling() {
    clearInterval(_state.pollTimer);
    _state.pollTimer = null;
    _state.isPolling = false;
    _clearAllArrivalReminders();
    localStorage.setItem(DRIVE_CONFIG.WAS_ACTIVE_KEY, 'false');
    _setStatus('Desconectado');

    const bc = document.getElementById('drive-sync-btn');
    const bs = document.getElementById('drive-sync-stop');
    if (bc) { bc.style.display = ''; bc.disabled = false; }
    if (bs) bs.style.display = 'none';

    const dayStatus = document.getElementById('drive-day-status');
    if (dayStatus) dayStatus.style.display = 'none';
    _setFileCount(null);
    _countdown.stop();
    _restoreConnectBtn();
}

function _handleNewPdfFile(file) {
    const source = _getSourceConfig(file.source);
    _announceDriveArrival({
        title: `Nuevo PDF ${source.label}`,
        message: `"${file.name}" subido a Drive`,
        fileId: file.id,
        pendingOnly: false,
    });
}

async function _scanPdfSources(firstScan) {
    const filesBySource = await _loadAllPdfSources(0, { force: true, silent: true });
    _state.carrierFiles = { ..._state.carrierFiles, ...filesBySource };

    for (const sourceKey of PDF_LABEL_SOURCE_KEYS) {
        const files = filesBySource[sourceKey] || [];
        if (firstScan) {
            files.forEach(file => _rememberSeenFile(file, false));
            continue;
        }

        files.filter(file => !_hasSeenFile(file)).forEach(file => {
            _rememberSeenFile(file);
            _handleNewPdfFile(file);
        });
    }

    if (firstScan) _saveSeenFiles();
    _updateCarrierStats();
    _renderCarrierPanel();
}

async function _scan(firstScan) {
    if (_state._scanning) return;
    _state._scanning = true;

    try {
        _syncSeenFilesForToday();
        await _ensureFreshToken();
        const files = await _loadTxtFilesForOffset(0, { force: true });
        await _scanPdfSources(firstScan);

        if (firstScan) {
            const recentNewFiles = files.filter(file => !_hasSeenFile(file) && _isRecentDriveFile(file));
            const recentNewIds = new Set(recentNewFiles.map(file => file.id).filter(Boolean));

            files
                .filter(file => !recentNewIds.has(file.id))
                .forEach(file => _rememberSeenFile(file, false));

            for (const file of recentNewFiles) {
                _rememberSeenFile(file, false);
                await _handleNewFile(file);
            }

            _saveSeenFiles();
            _setDriveFileCache('txt', 'mercadolibre', 0, files);
            if (_state.offsetDay === 0) {
                _state.knownFiles = _cloneDriveFiles(files);
                _setFileCount(files.length);
                _renderExistingPanel();
            }
            _setStatus(`● Monitoreando — ${files.length} existentes`, true);
            return;
        }

        const newFiles = files.filter(f => !_hasSeenFile(f));
        for (const file of newFiles) {
            _rememberSeenFile(file);
            await _handleNewFile(file);
        }

        _setDriveFileCache('txt', 'mercadolibre', 0, files);
        _setStatus(`● Monitoreando — ${files.length} existentes`, true);

        if (_state.offsetDay === 0) {
            const listChanged = _driveFilesChanged(_state.knownFiles, files);
            _state.knownFiles = _cloneDriveFiles(files);
            _setFileCount(files.length);
            if (listChanged || newFiles.length > 0) {
                _renderExistingPanel();
            }
        }

    } catch (err) {
        console.error('[DriveSync] _scan error:', err);
        const code = err.status ?? err.code ?? err.result?.error?.code;
        if (code === 401 || code === 403) {
            try {
                await _requestToken(true);
                _setStatus('● Monitoreando en vivo', true);
            } catch {
                _state._refreshing = false;
                _stopPolling();
                _setStatus('⚠️ Sesión expirada — clic en Reconectar Drive');
            }
        } else {
            _setStatus('⚠️ Error temporal, reintentando en 30s...');
        }
    } finally {
        _state._scanning = false;
    }
}

// ─── Token: refresh silencioso ────────────────────────────────────────────────

function _loadScript(src) {
    return new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s   = document.createElement('script');
        s.src     = src;
        s.onload  = res;
        s.onerror = () => rej(new Error('Error cargando ' + src));
        document.head.appendChild(s);
    });
}

async function _loadAll() {
    await _loadScript('https://accounts.google.com/gsi/client');
    await _loadScript('https://apis.google.com/js/api.js');
    if (_gapi.ready) return;                          // FIX #7
    const apiKey = _keyStore.load();                  // FIX #8
    await new Promise((res, rej) =>
        gapi.load('client', {
            callback: () => gapi.client.init({
                apiKey:         apiKey || undefined,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            }).then(() => { _gapi.setReady(); res(); }).catch(rej),
            onerror: (e) => rej(new Error('gapi.load falló: ' + (e?.message || e))),
        })
    );
}

function _requestToken(silent = false) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() =>
            reject(new Error(silent ? 'silent_timeout' : 'Tiempo de espera agotado')),
            silent ? 10_000 : 120_000
        );
        _state.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: DRIVE_CONFIG.CLIENT_ID,
            scope:     DRIVE_CONFIG.SCOPES,
            callback: (r) => {
                clearTimeout(timeout);
                if (r.error) { reject(new Error('OAuth: ' + r.error)); return; }
                _tokenStore.save(r);
                gapi.client.setToken({ access_token: r.access_token });
                resolve(r);
            },
            error_callback: (e) => {
                clearTimeout(timeout);
                reject(new Error(e.message || e.type || 'error desconocido'));
            },
        });
        _state.tokenClient.requestAccessToken({ prompt: silent ? '' : 'select_account' });
    });
}

async function _ensureFreshToken() {
    if (_tokenStore.isValid()) return;
    if (_state._refreshing)   return;
    _state._refreshing = true;
    try {
        _setStatus('⟳ Renovando sesión...', false);
        await _requestToken(true);
        _countdown.reset();
        _setStatus('● Monitoreando en vivo', true);
    } catch {
        if (!_tokenStore.isValid(0)) {
            _stopPolling();
            _setStatus('⚠️ Sesión expirada — clic en Reconectar Drive');
            _setToast('Sesión de Drive expirada. Hacé clic en "Reconectar Drive".', false);
        } else {
            _setStatus('● Monitoreando en vivo', true);
        }
    } finally {
        _state._refreshing = false;
    }
}

async function _authorize(silent = false) {
    _setStatus('⏳ Cargando SDK de Google...');
    try { await _loadAll(); }
    catch (e) {
        console.error('[DriveSync] _loadAll falló:', e);
        _setStatus('❌ Error SDK: ' + e.message);
        _restoreConnectBtn();
        return false;
    }
    _setStatus('⏳ Esperando autorización...');
    try {
        await _requestToken(silent);
        return true;
    } catch (e) {
        if (silent) return false;
        console.error('[DriveSync] OAuth falló:', e);
        _setStatus('❌ ' + e.message + ' — Intentá de nuevo');
        _restoreConnectBtn();
        return false;
    }
}

async function _tryRestoreSession() {
    const wasActive = localStorage.getItem(DRIVE_CONFIG.WAS_ACTIVE_KEY) === 'true';
    if (!wasActive || !_keyStore.exists()) return;

    _setStatus('⏳ Restaurando sesión...');
    try { await _loadAll(); } catch { _setStatus('Desconectado'); return; }

    if (_tokenStore.isValid(0)) {
        _tokenStore.applyToGapi();
        _setStatus('● Sesión restaurada', true);
        await _startPolling();
        return;
    }

    const ok = await _authorize(true);
    if (ok) {
        await _startPolling();
    } else {
        _setStatus('Desconectado — clic en Conectar Drive');
        _restoreConnectBtn();
    }
}

// ─── Procesamiento de archivos ─────────────────────────────────────────────────

async function _handleNewFile(file) {
    let text = '';
    try { text = await _downloadText(file.id); }
    catch { _setToast(`Error descargando: ${file.name}`, false); return; }

    const bulkCount = _countBulks(text);
    const alertMessage = `"${file.name}" - ${bulkCount} bulto${bulkCount !== 1 ? 's' : ''}`;

    if (_state.mode === 'auto') {
        _announceDriveArrival({
            title: 'Nuevo archivo en Drive',
            message: `${alertMessage}. Procesando automaticamente.`,
            fileId: file.id,
            pendingOnly: false,
        });
        await _processFile({ fileId: file.id, name: file.name, text, bulkCount, folder: file.folder || 'Drive', picker: _getAutoPickerValue(), uploadedAt: file.createdTime || null, autoOutput: true });
    } else {
        _state.pending.push({ id: file.id, name: file.name, folder: file.folder || 'Drive', detectedAt: new Date(), uploadedAt: file.createdTime || null, bulkCount, text });
        _state.pending = _sortPendingNewestFirst(_state.pending);
        _announceDriveArrival({
            title: 'Archivo pendiente en Drive',
            message: `${alertMessage}. Requiere procesamiento manual.`,
            fileId: file.id,
            pendingOnly: true,
        });
        _renderPending();
    }
}

async function _processFile({ fileId = null, name, text, bulkCount, folder, picker, uploadedAt = null, autoOutput = false }) {
    const pickerInput = document.getElementById('picker');
    if (pickerInput) {
        const target = Array.from(pickerInput.options)
            .find(o => o.value.toLowerCase() === picker.toLowerCase())
            || Array.from(pickerInput.options).find(o => o.value.toLowerCase().includes(picker.toLowerCase()));
        if (target) {
            pickerInput.value = target.value;
            pickerInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    const f = new File([new Blob([text], { type: 'text/plain' })], name, { type: 'text/plain' });
    let realCount = bulkCount;
    let processedRows = [];

    if (window.App?.actions?.handleFiles) {
        const prevLen = window.App.state?.storedDocuments?.length ?? -1;
        const result = await window.App.actions.handleFiles([f]);
        processedRows = Array.isArray(result?.documents)
            ? result.documents.flatMap(documentItem => Array.isArray(documentItem.rows) ? documentItem.rows : [])
            : [];
        const docs = window.App.state?.storedDocuments;
        if (processedRows.length > 0) {
            realCount = processedRows.length;
        } else if (Array.isArray(docs) && docs.length > prevLen && docs[0]?.rows?.length > 0) {
            realCount = docs[0].rows.length;
        }

        if (autoOutput && processedRows.length > 0 && window.App?.table?.handleAutomaticDriveOutput) {
            await window.App.table.handleAutomaticDriveOutput(processedRows, { sourceName: name });
        }
    } else {
        console.warn('[DriveSync] window.App no disponible.');
    }

    if (fileId) {
        _state.processedIds.add(fileId);
        _saveProcessedIds();
    }

    _state.processed.push({ id: fileId, name, folder, picker, bulkCount: realCount, processedAt: new Date(), uploadedAt });
    _saveProcessedList();
    _renderProcessed();
    _setToast(`✓ "${name}" — ${realCount} pedidos → ${picker}`);
    _announceDriveProcessed({ name, bulkCount: realCount, picker, fileId, autoOutput });
    _renderExistingPanel();
    _highlightNewestHistorialItem();
}

const _DRIVE_BADGE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 87.3 78">'
    + '<path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>'
    + '<path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47"/>'
    + '<path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>'
    + '<path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>'
    + '<path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>'
    + '<path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>'
    + '</svg>';

function _highlightNewestHistorialItem() {
    setTimeout(() => {
        const items = document.querySelectorAll('#historyList [data-history-document-id]');
        if (!items.length) return;
        const newest = items[0];
        newest.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const prev = newest.style.background;
        newest.style.transition = 'background 0.4s';
        newest.style.background = '#e8f5e9';
        setTimeout(() => { newest.style.transition = 'background 1s'; newest.style.background = prev || ''; }, 1800);
        if (!newest.querySelector('.drive-badge')) {
            const badge = document.createElement('span');
            badge.className   = 'drive-badge';
            badge.title       = 'Procesado desde Google Drive';
            badge.style.cssText = 'display:inline-flex;align-items:center;margin-left:5px;vertical-align:middle;opacity:0.8;';
            badge.innerHTML   = _DRIVE_BADGE_SVG;
            (newest.querySelector('strong,[class*="name"],[class*="source"]') || newest.firstElementChild || newest).appendChild(badge);
        }
    }, 700);
}

// ─── Utilidades ────────────────────────────────────────────────────────────────

function _getPickerOptions() {
    const sel = document.getElementById('picker');
    return sel
        ? Array.from(sel.options).filter(o => o.value).map(o => ({ v: o.value, l: o.text }))
        : [{ v: DRIVE_CONFIG.DEFAULT_PICKER, l: DRIVE_CONFIG.DEFAULT_PICKER }];
}

function _getAutoPickerValue() {
    const options = _getPickerOptions();
    const stored = (() => {
        try { return localStorage.getItem(DRIVE_CONFIG.AUTO_PICKER_KEY) || ''; }
        catch { return ''; }
    })();
    const normalizedStored = stored.trim().toLowerCase();
    const selected = options.find(o => o.v.toLowerCase() === normalizedStored)
        || options.find(o => o.v.toLowerCase() === DRIVE_CONFIG.DEFAULT_PICKER.toLowerCase())
        || options[0];
    return selected?.v || DRIVE_CONFIG.DEFAULT_PICKER;
}

function _setAutoPickerValue(value) {
    const options = _getPickerOptions();
    const selected = options.find(o => o.v.toLowerCase() === String(value || '').toLowerCase())
        || options[0]
        || { v: DRIVE_CONFIG.DEFAULT_PICKER };
    try { localStorage.setItem(DRIVE_CONFIG.AUTO_PICKER_KEY, selected.v); }
    catch {}
    _renderDrivePickerControl();
    _renderPending();
    _renderExistingPanel();
}

function _renderDrivePickerControl() {
    const wrap = document.getElementById('drive-mode-desc');
    if (!wrap) return;

    const options = _getPickerOptions();
    const selected = _getAutoPickerValue();
    const modeLabel = _state.mode === 'auto' ? 'Usuario' : 'Sugerido';

    wrap.classList.add('drive-picker-row');
    wrap.innerHTML = `
        <label class="drive-picker-control" for="drive-auto-picker">
            <span>${_esc(modeLabel)}</span>
            <select id="drive-auto-picker" name="driveAutoPicker">
                ${options.map(o => `<option value="${_esc(o.v)}" ${o.v.toLowerCase() === selected.toLowerCase() ? 'selected' : ''}>${_esc(o.l)}</option>`).join('')}
            </select>
        </label>`;

    wrap.querySelector('#drive-auto-picker')?.addEventListener('change', event => {
        _setAutoPickerValue(event.target.value);
    });
}

function _observePickerOptions() {
    const sel = document.getElementById('picker');
    if (!sel || sel.dataset.driveObserved === '1') return;
    sel.dataset.driveObserved = '1';
    new MutationObserver(() => _renderDrivePickerControl()).observe(sel, {
        childList: true,
        subtree: true,
    });
    sel.addEventListener('change', () => _renderDrivePickerControl());
}

// ─── Auto-inyección de estilos ────────────────────────────────────────────────
// El JS inyecta su propio <style> en el <head> al inicializar.
// No requiere un archivo CSS separado ni un <link> adicional en index.html.

function _injectStyles() {
    if (document.getElementById('drive-sync-styles')) return;
    const style = document.createElement('style');
    style.id = 'drive-sync-styles';
    style.textContent = `
/* drive-sync.css — inyectado por drive-sync.js */

.ds-hidden { display: none !important; }

#drive-sync-status.drive-sync-status--active { color: #00ac47; font-weight: 600; }

#drive-sync-panel.is-monitoring {
  border-color: rgba(0,172,71,0.28) !important;
}

#drive-sync-panel.drive-panel--urgent {
  border-color: rgba(245,158,11,0.58) !important;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.14), 0 14px 32px rgba(245,158,11,0.18) !important;
}

#drive-file-count.has-files {
  background: rgba(0,172,71,0.13) !important;
  border-color: rgba(0,172,71,0.22) !important;
}

#drive-token-clock {
  grid-column: 2 / 4;
  justify-self: end;
}

.lp-drive-folder-btn {
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid rgba(15,23,42,0.10);
  background: #FFFFFF;
  color: #315747;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color .15s ease, background .15s ease, color .15s ease;
}

.lp-drive-folder-btn:hover {
  border-color: rgba(0,172,71,0.28);
  background: rgba(255,255,255,0.92);
  color: #007C34;
}

.drive-picker-row {
  padding: 0 !important;
  text-align: left !important;
}
.drive-picker-control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 4px 5px 4px 9px;
  border: 1px solid #E2EAE5;
  border-radius: 10px;
  background: #FFFFFF;
}
.drive-picker-control > span {
  color: #64746C;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.drive-picker-control select {
  width: 100%;
  min-width: 0;
  height: 29px;
  padding: 0 24px 0 9px;
  border: 0;
  border-radius: 8px;
  background: #F6F8F7;
  color: #17301F;
  font-size: 12px;
  font-weight: 800;
  outline: none;
}
.drive-picker-control select:focus {
  box-shadow: 0 0 0 3px rgba(0, 172, 71, 0.12);
}

#drive-sync-toast.drive-sync-toast--error {
  border-left-color: #ea4335 !important;
  background: rgba(234,67,53,0.05);
}

#drive-sync-toast.drive-sync-toast--urgent {
  border-left-color: #f59e0b !important;
  background: rgba(245,158,11,0.14) !important;
  color: #7c2d12 !important;
  font-weight: 800 !important;
}

.drive-alert-pulse {
  animation: drive-alert-pulse 0.86s ease-in-out 0s 5 !important;
}

@keyframes drive-alert-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245,158,11,0);
  }
  42% {
    box-shadow: 0 0 0 7px rgba(245,158,11,0.28), 0 0 22px rgba(245,158,11,0.34);
  }
}

/* Modo Auto / Manual */
.lp-drive-modes {
  background: #F3F6F4 !important;
  border: 1px solid rgba(15,23,42,0.08) !important;
  border-radius: 10px !important;
  padding: 2px !important;
  gap: 2px !important;
}

#drive-mode-auto,
#drive-mode-manual {
  background: transparent !important;
  color: #6B7A72 !important;
  box-shadow: none !important;
}
#drive-mode-auto.is-active,
#drive-mode-manual.is-active {
  background: #fff !important;
  color: #0F6E56 !important;
  box-shadow: 0 1px 3px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(15,23,42,0.05) !important;
}
#drive-mode-manual.is-active { color: #1F5FAE !important; }
#drive-mode-auto:hover:not(.is-active),
#drive-mode-manual:hover:not(.is-active) {
  background: rgba(255,255,255,0.58) !important;
  color: #1F3328 !important;
}

body.is-dark-mode .lp-drive-modes {
  background: rgba(7,11,20,0.56) !important;
  border-color: rgba(148,163,184,0.22) !important;
}

body.is-dark-mode #drive-mode-auto,
body.is-dark-mode #drive-mode-manual {
  background: transparent !important;
  color: #9FB0C4 !important;
  box-shadow: none !important;
}

body.is-dark-mode #drive-mode-auto.is-active,
body.is-dark-mode #drive-mode-manual.is-active {
  background: #142238 !important;
  color: #7EF2B4 !important;
  box-shadow: inset 0 0 0 1px rgba(148,163,184,0.18), 0 1px 6px rgba(0,0,0,0.16) !important;
}

body.is-dark-mode #drive-mode-manual.is-active { color: #93C5FD !important; }
body.is-dark-mode #drive-mode-auto:hover:not(.is-active),
body.is-dark-mode #drive-mode-manual:hover:not(.is-active) {
  background: rgba(148,163,184,0.10) !important;
  color: #DCEBFF !important;
}

/* API Key inline */
.ds-apikey-row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.ds-apikey-input {
  flex: 1; padding: 6px 9px;
  border: 1px solid var(--border, #e0e0e0); border-radius: 6px;
  font-size: 12px; background: var(--surface, #fff); color: var(--text, #222);
  outline: none; transition: border-color 0.15s;
}
.ds-apikey-input:focus { border-color: #1a73e8; }
.ds-apikey-input.ds-apikey-input--error { border-color: #ea4335; }

/* Botones comunes */
.ds-btn {
  padding: 6px 12px; border: none; border-radius: 8px;
  font-size: 12px; font-weight: 800; cursor: pointer;
  transition: opacity 0.15s, background 0.15s, transform 0.15s; white-space: nowrap;
}
.ds-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.ds-btn--process { background: #00ac47; color: #fff; }
.ds-btn--process:hover:not(:disabled) { background: #009940; transform: translateY(-1px); }
.ds-btn--dismiss { background: transparent; color: var(--text-muted,#888); border: 1px solid var(--border,#e0e0e0); }
.ds-btn--dismiss:hover { background: var(--surface-soft, #f5f5f5); }
.ds-btn--save { background: #1a73e8; color: #fff; }
.ds-btn--save:hover { background: #1557b0; }

/* Tags */
.ds-tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 800; line-height: 1; text-transform: uppercase; }
.ds-tag--folder { background: #e8f5e9; color: #2e7d32; }
.ds-tag--bulk   { background: #e3f2fd; color: #1565c0; }
.ds-tag--pending { background: rgba(245,158,11,0.16); color: #A16207; }

/* Pendientes */
.ds-pending-row {
  background: #FFFFFF; border: 1px solid rgba(245,158,11,0.24);
  border-left: 3px solid #F59E0B;
  border-radius: 10px; padding: 10px 11px;
  display: flex; flex-direction: column; gap: 8px; font-size: 12px;
  box-shadow: 0 8px 18px rgba(245,158,11,0.08);
}
.ds-pending-header { display: flex; justify-content: space-between; align-items: center; }
.ds-pending-name {
  font-weight: 800; color: #17301F;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 128px;
}
.ds-pending-time { color: #6B7A72; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.ds-pending-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.ds-pending-actions { display: flex; gap: 6px; align-items: center; }
.ds-pending-select {
  flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid rgba(15,23,42,0.12);
  border-radius: 8px; font-size: 12px;
  background: #FFFFFF; color: #17301F;
}

/* Procesados */
.ds-proc-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 10px; background: var(--surface,#fff);
  border: 1px solid var(--border,#e0e0e0); border-radius: 6px; font-size: 11px;
}
.ds-proc-name {
  color: var(--text,#222); overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; max-width: 130px;
}
.ds-proc-meta { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
.ds-proc-picker { color: var(--text-muted,#888); }
.ds-proc-time   { color: var(--text-muted,#888); }

/* Panel archivos existentes */
.ds-ep-panel {
  display: block; margin-top: 10px;
  border: 1px solid rgba(0,172,71,0.18); border-radius: 12px;
  overflow: hidden; background: #FFFFFF;
  box-shadow: 0 10px 24px rgba(15,23,42,0.06);
}
.ds-ep-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 10px; background: linear-gradient(180deg, rgba(0,172,71,0.10), rgba(0,172,71,0.04));
  border-bottom: 1px solid rgba(0,172,71,0.14);
}
.ds-ep-nav { display: grid; grid-template-columns: 28px minmax(0,1fr) 28px; align-items: center; gap: 7px; width: 100%; }
.ds-ep-btn-nav {
  display: grid; place-items: center; width: 28px; height: 28px;
  background: #FFFFFF; border: 1px solid rgba(0,172,71,0.18);
  border-radius: 8px; cursor: pointer; font-size: 18px;
  padding: 0; color: #0F6E56; line-height: 1; transition: background 0.15s, border-color 0.15s;
}
.ds-ep-btn-nav:hover { background: rgba(0,172,71,0.10); border-color: rgba(0,172,71,0.32); }
.ds-ep-title-wrap {
  display: flex; flex-direction: column; align-items: center; min-width: 0; gap: 1px;
}
.ds-ep-title {
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 11px; font-weight: 900; color: #0F6E56;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ds-ep-subtitle {
  font-size: 10px; font-weight: 800; color: #64746C;
}
.ds-ep-close {
  display: none;
  background: transparent; border: none; cursor: pointer;
  color: #5C6F63; font-size: 16px; line-height: 1; padding: 0 2px; transition: color 0.15s;
}
.ds-ep-close:hover { color: #17301F; }
.ds-ep-body { max-height: 280px; overflow-y: auto; padding: 8px; display: grid; gap: 7px; }
.ds-ep-file-row {
  display: flex; flex-direction: column; gap: 6px;
  min-height: 88px; padding: 9px;
  border: 1px solid rgba(15,23,42,0.08); border-radius: 10px;
  background: #FFFFFF;
}
.ds-ep-file-row--done {
  background: rgba(0,172,71,0.055);
  border-color: rgba(0,172,71,0.16);
}
.ds-ep-file-top {
  display: grid; grid-template-columns: 34px minmax(0,1fr) auto;
  align-items: center; gap: 8px; min-width: 0;
}
.ds-ep-file-kind {
  display: grid; place-items: center; width: 34px; height: 30px;
  border-radius: 8px; background: rgba(79,70,229,0.08); color: #4F46E5;
  font-size: 10px; font-weight: 900;
}
.ds-ep-file-copy {
  display: flex; flex-direction: column; min-width: 0; gap: 2px;
}
.ds-ep-file-name {
  font-size: 12px; font-weight: 850; color: #17301F;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ds-ep-file-meta {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 2px; flex-shrink: 0;
}
.ds-ep-file-date  { font-size: 10px; color: #5C6F63; font-weight: 800; }
.ds-ep-file-time  { font-size: 10px; color: #1a73e8; font-weight: 800; }
.ds-ep-file-folder {
  font-size: 10px; color: #5C6F63; font-weight: 700;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ds-ep-file-actions { display: flex; gap: 5px; align-items: center; }
.ds-ep-select {
  flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid rgba(15,23,42,0.12);
  border-radius: 8px; font-size: 11px; background: #fff; color: #17301F;
}
.ds-ep-btn-process { padding: 6px 11px !important; font-size: 11px !important; }
.ds-ep-done-badge {
  flex: 1; padding: 6px 10px; background: #E8F8ED; color: #12833D;
  border-radius: 8px; font-size: 11px; font-weight: 900; text-align: center;
}
.ds-ep-empty, .ds-ep-loading {
  padding: 14px; text-align: center; color: #5C6F63; font-size: 12px;
}

/* Ajuste visual para acercar el panel al mockup aprobado */
#drive-sync-panel {
  gap: 11px !important;
  padding: 14px 12px !important;
  background: #FFFFFF !important;
  border-color: #DFE7E2 !important;
  border-radius: 14px !important;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08) !important;
}
#drive-sync-panel.is-monitoring {
  border-color: #D9E8DF !important;
}
.lp-drive-header {
  grid-template-columns: 32px minmax(0, 1fr) auto !important;
  grid-template-rows: auto auto !important;
  gap: 2px 10px !important;
  padding: 7px 4px 12px !important;
  cursor: pointer !important;
  border-radius: 12px !important;
  transition: background .16s ease, box-shadow .16s ease, transform .16s ease !important;
}
.lp-drive-header:hover {
  background: rgba(0, 172, 71, 0.06) !important;
  box-shadow: inset 0 0 0 1px rgba(0, 172, 71, 0.08) !important;
}
.lp-drive-header:focus-visible {
  outline: 3px solid rgba(0, 172, 71, 0.22) !important;
  outline-offset: 3px !important;
}
.lp-drive-header > svg {
  grid-row: 1 / 3 !important;
  width: 28px !important;
  height: 28px !important;
}
.lp-drive-copy {
  grid-column: 2 !important;
  grid-row: 1 !important;
  display: grid !important;
  gap: 2px !important;
  min-width: 0 !important;
}
.lp-drive-title {
  color: #111827 !important;
  font-size: 14px !important;
  font-weight: 900 !important;
  line-height: 1.1 !important;
}
#drive-sync-status {
  color: #00883A !important;
  font-size: 11px !important;
  font-weight: 850 !important;
}
#drive-file-count {
  grid-column: 2 !important;
  grid-row: 2 !important;
  align-self: start !important;
  justify-self: start !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  gap: 4px !important;
  flex-direction: row !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  color: #4B5563 !important;
  transform: none !important;
}
#drive-file-count:hover {
  background: transparent !important;
  border-color: transparent !important;
  transform: none !important;
}
#drive-file-count-num,
#drive-file-count .drive-file-count-label {
  color: #4B5563 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
}
#drive-token-clock {
  grid-column: 3 !important;
  grid-row: 1 / 3 !important;
  align-self: center !important;
  justify-self: end !important;
  margin-left: 0 !important;
  min-height: 31px !important;
  display: inline-flex !important;
  align-items: center !important;
  border: 1px solid rgba(0, 172, 71, 0.16) !important;
  border-radius: 9px !important;
  background: rgba(0, 172, 71, 0.08) !important;
  color: #00883A !important;
  font-weight: 900 !important;
}
.lp-drive-modes {
  height: 38px !important;
  padding: 3px !important;
  border-radius: 10px !important;
  background: #F4F6F5 !important;
}
#drive-mode-auto,
#drive-mode-manual {
  height: 30px !important;
  border-radius: 8px !important;
  font-size: 11px !important;
}
#drive-day-status {
  min-height: 58px !important;
  padding: 11px 10px !important;
  background: #FFFFFF !important;
  border-color: #E1E9E4 !important;
  border-radius: 10px !important;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.035) !important;
}
#drive-day-icon {
  width: 25px !important;
  height: 25px !important;
  color: #111827 !important;
  flex-shrink: 0 !important;
}
.lp-drive-folder-btn {
  height: 32px !important;
  min-width: 86px !important;
  border-color: #DDE5E1 !important;
  background: #FFFFFF !important;
  color: #374151 !important;
  font-weight: 750 !important;
}
.drive-user-action-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(188px, .95fr);
  gap: 8px;
  align-items: stretch;
}
.drive-user-action-row .drive-picker-row,
.drive-user-action-row .lp-drive-btns-row {
  min-width: 0;
}
.drive-user-action-row .drive-picker-control {
  height: 100%;
  min-height: 45px;
}
.drive-user-action-row .lp-drive-btns-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 8px !important;
  position: relative !important;
}
.drive-user-action-row #drive-sync-btn,
.drive-user-action-row #drive-sync-stop {
  width: 100%;
  min-width: 0;
  padding-left: 10px !important;
  padding-right: 10px !important;
  line-height: 1.05;
  white-space: normal;
}
#drive-sync-btn,
#drive-sync-stop {
  min-height: 45px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
}
.lp-drive-sound-trigger {
  width: 45px !important;
  min-width: 45px !important;
  border-radius: 10px !important;
}
#drive-pending-section {
  padding: 10px 0 0 !important;
  background: transparent !important;
  border-width: 1px 0 0 !important;
  border-color: #E4EBE7 !important;
  border-radius: 0 !important;
}
.lp-pending-label {
  padding: 0 2px !important;
  color: #111827 !important;
  font-size: 11px !important;
  font-weight: 900 !important;
}
.lp-pending-label::before {
  content: "";
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 999px;
  background: #F59E0B;
}
.lp-pending-label span {
  margin-right: auto;
}
#drive-no-pending {
  margin-top: 7px !important;
  padding: 16px 10px !important;
  background: #F8FAF9 !important;
  border: 1px solid #E4EBE7 !important;
  border-radius: 10px !important;
  color: #667085 !important;
}
.ds-ep-panel {
  margin-top: 0 !important;
  border-color: #DDEBE4 !important;
  border-radius: 10px !important;
  background: #FFFFFF !important;
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.045) !important;
}
.ds-ep-header {
  padding: 9px 8px !important;
  background: linear-gradient(180deg, #EFFAF4 0%, #F7FCF9 100%) !important;
  border-color: #DDEBE4 !important;
}
.ds-ep-title {
  font-size: 11px !important;
  letter-spacing: .04em !important;
}
.ds-ep-subtitle {
  color: #0F6E56 !important;
  font-size: 10px !important;
}
.ds-ep-body {
  max-height: 310px !important;
  padding: 0 !important;
  gap: 0 !important;
  display: block !important;
}
.ds-ep-file-row {
  min-height: 76px !important;
  padding: 11px 12px !important;
  border-width: 0 0 1px !important;
  border-color: #E8EEE9 !important;
  border-radius: 0 !important;
  background: #FFFFFF !important;
  box-shadow: none !important;
}
.ds-ep-file-row--done {
  background: #FFFFFF !important;
}
.ds-ep-file-top {
  grid-template-columns: 30px minmax(0, 1fr) auto !important;
  gap: 8px !important;
}
.ds-ep-file-kind {
  width: 26px !important;
  height: 26px !important;
  border-radius: 7px !important;
  background: #EEF2FF !important;
  color: #4F46E5 !important;
  font-size: 9px !important;
}
.ds-ep-file-name {
  font-size: 12px !important;
  font-weight: 900 !important;
  color: #111827 !important;
}
.ds-ep-file-folder {
  color: #4B5563 !important;
  font-size: 11px !important;
  font-weight: 650 !important;
}
.ds-ep-file-date,
.ds-ep-file-time {
  font-size: 10px !important;
  font-weight: 800 !important;
}
.ds-ep-file-actions.is-done {
  justify-content: flex-end !important;
  padding-left: 38px !important;
}
.ds-ep-done-badge {
  flex: 0 0 auto !important;
  min-width: 86px !important;
  padding: 5px 9px !important;
  border-radius: 7px !important;
  background: #E7F8EE !important;
  color: #00883A !important;
  font-size: 10px !important;
}
.ds-ep-type-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 900;
}
.ds-ep-type-chip--flex {
  background: #E8F8ED;
  color: #138A3D;
}
.ds-ep-type-chip--colecta {
  background: #EAF2FF;
  color: #1167D8;
}
.ds-ep-summary {
  margin: 9px 10px 10px;
  padding: 9px 10px;
  border-radius: 9px;
  background: #EFFAF4;
  color: #00883A;
  font-size: 11px;
  font-weight: 900;
  text-align: center;
}

/* Variante 2: Alertas, panel mas ancho y tarjetas mas amplias */
.panels-container {
  grid-template-columns: 470px minmax(0, 1fr) !important;
}

.panel-left,
.panel-left.panel {
  width: 470px !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
}

#drive-sync-panel {
  padding: 18px 18px 20px !important;
  gap: 15px !important;
}

.lp-drive-header {
  grid-template-columns: 36px minmax(0, 1fr) auto !important;
  gap: 3px 12px !important;
  padding: 7px 4px 14px !important;
  cursor: pointer !important;
  border-radius: 13px !important;
  transition: background .16s ease, box-shadow .16s ease, transform .16s ease !important;
}

.lp-drive-header:hover {
  background: rgba(0, 172, 71, 0.06) !important;
  box-shadow: inset 0 0 0 1px rgba(0, 172, 71, 0.08) !important;
}

.lp-drive-header:focus-visible {
  outline: 3px solid rgba(0, 172, 71, 0.22) !important;
  outline-offset: 3px !important;
}

.lp-drive-header > svg {
  width: 31px !important;
  height: 31px !important;
}

.lp-drive-title {
  font-size: 16px !important;
}

#drive-sync-status,
#drive-file-count-num,
#drive-file-count .drive-file-count-label {
  font-size: 12px !important;
}

#drive-token-clock {
  min-height: 36px !important;
  padding: 0 12px !important;
  border-radius: 11px !important;
}

.lp-drive-modes {
  height: 34px !important;
  padding: 2px !important;
  gap: 2px !important;
  border-radius: 999px !important;
  background: #F7FAF8 !important;
  border-color: #E3ECE6 !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.82) !important;
}

#drive-mode-auto,
#drive-mode-manual {
  position: relative !important;
  height: 28px !important;
  border-radius: 999px !important;
  font-size: 11px !important;
  font-weight: 850 !important;
  letter-spacing: 0 !important;
  color: #68786F !important;
}

#drive-mode-auto.is-active,
#drive-mode-manual.is-active {
  background: #FFFFFF !important;
  color: #008C3A !important;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08), inset 0 0 0 1px rgba(0, 172, 71, 0.10) !important;
}

#drive-mode-manual.is-active {
  color: #1F5FAE !important;
}

#drive-mode-auto.is-active::after,
#drive-mode-manual.is-active::after {
  content: "" !important;
  position: absolute !important;
  left: 50% !important;
  bottom: 4px !important;
  width: 18px !important;
  height: 2px !important;
  border-radius: 999px !important;
  transform: translateX(-50%) !important;
  background: #00B34D !important;
}

#drive-mode-manual.is-active::after {
  background: #1F5FAE !important;
}

#drive-alert-banner {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0;
  border-radius: 0;
  border: 0;
  background: transparent;
  color: #007C34;
  box-shadow: none;
  cursor: pointer;
}

#drive-alert-banner[hidden] {
  display: none !important;
}

.drive-alert-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #00A846;
  color: #FFFFFF;
  box-shadow: 0 8px 18px rgba(0, 172, 71, 0.25);
}

.drive-alert-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.drive-alert-copy strong {
  font-size: 11px;
  font-weight: 950;
  letter-spacing: .02em;
  color: #007C34;
}

.drive-alert-copy small {
  font-size: 11px;
  font-weight: 650;
  color: #344E41;
}

.drive-alert-arrow {
  font-size: 24px;
  font-weight: 700;
  color: #007C34;
  line-height: 1;
}

#drive-day-status {
  display: none;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 9px !important;
  min-height: 64px !important;
  padding: 11px 12px !important;
  background: #FFFFFF !important;
  border-color: #E1E9E4 !important;
  border-radius: 12px !important;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.035) !important;
}

#drive-day-status.has-files {
  background: linear-gradient(180deg, #F1FFF6 0%, #FFFFFF 100%) !important;
  border-color: rgba(0, 172, 71, 0.30) !important;
  box-shadow: 0 8px 18px rgba(0, 172, 71, 0.08) !important;
}

.drive-day-folder-row {
  display: grid !important;
  grid-template-columns: 32px minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: 10px !important;
}

#drive-alert-banner:not([hidden]) + .drive-day-folder-row {
  padding-top: 9px !important;
  border-top: 1px solid rgba(0, 172, 71, 0.14) !important;
}

.drive-day-copy {
  min-width: 0 !important;
}

#drive-day-name {
  font-weight: 900 !important;
  color: var(--text) !important;
  line-height: 1.12 !important;
}

.drive-day-subtitle {
  font-size: 11px !important;
  color: var(--text-muted) !important;
  line-height: 1.2 !important;
}

#drive-day-icon {
  width: 29px !important;
  height: 29px !important;
}

.lp-drive-folder-btn {
  min-width: 104px !important;
  height: 36px !important;
}

.drive-user-action-row {
  grid-template-columns: minmax(118px, .62fr) minmax(0, 1fr) !important;
  gap: 8px !important;
  align-items: stretch !important;
}

.drive-user-action-row .drive-picker-control {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  grid-template-rows: auto minmax(0, 1fr) !important;
  align-items: center !important;
  gap: 3px !important;
  min-height: 46px !important;
  padding: 6px 7px !important;
  border-radius: 12px !important;
  border-color: #DCE8E1 !important;
  background: linear-gradient(180deg, #FFFFFF 0%, #F7FAF8 100%) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.80), 0 4px 12px rgba(15, 23, 42, 0.04) !important;
}

.drive-user-action-row .drive-picker-control > span {
  font-size: 9px !important;
  line-height: 1 !important;
  letter-spacing: .08em !important;
  color: #607168 !important;
}

.drive-user-action-row .drive-picker-control select {
  width: 100% !important;
  min-width: 0 !important;
  height: 26px !important;
  padding: 0 22px 0 8px !important;
  border: 1px solid #E2EAE5 !important;
  background: #FFFFFF !important;
  color: #10251A !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  text-overflow: ellipsis !important;
}

.drive-user-action-row .lp-drive-btns-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 8px !important;
  position: relative !important;
}

.drive-user-action-row #drive-sync-btn,
.drive-user-action-row #drive-sync-stop {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 46px !important;
  padding: 0 9px !important;
  gap: 6px !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  line-height: 1.05 !important;
  white-space: nowrap !important;
  border-radius: 12px !important;
  box-shadow: 0 9px 18px rgba(0, 172, 71, 0.16), inset 0 1px 0 rgba(255,255,255,0.22) !important;
}

#drive-sync-btn,
#drive-sync-stop {
  min-height: 52px !important;
  font-size: 14px !important;
}

.lp-drive-sound-trigger {
  width: 52px !important;
  min-width: 52px !important;
}

#drive-no-pending {
  padding: 20px 12px !important;
}

.ds-ep-panel {
  border-radius: 13px !important;
}

.ds-ep-header {
  padding: 11px 10px !important;
}

.ds-ep-file-row {
  min-height: 88px !important;
  padding: 13px 14px !important;
}

.ds-ep-file-top {
  grid-template-columns: 34px minmax(0, 1fr) auto !important;
  gap: 11px !important;
}

.ds-ep-file-kind {
  width: 30px !important;
  height: 30px !important;
}

.ds-ep-file-name {
  font-size: 13px !important;
}

.ds-ep-file-folder {
  font-size: 12px !important;
}

.ds-ep-done-badge,
.ds-ep-type-chip {
  min-width: 94px !important;
  padding-top: 7px !important;
  padding-bottom: 7px !important;
}

body.is-dark-mode #drive-alert-banner {
  background: transparent !important;
  border-color: transparent !important;
  color: #D1FAE5 !important;
  box-shadow: none !important;
}

body.is-dark-mode #drive-day-status.has-files {
  background: linear-gradient(180deg, rgba(16,185,129,0.15), rgba(15,23,42,0.42)) !important;
  border-color: rgba(52, 211, 153, 0.34) !important;
}

body.is-dark-mode #drive-alert-banner:not([hidden]) + .drive-day-folder-row {
  border-top-color: rgba(52, 211, 153, 0.22) !important;
}

body.is-dark-mode #drive-day-name {
  color: #F1F7FF !important;
}

body.is-dark-mode .drive-day-subtitle {
  color: #B8C7DC !important;
}

body.is-dark-mode .drive-alert-icon {
  background: #10B981 !important;
}

body.is-dark-mode .drive-alert-copy strong,
body.is-dark-mode .drive-alert-arrow {
  color: #A7F3D0 !important;
}

body.is-dark-mode .drive-alert-copy small {
  color: #D1FAE5 !important;
}

body.is-dark-mode .drive-picker-control {
  background: #13233B !important;
  border-color: rgba(148, 163, 184, 0.26) !important;
}

body.is-dark-mode .drive-user-action-row .drive-picker-control {
  background: linear-gradient(180deg, #13233B 0%, #101D31 100%) !important;
  border-color: rgba(148, 163, 184, 0.28) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 18px rgba(0,0,0,0.18) !important;
}

body.is-dark-mode .drive-picker-control > span {
  color: #B8C7DC !important;
}

body.is-dark-mode .drive-picker-control select {
  background: #0A1220 !important;
  border-color: rgba(148, 163, 184, 0.30) !important;
  color: #F1F7FF !important;
}

body.is-dark-mode .drive-user-action-row .drive-picker-control select {
  background: #0A1220 !important;
  border-color: rgba(148, 163, 184, 0.30) !important;
  color: #F1F7FF !important;
}

@media (max-width: 900px) {
  .panels-container {
    grid-template-columns: 1fr !important;
  }

  .panel-left,
  .panel-left.panel {
    width: 100% !important;
  }
}

/* Reloj de expiración del token */
.ds-token-clock {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: #00ac47;
  background: rgba(0,172,71,0.10);
  border-radius: 8px;
  padding: 2px 8px;
  margin-left: auto;
  flex-shrink: 0;
  transition: color 0.4s, background 0.4s;
  cursor: default;
}
.ds-token-clock--warning {
  color: #e65100;
  background: rgba(230,81,0,0.10);
}
.ds-token-clock--critical {
  color: #c62828;
  background: rgba(198,40,40,0.12);
  animation: ds-pulse 1s ease-in-out infinite;
}
@keyframes ds-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

body.carrier-print-lock {
  overflow: hidden !important;
}

.carrier-print-modal[hidden] {
  display: none !important;
}

.carrier-print-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 18px;
}

.carrier-print-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 28, 23, 0.58);
  backdrop-filter: blur(3px);
}

.carrier-print-dialog {
  position: relative;
  width: min(1180px, calc(100vw - 36px));
  height: min(780px, calc(100vh - 36px));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid rgba(15,23,42,0.12);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 22px 70px rgba(11, 25, 19, 0.28);
  overflow: hidden;
}

.carrier-print-head,
.carrier-print-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  background: #fff;
  border-bottom: 1px solid rgba(15,23,42,0.08);
}

.carrier-print-actions {
  justify-content: flex-end;
  border-top: 1px solid rgba(15,23,42,0.08);
  border-bottom: 0;
}

.carrier-print-kicker {
  display: block;
  margin-bottom: 3px;
  color: #00a650;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.carrier-print-head h2 {
  margin: 0;
  color: #17352f;
  font-size: 18px;
  line-height: 1.15;
}

.carrier-print-head p {
  margin: 4px 0 0;
  color: #65766f;
  font-size: 12px;
  line-height: 1.35;
}

.carrier-print-close {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 8px;
  background: #f8fbfa;
  color: #17352f;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
}

.carrier-print-body {
  min-height: 0;
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  background: #f3f7f5;
}

.carrier-print-side {
  min-height: 0;
  padding: 14px;
  border-right: 1px solid rgba(15,23,42,0.08);
  background: #fff;
  overflow: auto;
}

.carrier-print-side label {
  display: block;
  margin-bottom: 7px;
  color: #52665f;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.carrier-print-side select {
  width: 100%;
  height: 36px;
  border: 1px solid #d9e4df;
  border-radius: 8px;
  background: #fff;
  color: #17352f;
  font-size: 12px;
  font-weight: 800;
  padding: 0 10px;
}

.carrier-print-file-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.carrier-print-file {
  width: 100%;
  padding: 10px;
  border: 1px solid #e4ece8;
  border-radius: 8px;
  background: #fbfdfc;
  color: #17352f;
  text-align: left;
  cursor: pointer;
}

.carrier-print-file.is-active {
  border-color: #00a650;
  background: #edf9f2;
}

.carrier-print-file.is-printed {
  border-color: rgba(0,166,80,0.26);
  background: #f2fbf6;
}

.carrier-print-file strong,
.carrier-print-file span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.carrier-print-file strong {
  font-size: 12px;
}

.carrier-print-file span {
  margin-top: 4px;
  color: #65766f;
  font-size: 11px;
}

.carrier-print-file .carrier-print-file-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  max-width: 100%;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.carrier-print-file-status.is-printed {
  background: #ddf6e8;
  color: #008a3b;
}

.carrier-print-file-status.is-pending {
  background: #fff4d7;
  color: #8a5a00;
}

.carrier-print-viewer {
  min-width: 0;
  min-height: 0;
  padding: 12px;
}

.carrier-print-viewer iframe {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(15,23,42,0.08);
  border-radius: 10px;
  background: #fff;
}

.carrier-print-primary,
.carrier-print-secondary {
  height: 38px;
  min-width: 128px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.carrier-print-primary {
  border: 1px solid #00a650;
  background: #00a650;
  color: #fff;
}

.carrier-print-primary.is-reprint {
  border-color: #0f6e56;
  background: #0f6e56;
}

.carrier-print-secondary {
  border: 1px solid #dbe5e0;
  background: #f8fbfa;
  color: #17352f;
}

.carrier-print-primary:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

.carrier-print-empty {
  padding: 12px;
  border: 1px solid #e4ece8;
  border-radius: 8px;
  background: #fbfdfc;
  color: #65766f;
  font-size: 12px;
  line-height: 1.4;
}

.carrier-print-empty.is-error {
  border-color: rgba(220, 38, 38, 0.22);
  background: rgba(220, 38, 38, 0.05);
  color: #9f1239;
}

body.is-dark-mode .carrier-print-dialog,
body.is-dark-mode .carrier-print-head,
body.is-dark-mode .carrier-print-actions,
body.is-dark-mode .carrier-print-side {
  background: #102039;
  border-color: rgba(148,163,184,0.18);
}

body.is-dark-mode .carrier-print-body {
  background: #0b1628;
}

body.is-dark-mode .carrier-print-head h2,
body.is-dark-mode .carrier-print-file strong,
body.is-dark-mode .carrier-print-close,
body.is-dark-mode .carrier-print-secondary,
body.is-dark-mode .carrier-print-side select {
  color: #eef6ff;
}

body.is-dark-mode .carrier-print-head p,
body.is-dark-mode .carrier-print-file span,
body.is-dark-mode .carrier-print-side label {
  color: #aabbd0;
}

body.is-dark-mode .carrier-print-side select,
body.is-dark-mode .carrier-print-file,
body.is-dark-mode .carrier-print-close,
body.is-dark-mode .carrier-print-secondary {
  background: #0a1220;
  border-color: rgba(148,163,184,0.24);
}

body.is-dark-mode .carrier-print-file.is-active {
  border-color: #15c978;
  background: rgba(21,201,120,0.12);
}

body.is-dark-mode .carrier-print-file-status.is-printed {
  background: rgba(22,163,74,0.22);
  color: #86efac;
}

body.is-dark-mode .carrier-print-file-status.is-pending {
  background: rgba(245,158,11,0.18);
  color: #fcd34d;
}

body.is-dark-mode #drive-sync-toast,
body.is-dark-mode .ds-pending-row,
body.is-dark-mode .ds-proc-row,
body.is-dark-mode .ds-ep-panel,
body.is-dark-mode .ds-ep-file-row,
body.is-dark-mode .ds-ep-file-row--done {
  background: #101A2C !important;
  border-color: rgba(148,163,184,0.26) !important;
  color: #F1F7FF !important;
  box-shadow: none !important;
}

body.is-dark-mode #drive-sync-panel.drive-panel--urgent {
  border-color: rgba(251,191,36,0.58) !important;
  box-shadow: 0 0 0 2px rgba(251,191,36,0.14), 0 14px 32px rgba(0,0,0,0.32) !important;
}

body.is-dark-mode #drive-file-count.has-files,
body.is-dark-mode .lp-drive-folder-btn {
  background: #13233B !important;
  border-color: rgba(148,163,184,0.26) !important;
  color: #DCEBFF !important;
}

body.is-dark-mode #drive-sync-status.drive-sync-status--active {
  color: #A7F3D0 !important;
  font-weight: 900 !important;
  text-shadow: 0 0 12px rgba(52,211,153,0.22) !important;
}

body.is-dark-mode #drive-file-count.has-files {
  background: rgba(16,185,129,0.16) !important;
  border-color: rgba(52,211,153,0.34) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05) !important;
}

body.is-dark-mode #drive-file-count-num {
  color: #A7F3D0 !important;
  font-weight: 950 !important;
}

body.is-dark-mode #drive-file-count .drive-file-count-label {
  color: #D1FAE5 !important;
  font-weight: 850 !important;
}

body.is-dark-mode #drive-pending-section.has-pending {
  background: rgba(245,158,11,0.14) !important;
  border-color: rgba(251,191,36,0.34) !important;
}

body.is-dark-mode .ds-ep-header {
  background: linear-gradient(180deg, #13233B 0%, #101A2C 100%) !important;
  border-color: rgba(148,163,184,0.24) !important;
}

body.is-dark-mode .ds-apikey-input,
body.is-dark-mode .ds-pending-select,
body.is-dark-mode .ds-ep-select {
  background: #0A1220 !important;
  border-color: rgba(148,163,184,0.30) !important;
  color: #F1F7FF !important;
}

body.is-dark-mode .ds-pending-name,
body.is-dark-mode .ds-proc-name,
body.is-dark-mode .ds-ep-file-name {
  color: #F1F7FF !important;
}

body.is-dark-mode .ds-ep-file-kind {
  background: rgba(129,140,248,0.18) !important;
  color: #C4B5FD !important;
}

body.is-dark-mode .ds-pending-time,
body.is-dark-mode .ds-proc-picker,
body.is-dark-mode .ds-proc-time,
body.is-dark-mode .ds-ep-file-date,
body.is-dark-mode .ds-ep-file-folder,
body.is-dark-mode .ds-ep-empty,
body.is-dark-mode .ds-ep-loading,
body.is-dark-mode .ds-ep-close,
body.is-dark-mode .ds-btn--dismiss {
  color: #B8C7DC !important;
}

body.is-dark-mode .ds-proc-meta,
body.is-dark-mode .ds-ep-file-meta,
body.is-dark-mode .ds-ep-subtitle,
body.is-dark-mode .ds-ep-summary {
  color: #B8C7DC !important;
}

body.is-dark-mode .ds-ep-summary {
  background: rgba(16,185,129,0.14) !important;
  border: 1px solid rgba(52,211,153,0.28) !important;
  color: #A7F3D0 !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04) !important;
}

body.is-dark-mode .ds-ep-title,
body.is-dark-mode .ds-ep-btn-nav {
  color: #A7F3D0 !important;
}

body.is-dark-mode .ds-ep-btn-nav,
body.is-dark-mode .ds-btn--dismiss {
  background: #13233B !important;
  border-color: rgba(148,163,184,0.30) !important;
}

body.is-dark-mode .ds-btn--dismiss:hover,
body.is-dark-mode .ds-ep-btn-nav:hover {
  background: #19304F !important;
  color: #FFFFFF !important;
}

body.is-dark-mode .ds-tag--folder,
body.is-dark-mode .ds-ep-done-badge {
  background: rgba(22,163,74,0.20) !important;
  color: #86EFAC !important;
}

body.is-dark-mode .ds-tag--bulk {
  background: rgba(59,130,246,0.20) !important;
  color: #93C5FD !important;
}

body.is-dark-mode .ds-tag--pending {
  background: rgba(245,158,11,0.20) !important;
  color: #FCD34D !important;
}

body.is-dark-mode .ds-ep-type-chip--flex {
  background: rgba(22,163,74,0.20) !important;
  color: #86EFAC !important;
}

body.is-dark-mode .ds-ep-type-chip--colecta {
  background: rgba(59,130,246,0.20) !important;
  color: #93C5FD !important;
}

body.is-dark-mode .carrier-print-viewer iframe {
  background: #0A1220;
  border-color: rgba(148,163,184,0.24);
}

body.is-dark-mode #drive-sync-toast.drive-sync-toast--urgent {
  background: rgba(245,158,11,0.20) !important;
  border-color: rgba(251,191,36,0.58) !important;
  color: #FEF3C7 !important;
}

/* Refuerzo general de contraste en modo oscuro */
body.is-dark-mode {
  --text: #F4F8FF;
  --text-muted: #C7D6EA;
}

body.is-dark-mode .ds-pending-time,
body.is-dark-mode .ds-proc-picker,
body.is-dark-mode .ds-proc-time,
body.is-dark-mode .ds-proc-meta,
body.is-dark-mode .ds-ep-file-date,
body.is-dark-mode .ds-ep-file-time,
body.is-dark-mode .ds-ep-file-folder,
body.is-dark-mode .ds-ep-file-meta,
body.is-dark-mode .ds-ep-subtitle,
body.is-dark-mode .ds-ep-empty,
body.is-dark-mode .ds-ep-loading,
body.is-dark-mode #drive-sync-status,
body.is-dark-mode #drive-file-count,
body.is-dark-mode #drive-file-count .drive-file-count-label,
body.is-dark-mode .drive-day-subtitle,
body.is-dark-mode .drive-alert-copy small {
  color: #C7D6EA !important;
  opacity: 1 !important;
}

body.is-dark-mode .ds-pending-name,
body.is-dark-mode .ds-proc-name,
body.is-dark-mode .ds-ep-file-name,
body.is-dark-mode #drive-file-count-num,
body.is-dark-mode #drive-day-name {
  color: #F4F8FF !important;
  opacity: 1 !important;
}

body.is-dark-mode #drive-sync-status.drive-sync-status--active,
body.is-dark-mode #drive-file-count.has-files,
body.is-dark-mode #drive-file-count.has-files #drive-file-count-num,
body.is-dark-mode #drive-file-count.has-files .drive-file-count-label,
body.is-dark-mode .ds-ep-summary {
  color: #A7F3D0 !important;
  opacity: 1 !important;
}

body.is-dark-mode .ds-tag,
body.is-dark-mode .ds-ep-type-chip,
body.is-dark-mode .ds-ep-done-badge {
  filter: none !important;
  opacity: 1 !important;
}

@media (max-width: 820px) {
  .carrier-print-dialog {
    height: calc(100vh - 24px);
    width: calc(100vw - 24px);
  }
  .carrier-print-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }
  .carrier-print-side {
    max-height: 190px;
    border-right: 0;
    border-bottom: 1px solid rgba(15,23,42,0.08);
  }
}
`;
    document.head.appendChild(style);
}

// ─── Botón de prueba de sonidos ────────────────────────────────────────────────

function _injectSoundTestButton() {
    const panel = document.getElementById('drive-sync-panel');
    if (!panel) return;

    let btn = document.getElementById('drive-sound-test-btn');
    let label = document.getElementById('drive-sound-test-label');
    if (!btn || !label) {
        const wrap = document.createElement('div');
        wrap.className = 'lp-drive-sound-row';

        btn = document.createElement('button');
        btn.id = 'drive-sound-test-btn';
        btn.type = 'button';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>Probar sonidos`;

        label = document.createElement('span');
        label.id = 'drive-sound-test-label';

        wrap.append(btn, label);
        panel.appendChild(wrap);
    }

    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', event => {
        event.preventDefault();
    });
}

function _toggleSoundMenu(force) {
    const trigger = document.getElementById('drive-sound-menu-btn');
    const popover = document.getElementById('drive-sound-popover');
    if (!trigger || !popover) return;

    const shouldOpen = typeof force === 'boolean' ? force : popover.hidden;
    popover.hidden = !shouldOpen;
    trigger.setAttribute('aria-expanded', String(shouldOpen));
}

function _initSoundMenu() {
    const trigger = document.getElementById('drive-sound-menu-btn');
    const popover = document.getElementById('drive-sound-popover');
    if (!trigger || !popover || trigger.dataset.bound === '1') return;

    trigger.dataset.bound = '1';
    document.addEventListener('click', event => {
        if (popover.hidden) return;
        if (popover.contains(event.target) || trigger.contains(event.target)) return;
        _toggleSoundMenu(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') _toggleSoundMenu(false);
    });
}

function _initSoundSettings() {
    Object.keys(DEFAULT_SOUND_SELECTION).forEach(type => {
        const select = document.getElementById(`drive-sound-${type}`);
        if (!select) return;

        if (!select.options.length) {
            select.innerHTML = Object.entries(SOUND_PRESETS)
                .map(([value, preset]) => `<option value="${value}">${preset.label}</option>`)
                .join('');
        }
        select.value = _getSoundPresetId(type);

        if (select.dataset.bound === '1') return;
        select.dataset.bound = '1';
        select.addEventListener('change', () => _setSoundSelection(type, select.value));
    });
}

async function _runSoundTest() {
    const btn = document.getElementById('drive-sound-test-btn');
    const label = document.getElementById('drive-sound-test-label');
    if (!btn || !label || btn.dataset.playing) return;

    btn.dataset.playing = '1';
    btn.style.color = 'var(--text,#555)';
    label.textContent = 'activando audio...';

    await _ensureAudioReady();

    const sounds = [
        { type: 'arrival',  delay: 0,    text: 'archivo nuevo' },
        { type: 'warning',  delay: 1200, text: 'aviso 10 min'  },
        { type: 'critical', delay: 2500, text: 'crítico 5 min' },
    ];

    sounds.forEach(({ type, delay, text }) => {
        setTimeout(() => {
            label.textContent = text;
            _audioAlert(type);
        }, delay);
    });

    setTimeout(() => {
        delete btn.dataset.playing;
        btn.style.color = '';
        label.textContent = '';
    }, 3800);
}

async function _previewConfiguredSound(type) {
    if (!DEFAULT_SOUND_SELECTION[type]) return;

    const label = document.getElementById('drive-sound-test-label');
    const preset = SOUND_PRESETS[_getSoundPresetId(type)];

    await _ensureAudioReady();
    if (label) label.textContent = `${SOUND_EVENT_LABELS[type]} · ${preset.label}`;
    _audioAlert(type);

    setTimeout(() => {
        if (label?.textContent === `${SOUND_EVENT_LABELS[type]} · ${preset.label}`) {
            label.textContent = '';
        }
    }, 1400);
}

// ─── API Pública ───────────────────────────────────────────────────────────────

const DriveSync = {

    testSounds: _runSoundTest,
    previewSound: _previewConfiguredSound,
    toggleSoundMenu: _toggleSoundMenu,
    showLabelSource: _setActiveLabelSource,
    refreshCarrierLabels: _refreshCarrierLabels,
    printCarrierLabels: _printCarrierLabels,
    openDriveWindow: _openDriveWindow,

    setMode(mode) {
        _state.mode = mode;
        localStorage.setItem(DRIVE_CONFIG.MODE_KEY, mode);
        _applyMode();
    },

    async processItem(id, pickerOverride) {
        const idx = _state.pending.findIndex(p => p.id === id);
        if (idx === -1) return;
        const item = _state.pending[idx];
        await _processFile({ fileId: item.id, name: item.name, text: item.text, bulkCount: item.bulkCount, folder: item.folder, picker: pickerOverride || _getAutoPickerValue(), uploadedAt: item.uploadedAt || null });
        _state.pending.splice(idx, 1);
        _clearArrivalReminders(id);
        _renderPending();
    },

    dismissItem(id) {
        _state.pending = _state.pending.filter(p => p.id !== id);
        _clearArrivalReminders(id);
        _renderPending();
    },

    async connect() {
        if (_state.isPolling) return;
        const btn = document.getElementById('drive-sync-btn');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Conectando...'; }

        if (!_keyStore.exists()) {          // FIX #1
            _showApiKeyInput();
            _restoreConnectBtn();
            return;
        }
        _removeApiKeyInput();

        const ok = await _authorize(false);
        if (ok) await _startPolling();
    },

    stop: _stopPolling,

    togglePanel() {
        _state.panelOpen = true;
        _state.offsetDay = 0;
        const cached = _getDriveFileCache('txt', 'mercadolibre', 0, { allowStale: true });
        if (cached) {
            _state.knownFiles = cached;
            _setFileCount(cached.length);
        } else {
            _state.knownFiles = [];
            _setFileCount(null);
        }
        _renderExistingPanel();
        if (_state.isPolling) _scan(false);
    },

    async changeDay(delta) {
        const nextOffset = _state.offsetDay + delta;
        const requestId = ++_state.dayRequestSeq;
        _state.offsetDay = nextOffset;

        const cached = _getDriveFileCache('txt', 'mercadolibre', nextOffset, { allowStale: true });
        if (cached) {
            _applyVisibleDayFiles(nextOffset, cached);
        } else {
            _state.knownFiles = [];
            _setFileCount(null);
            _renderExistingPanel();
            const body = document.getElementById('drive-ep-body');
            if (body) body.innerHTML = `<div class="ds-ep-loading">Cargando carpeta...</div>`;
        }

        try {
            const files = await _loadTxtFilesForOffset(nextOffset, { force: true, silent: true });
            if (requestId !== _state.dayRequestSeq || _state.offsetDay !== nextOffset) return;
            _applyVisibleDayFiles(nextOffset, files);

            _loadAllPdfSources(nextOffset, { force: true, silent: true })
                .then(filesBySource => {
                    if (requestId !== _state.dayRequestSeq || _state.offsetDay !== nextOffset) return;
                    _state.carrierFiles = { ..._state.carrierFiles, ...filesBySource };
                    _updateCarrierStats();
                    _renderCarrierPanel();
                })
                .catch(e => console.error('[DriveSync] changeDay PDFs:', e));
        } catch (e) {
            console.error('[DriveSync] changeDay:', e);
            if (requestId === _state.dayRequestSeq && _state.offsetDay === nextOffset) {
                _state.knownFiles = [];
                _setFileCount(0);
                _renderExistingPanel();
            }
        }
    },

    async processExisting(fileId, pickerOverride) {
        const file = _state.knownFiles.find(f => f.id === fileId);
        if (!file) return;
        try {
            const text      = await _downloadText(fileId);
            const bulkCount = _countBulks(text);
            await _processFile({ fileId, name: file.name, text, bulkCount, folder: file.folder || 'Drive', picker: pickerOverride || _getAutoPickerValue(), uploadedAt: file.createdTime || null });
            _renderExistingPanel();
        } catch {
            _setToast('Error al procesar: ' + file.name, false);
            _renderExistingPanel();
        }
    },

    init() {
        _injectStyles();
        const attach = () => {
            if (!document.getElementById('drive-sync-btn')) { setTimeout(attach, 100); return; }
            _restoreConnectBtn();
            if (Notification.permission === 'default') Notification.requestPermission();
            _observePickerOptions();
            _applyMode();
            _initPendingListeners();
            _injectSoundTestButton();
            _initSoundMenu();
            _initSoundSettings();
            _initCarrierLabelsUi();
            if (_state.processed.length > 0) _renderProcessed();
            _tryRestoreSession();
        };
        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', attach)
            : attach();
    },
};

DriveSync.init();
