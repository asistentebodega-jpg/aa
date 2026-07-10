(() => {
    function bootstrap() {
        const collectDom = () => ({
            dropzone: document.getElementById('dropzone'),
            fileInput: document.getElementById('fileInput'),
            pickerInput: document.getElementById('picker'),
            manageUsersBtn: document.getElementById('manageUsersBtn'),
            pickerMeta: document.getElementById('pickerMeta'),
            pickerManager: document.getElementById('pickerManager'),
            pickerManagerCount: document.getElementById('pickerManagerCount'),
            newPickerInput: document.getElementById('newPickerInput'),
            addPickerBtn: document.getElementById('addPickerBtn'),
            pickerList: document.getElementById('pickerList'),
            pickerListTotal: document.getElementById('pickerListTotal'),
            resultsPanel: document.getElementById('results'),
            tableBody: document.querySelector('#dataTable tbody'),
            flexStatBtn: document.getElementById('flexStatBtn'),
            colectaStatBtn: document.getElementById('colectaStatBtn'),
            totalStatBtn: document.getElementById('totalStatBtn'),
            statusSummaryCard: document.getElementById('statusSummaryCard'),
            statusSummaryList: document.getElementById('statusSummaryList'),
            countFlex: document.getElementById('countFlex'),
            countColecta: document.getElementById('countColecta'),
            countTotal: document.getElementById('countTotal'),
            countFlexSubtotal: document.getElementById('countFlexSubtotal'),
            countColectaSubtotal: document.getElementById('countColectaSubtotal'),
            countTotalFlex: document.getElementById('countTotalFlex'),
            countTotalColecta: document.getElementById('countTotalColecta'),
            countFlexNd: document.getElementById('countFlexNd'),
            countFlexCancelled: document.getElementById('countFlexCancelled'),
            countColectaNd: document.getElementById('countColectaNd'),
            countColectaCancelled: document.getElementById('countColectaCancelled'),
            downloadBtn: document.getElementById('downloadBtn'),
            clearBtn: document.getElementById('clearBtn'),
            textInput: document.getElementById('textInput'),
            processTextBtn: document.getElementById('processTextBtn'),
            printZebraBtn: document.getElementById('printZebraBtn'),
            zebraPrinterSelect: document.getElementById('zebraPrinterSelect'),
            searchInput: document.getElementById('searchInput'),
            selectedInfo: document.getElementById('selectedInfo'),
            resultsMeta: document.getElementById('resultsMeta'),
            notificationBellBtn: document.getElementById('notificationBellBtn'),
            themeToggleBtn: document.getElementById('themeToggleBtn'),
            notificationBadge: document.getElementById('notificationBadge'),
            notificationPanel: document.getElementById('notificationPanel'),
            notificationPanelCloseBtn: document.getElementById('notificationPanelCloseBtn'),
            notificationPanelRefreshBtn: document.getElementById('notificationPanelRefreshBtn'),
            notificationDriveBtn: document.getElementById('notificationDriveBtn'),
            notificationList: document.getElementById('notificationList'),
            notificationSummary: document.getElementById('notificationSummary'),
            appSystemStatus: document.getElementById('appSystemStatus'),
            storageStatus: document.getElementById('storageStatus'),
            outsideHoursToggleBtn: document.getElementById('outsideHoursToggleBtn'),
            storageSummary: document.getElementById('storageSummary'),
            storageNote: document.getElementById('storageNote'),
            historyList: document.getElementById('historyList'),
            showStoredBtn: document.getElementById('showStoredBtn'),
            clearStoredBtn: document.getElementById('clearStoredBtn'),
            cancelOrderBtn: document.getElementById('cancelOrderBtn'),
            savePortableBtn: document.getElementById('savePortableBtn'),
            messageStack: document.getElementById('messageStack'),
            orderLookupFileInput: document.getElementById('orderLookupFileInput'),
            orderLookupLoadBtn: document.getElementById('orderLookupLoadBtn'),
            downloadsWatchBtn: document.getElementById('downloadsWatchBtn'),
            orderLookupFileName: document.getElementById('orderLookupFileName'),
            orderLookupInput: document.getElementById('orderLookupInput'),
            orderLookupSearchBtn: document.getElementById('orderLookupSearchBtn'),
            orderLookupStateFilter: document.getElementById('orderLookupStateFilter'),
            orderLookupRouteFilter: document.getElementById('orderLookupRouteFilter'),
            orderLookupClearFiltersBtn: document.getElementById('orderLookupClearFiltersBtn'),
            mainStatusFilter: document.getElementById('mainStatusFilter'),
            orderLookupSummary: document.getElementById('orderLookupSummary'),
            orderLookupTableWrap: document.getElementById('orderLookupTableWrap'),
            orderLookupTableHead: document.getElementById('orderLookupTableHead'),
            orderLookupTableBody: document.getElementById('orderLookupTableBody'),
            bluexpressLabelsBtn: document.getElementById('bluexpressLabelsBtn'),
            walmartLabelsBtn: document.getElementById('walmartLabelsBtn'),
            pdfLabelFileInput: document.getElementById('pdfLabelFileInput'),
            pdfLabelPickBtn: document.getElementById('pdfLabelPickBtn'),
            pdfLabelClearBtn: document.getElementById('pdfLabelClearBtn'),
            pdfLabelDialogBtn: document.getElementById('pdfLabelDialogBtn'),
            pdfLabelPrintBtn: document.getElementById('pdfLabelPrintBtn'),
            pdfLabelWidthInput: document.getElementById('pdfLabelWidthInput'),
            pdfLabelStatus: document.getElementById('pdfLabelStatus'),
            pdfLabelProgress: document.getElementById('pdfLabelProgress'),
            pdfLabelGrid: document.getElementById('pdfLabelGrid'),
            pdfLabelEmpty: document.getElementById('pdfLabelEmpty'),
            pdfLabelPrintArea: document.getElementById('pdfLabelPrintArea'),
            pasteTitle: document.querySelector('.input-methods .method-card:last-child h3')
        });

        const dom = collectDom();
        if (!dom.dropzone || !dom.fileInput || !dom.pickerInput || !dom.tableBody) {
            return;
        }

        const App = {
            config: {
                STORAGE_KEY: 'novapet_meli_documents_v2',
                PICKERS_STORAGE_KEY: 'novapet_meli_picker_options_v1',
                OUTSIDE_HOURS_HISTORY_KEY: 'novapet_meli_after_hours_history_v1',
                ORDER_LOOKUP_STORAGE_KEY: 'novapet_meli_order_lookup_v1',
                DOWNLOADS_WATCH_STORAGE_KEY: 'novapet_meli_downloads_watch_v1',
                MANUAL_STATUS_STORAGE_KEY: 'novapet_meli_manual_status_v1',
                ZEBRA_PRINTER_STORAGE_KEY: 'novapet_meli_zebra_printer_v1',
                UI_THEME_STORAGE_KEY: 'novapet_meli_ui_theme_v1',
                DOWNLOADS_WATCH_INTERVAL_MS: 4000,
                DOWNLOADS_WATCH_STABLE_MS: 1800,
                DOWNLOADS_WATCH_FILENAME_PREFIX: 'gridviewsolicituddespacho',
                DOWNLOADS_WATCH_SUGGESTED_FOLDER: 'NovaPet-Excel',
                DOWNLOADS_HELPER_BASE_URL: 'http://127.0.0.1:9237',
                DOWNLOADS_HELPER_TOKEN_KEY: 'novapet_downloads_helper_token_v1',
                DOWNLOADS_HELPER_TOKEN_HEADER: 'X-NovaPet-Helper-Token',
                DOWNLOADS_HELPER_DEFAULT_TOKEN: 'novapet-downloads-helper-v1',
                SHEETJS_SCRIPT_SRC: 'xlsx.full.min.js',
                SHEETJS_FALLBACK_SCRIPT_SRCS: Object.freeze([
                    'xlsx.full.min.js',
                    'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'
                ]),
                PDFJS_SCRIPT_SRC: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
                PDFJS_WORKER_SRC: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
                PDF_RENDER_SCALE: 203 / 72,
                PDF_PRINT_SAFETY_MARGIN_MM: 4,
                ZEBRA_BROWSER_PRINT_BASE_URL: 'http://127.0.0.1:9100',
                ZPL_MAX_LABEL_CHARS: 250000,
                ZPL_MAX_BATCH_CHARS: 8000000,
                ZPL_BLOCKED_COMMANDS: Object.freeze([
                    '^DF', '^ID', '^JUS', '^JUF', '^JUN', '^KP', '^KD', '^XF',
                    '^HH', '^HW', '^HS', '~DG', '~DU', '~DY', '~JA', '~JR'
                ]),
                ZEBRA_PRINTERS: Object.freeze({
                    default: {
                        key: 'default',
                        label: 'Predeterminada',
                        aliases: []
                    },
                    zebra02: {
                        key: 'zebra02',
                        label: 'ZEBRA 02',
                        aliases: ['zebra 02', 'zebra02', '10.120.84.32', '10.120.84.32:9100']
                    },
                    zebra05: {
                        key: 'zebra05',
                        label: 'ZEBRA 05',
                        aliases: ['zebra 05', 'zebra05', '10.120.84.33', '10.120.84.33:9100']
                    }
                }),
                STORAGE_START_MINUTES: 7 * 60,
                STORAGE_END_MINUTES: 18 * 60,
                STORAGE_WINDOW_LABEL: '07:00 a 18:00',
                HISTORY_PREVIEW_LIMIT: 10,
                EMBEDDED_HISTORY_SCRIPT_ID: 'embeddedHistoryData',
                PORTABLE_FILENAME_PREFIX: 'ExtraccionMeli-portable',
                ORDER_LOOKUP_FIELDS: [
                    {
                        key: 'dato2',
                        label: 'DATO2',
                        required: true,
                        searchable: true,
                        aliases: ['DATO2']
                    },
                    {
                        key: 'estado',
                        label: 'ESTADO',
                        required: true,
                        aliases: ['ESTADO', 'ESTADOREV', 'ESTADOREVISION', 'ESTADOPEDIDO']
                    },
                    {
                        key: 'logisticsType',
                        label: 'RUTAS',
                        aliases: []
                    },
                    {
                        key: 'referenceNumber',
                        label: 'NRO.',
                        searchable: true,
                        aliases: ['NRO', 'DOCUMENTODEREFERENCIA', 'NROREF', 'NROREFERENCIA', 'PEDIDO', 'ORDEN']
                    },
                    {
                        key: 'buyerOrder',
                        label: 'COMPRADOR',
                        searchable: true,
                        aliases: ['COMPRADOR']
                    },
                    {
                        key: 'orderSource',
                        label: 'TIPO SOLICITUD',
                        aliases: ['TIPOSOLICITUD']
                    },
                    {
                        key: 'dispatchRoute',
                        label: 'RUTA DESPACHO',
                        aliases: ['RUTADESPACHO', 'RUTA']
                    }
                ]
            },

            dom,

            runtime: {
                storage: null,
                defaultPickerOptions: [],
                sheetJsLoadPromise: null,
                pdfJsLoadPromise: null,
                downloadsWatch: {
                    active: false,
                    processing: false,
                    mode: '',
                    directoryHandle: null,
                    timer: null,
                    pendingFiles: new Map(),
                    processedKeys: new Set(),
                    helperLastKey: ''
                },
                clockTimeFormatter: new Intl.DateTimeFormat('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }),
                dateTimeFormatter: new Intl.DateTimeFormat('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
            },

            defaults: {
                selectionMessage: '',
                emptyResultsMessage: 'Carga un archivo, pega texto o usa la busqueda para consultar documentos guardados.'
            },

            state: {
                pickerOptions: [],
                embeddedDocuments: [],
                storedDocuments: [],
                extractedRows: [],
                rawZplData: '',
                selectedRowIds: new Set(),
                selectedRowsById: new Map(),
                activeBaseRows: [],
                activeBaseMessage: '',
                currentResultRows: [],
                currentResultMessage: '',
                activeRowTypeFilter: 'all',
                activeStatusFilter: '',
                manualOrderStatuses: {},
                selectedHistoryDocumentIds: new Set(),
                outsideHoursHistoryEnabled: false,
                notificationPanelOpen: false,
                darkModeEnabled: false,
                notifications: [],
                orderLookupRows: [],
                orderLookupDisplayColumns: [],
                orderLookupFileName: '',
                orderLookupMatches: [],
                orderLookupAvailableStates: [],
                orderLookupAvailableRoutes: [],
                selectedZebraPrinter: 'default',
                pdfLabels: [],
                pdfLabelsPendingCount: 0,
                pdfLabelsNextId: 1,
                pdfLabelsPrinting: false
            },

            helpers: {
                escapeHtml(value) {
                    return String(value ?? '')
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                },

                normalizePickerName(value) {
                    return String(value ?? '').trim();
                },

                normalizeComparable(value) {
                    const normalized = String(value ?? '').trim();
                    return /^-?\d+(\.0+)?$/.test(normalized)
                        ? normalized.replace(/\.0+$/, '')
                        : normalized;
                },

                normalizeZebraPrinterKey(value) {
                    const key = String(value ?? '').trim();
                    return Object.prototype.hasOwnProperty.call(App.config.ZEBRA_PRINTERS, key)
                        ? key
                        : 'default';
                },

                normalizeHeaderKey(value) {
                    return App.helpers
                        .normalizeComparable(value)
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toUpperCase()
                        .replace(/[^A-Z0-9]+/g, '');
                },

                normalizePickerOptions(options, fallback = App.runtime.defaultPickerOptions) {
                    const source = Array.isArray(options) && options.length > 0 ? options : fallback;
                    const seen = new Set();

                    return source
                        .map(App.helpers.normalizePickerName)
                        .filter(option => {
                            const key = option.toLowerCase();
                            if (!option || seen.has(key)) {
                                return false;
                            }

                            seen.add(key);
                            return true;
                        });
                },

                summarizeDocumentType(rows = []) {
                    const counts = rows.reduce((accumulator, row) => {
                        if (row?.type === 'flex') {
                            accumulator.flex += 1;
                        } else if (row?.type === 'colecta') {
                            accumulator.colecta += 1;
                        } else {
                            accumulator.other += 1;
                        }

                        return accumulator;
                    }, { flex: 0, colecta: 0, other: 0 });

                    if (counts.flex > 0 && counts.colecta === 0 && counts.other === 0) {
                        return { key: 'flex', label: 'FLEX', detail: `${counts.flex} pedido(s)` };
                    }

                    if (counts.colecta > 0 && counts.flex === 0 && counts.other === 0) {
                        return { key: 'colecta', label: 'COLECTA', detail: `${counts.colecta} pedido(s)` };
                    }

                    if (counts.flex > 0 || counts.colecta > 0) {
                        return { key: 'mixto', label: 'MIXTO', detail: `Flex ${counts.flex} / Colecta ${counts.colecta}` };
                    }

                    return { key: 'sin-tipo', label: 'SIN TIPO', detail: `${rows.length} pedido(s)` };
                }
            },

            ui: {
                normalizeMessageType(type = 'info') {
                    return ['error', 'success', 'warning', 'info'].includes(type) ? type : 'info';
                },

                getMessageTimeout(type = 'info') {
                    const normalizedType = App.ui.normalizeMessageType(type);
                    if (normalizedType === 'error') {
                        return 5000;
                    }

                    if (normalizedType === 'success') {
                        return 3800;
                    }

                    if (normalizedType === 'warning') {
                        return 4200;
                    }

                    return 3500;
                },

                dismissMessage(item, options = {}) {
                    if (!item) {
                        return;
                    }

                    const { immediate = false } = options;
                    const removeItem = () => {
                        if (item.parentNode) {
                            item.remove();
                        }
                    };

                    if (item._messageTimer) {
                        window.clearTimeout(item._messageTimer);
                        item._messageTimer = null;
                    }

                    if (item._messageCloseTimer) {
                        window.clearTimeout(item._messageCloseTimer);
                        item._messageCloseTimer = null;
                    }

                    if (immediate) {
                        removeItem();
                        return;
                    }

                    if (item.dataset.toastState === 'leaving') {
                        return;
                    }

                    item.dataset.toastState = 'leaving';
                    item.classList.remove('is-visible');
                    item.classList.add('is-leaving');
                    item._messageCloseTimer = window.setTimeout(removeItem, 240);
                },

                showToast(message, type = 'info', options = {}) {
                    const stack = App.dom.messageStack;
                    if (!stack || !message) {
                        return;
                    }

                    const {
                        title = '',
                        sticky = false,
                        timeout = App.ui.getMessageTimeout(type)
                    } = options;
                    const normalizedType = App.ui.normalizeMessageType(type);

                    const item = document.createElement('article');
                    item.className = `app-message is-${normalizedType}`;
                    item.setAttribute('role', normalizedType === 'error' ? 'alert' : 'status');
                    item.dataset.toastState = 'entering';

                    const content = document.createElement('div');
                    content.className = 'app-message-content';

                    if (title) {
                        const titleNode = document.createElement('strong');
                        titleNode.textContent = title;
                        content.appendChild(titleNode);
                    }

                    const textNode = document.createElement('div');
                    textNode.className = 'app-message-text';
                    textNode.textContent = String(message);
                    content.appendChild(textNode);

                    const closeButton = document.createElement('button');
                    closeButton.type = 'button';
                    closeButton.className = 'app-message-close';
                    closeButton.setAttribute('aria-label', 'Cerrar mensaje');
                    closeButton.innerHTML = '&times;';
                    closeButton.addEventListener('click', () => App.ui.dismissMessage(item));

                    item.append(content, closeButton);
                    stack.prepend(item);
                    App.notifications.record({ title, message, type: normalizedType });
                    window.requestAnimationFrame(() => {
                        item.dataset.toastState = 'visible';
                        item.classList.add('is-visible');
                    });

                    while (stack.children.length > 5) {
                        App.ui.dismissMessage(stack.lastElementChild, { immediate: true });
                    }

                    if (!sticky) {
                        item._messageTimer = window.setTimeout(() => {
                            App.ui.dismissMessage(item);
                        }, timeout);
                    }
                },

                showMessage(message, type = 'info', options = {}) {
                    App.ui.showToast(message, type, options);
                },

                reportError(error, fallbackMessage, title = 'Error') {
                    console.error(error);
                    App.ui.showMessage(error?.message || fallbackMessage, 'error', { title });
                },

                updateResultsMeta(message) {
                    App.dom.resultsMeta.textContent = message || '';
                },

                setResultsVisible(visible) {
                    if (!App.dom.resultsPanel) {
                        return;
                    }

                    App.dom.resultsPanel.style.display = 'block';
                    App.dom.resultsPanel.dataset.resultsState = visible ? 'active' : 'idle';
                },

                setClearButtonVisible(visible) {
                    App.dom.clearBtn.classList.toggle('is-hidden', !visible);
                }
            },

            notifications: {
                record({ title = '', message = '', type = 'info' } = {}) {
                    if (!message) {
                        return;
                    }

                    App.state.notifications.unshift({
                        id: `notice-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
                        title: title || App.notifications.getDefaultTitle(type),
                        message: String(message),
                        type: App.ui.normalizeMessageType(type),
                        createdAt: new Date().toISOString()
                    });

                    App.state.notifications = App.state.notifications.slice(0, 8);
                    App.notifications.updateBadge();

                    if (App.state.notificationPanelOpen) {
                        App.notifications.render();
                    }
                },

                getDefaultTitle(type) {
                    return type === 'error'
                        ? 'Error'
                        : type === 'warning'
                            ? 'Atencion'
                            : type === 'success'
                                ? 'Listo'
                                : 'Aviso';
                },

                getNumberFromText(value) {
                    const match = String(value || '').match(/\d+/);
                    return match ? Number(match[0]) : 0;
                },

                getDriveModeLabel() {
                    if (document.getElementById('drive-mode-manual')?.classList.contains('is-active')) {
                        return 'Manual';
                    }

                    if (document.getElementById('drive-mode-auto')?.classList.contains('is-active')) {
                        return 'Automatico';
                    }

                    return 'Sin modo';
                },

                getSnapshot() {
                    const storedRows = App.state.storedDocuments.reduce(
                        (sum, documentItem) => sum + (Array.isArray(documentItem.rows) ? documentItem.rows.length : 0),
                        0
                    );
                    const pendingCount = document.querySelectorAll('#drive-pending-list .ds-pending-row').length;
                    const driveFileText = document.getElementById('drive-file-count-num')?.textContent || '';
                    const bluexpressCount = App.notifications.getNumberFromText(document.getElementById('countBluexpress')?.textContent);
                    const walmartCount = App.notifications.getNumberFromText(document.getElementById('countWalmart')?.textContent);
                    const orderStatusTotals = App.orderLookup?.getStatusTotals
                        ? App.orderLookup.getStatusTotals(App.state.orderLookupMatches)
                        : { withState: App.state.orderLookupMatches.length };

                    return {
                        driveStatus: App.helpers.normalizeComparable(document.getElementById('drive-sync-status')?.textContent) || 'Desconectado',
                        driveMode: App.notifications.getDriveModeLabel(),
                        driveFiles: App.notifications.getNumberFromText(driveFileText),
                        pendingCount,
                        currentRows: App.state.extractedRows.length,
                        storedDocuments: App.state.storedDocuments.length,
                        storedRows,
                        excelFileName: App.state.orderLookupFileName || '',
                        orderRows: App.state.orderLookupRows.length,
                        orderMatches: orderStatusTotals.withState,
                        bluexpressCount,
                        walmartCount,
                        storageStatus: App.helpers.normalizeComparable(App.dom.storageStatus?.textContent) || 'Sin estado'
                    };
                },

                getActiveCount(snapshot = App.notifications.getSnapshot()) {
                    const warningCount = App.state.notifications.filter(item => item.type === 'warning' || item.type === 'error').length;
                    return Math.min(99, snapshot.pendingCount + warningCount);
                },

                updateBadge() {
                    if (!App.dom.notificationBadge) {
                        return;
                    }

                    const count = App.notifications.getActiveCount();
                    App.dom.notificationBadge.textContent = count > 9 ? '9+' : String(count);
                    App.dom.notificationBadge.classList.toggle('is-visible', count > 0);
                },

                renderSummary(snapshot = App.notifications.getSnapshot()) {
                    if (!App.dom.notificationSummary) {
                        return;
                    }

                    App.dom.notificationSummary.innerHTML = `
                        <div class="notification-summary-item">
                            <strong>${App.helpers.escapeHtml(snapshot.driveFiles)}</strong>
                            <span>Drive</span>
                        </div>
                        <div class="notification-summary-item">
                            <strong>${App.helpers.escapeHtml(snapshot.currentRows)}</strong>
                            <span>Carga actual</span>
                        </div>
                        <div class="notification-summary-item">
                            <strong>${App.helpers.escapeHtml(snapshot.orderMatches)}</strong>
                            <span>Con estado</span>
                        </div>
                    `;
                },

                getRenderItems(snapshot = App.notifications.getSnapshot()) {
                    const items = [
                        {
                            type: snapshot.driveStatus.toLowerCase().includes('desconectado') ? 'warning' : 'success',
                            title: 'Google Drive',
                            body: `${snapshot.driveStatus}. Modo ${snapshot.driveMode}. ${snapshot.pendingCount} pendiente(s).`
                        },
                        {
                            type: snapshot.currentRows > 0 ? 'success' : 'info',
                            title: 'Carga actual',
                            body: snapshot.currentRows > 0
                                ? `${snapshot.currentRows} pedido(s) listo(s) para CSV o impresion.`
                                : 'Aun no hay pedidos cargados en la tabla.'
                        },
                        {
                            type: snapshot.storedDocuments > 0 ? 'success' : 'info',
                            title: 'Historial local',
                            body: `${snapshot.storedDocuments} documento(s) y ${snapshot.storedRows} pedido(s) guardado(s).`
                        },
                        {
                            type: snapshot.orderRows > 0 ? 'success' : 'warning',
                            title: 'Consulta de estados',
                            body: snapshot.orderRows > 0
                                ? `${snapshot.orderRows} pedido(s) del Excel. ${snapshot.orderMatches} coinciden con la carga actual.`
                                : 'Carga un Excel para ver Digitacion, Picking completo, N/D y otros estados.'
                        },
                        {
                            type: snapshot.bluexpressCount + snapshot.walmartCount > 0 ? 'success' : 'info',
                            title: 'Etiquetas PDF',
                            body: `Bluexpress: ${snapshot.bluexpressCount}. Walmart: ${snapshot.walmartCount}.`
                        },
                        {
                            type: 'info',
                            title: 'Almacenamiento',
                            body: snapshot.storageStatus
                        }
                    ];

                    App.state.notifications.slice(0, 3).forEach(item => {
                        items.push({
                            type: item.type,
                            title: item.title,
                            body: item.message
                        });
                    });

                    return items;
                },

                render() {
                    if (!App.dom.notificationList) {
                        return;
                    }

                    const snapshot = App.notifications.getSnapshot();
                    App.notifications.renderSummary(snapshot);
                    App.dom.notificationList.innerHTML = App.notifications.getRenderItems(snapshot)
                        .map(item => `
                            <article class="notification-item is-${App.helpers.escapeHtml(item.type)}">
                                <div>
                                    <strong>${App.helpers.escapeHtml(item.title)}</strong>
                                    <span>${App.helpers.escapeHtml(item.body)}</span>
                                </div>
                            </article>
                        `)
                        .join('');
                    App.notifications.updateBadge();
                },

                setOpen(open) {
                    App.state.notificationPanelOpen = Boolean(open);
                    if (App.dom.notificationPanel) {
                        App.dom.notificationPanel.hidden = !App.state.notificationPanelOpen;
                    }
                    if (App.dom.notificationBellBtn) {
                        App.dom.notificationBellBtn.classList.toggle('is-open', App.state.notificationPanelOpen);
                        App.dom.notificationBellBtn.setAttribute('aria-expanded', String(App.state.notificationPanelOpen));
                    }

                    if (App.state.notificationPanelOpen) {
                        App.notifications.render();
                    }
                },

                toggle() {
                    App.notifications.setOpen(!App.state.notificationPanelOpen);
                },

                openDrivePanel() {
                    try {
                        if (typeof DriveSync !== 'undefined' && DriveSync?.togglePanel) {
                            DriveSync.togglePanel();
                        }
                    } catch (error) {
                        App.ui.reportError(error, 'No fue posible abrir el panel de Drive.', 'Drive');
                    }
                }
            },

            theme: {
                loadPreference() {
                    if (!App.runtime.storage) {
                        return false;
                    }

                    try {
                        return App.runtime.storage.getItem(App.config.UI_THEME_STORAGE_KEY) === 'dark';
                    } catch (error) {
                        console.warn('No se pudo leer la preferencia de tema.', error);
                        return false;
                    }
                },

                savePreference(enabled) {
                    if (!App.runtime.storage) {
                        return;
                    }

                    try {
                        App.runtime.storage.setItem(App.config.UI_THEME_STORAGE_KEY, enabled ? 'dark' : 'light');
                    } catch (error) {
                        console.warn('No se pudo guardar la preferencia de tema.', error);
                    }
                },

                apply(enabled, options = {}) {
                    const isDark = Boolean(enabled);
                    App.state.darkModeEnabled = isDark;
                    document.body.classList.toggle('is-dark-mode', isDark);
                    document.documentElement.classList.toggle('is-dark-mode', isDark);

                    if (App.dom.themeToggleBtn) {
                        const label = isDark ? 'Desactivar modo oscuro' : 'Activar modo oscuro';
                        App.dom.themeToggleBtn.classList.toggle('is-active', isDark);
                        App.dom.themeToggleBtn.setAttribute('aria-pressed', String(isDark));
                        App.dom.themeToggleBtn.setAttribute('aria-label', label);
                        App.dom.themeToggleBtn.title = label;
                    }

                    if (options.persist) {
                        App.theme.savePreference(isDark);
                    }
                },

                toggle() {
                    App.theme.apply(!App.state.darkModeEnabled, { persist: true });
                }
            },

            systemStatus: {
                normalizeText(value) {
                    return String(value ?? '')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                        .trim();
                },

                getDriveStatusText() {
                    return document.getElementById('drive-sync-status')?.textContent || '';
                },

                getCurrentState() {
                    const driveText = App.systemStatus.normalizeText(App.systemStatus.getDriveStatusText());
                    const storageClosed = App.dom.storageStatus?.classList.contains('is-closed');

                    if (/(error|expir|reconectar|reintent|fallo|fallo|oauth)/i.test(driveText)) {
                        return {
                            key: 'error',
                            label: 'Error de conexion',
                            title: 'Hay un problema con Drive o la conexion. Revisa Conectar Drive.'
                        };
                    }

                    if (driveText.includes('monitoreando')) {
                        return {
                            key: 'monitoring',
                            label: 'Monitoreando',
                            title: 'Drive esta conectado y revisando archivos nuevos.'
                        };
                    }

                    if (driveText.includes('desconectado')) {
                        return {
                            key: 'warning',
                            label: 'Sin Drive',
                            title: 'Google Drive no esta conectado.'
                        };
                    }

                    if (storageClosed) {
                        return {
                            key: 'closed',
                            label: 'Fuera de horario',
                            title: 'El historial local esta fuera de la franja 07:00 a 18:00.'
                        };
                    }

                    return {
                        key: 'operational',
                        label: 'Sistema operativo',
                        title: 'La interfaz esta funcionando.'
                    };
                },

                refresh() {
                    const indicator = App.dom.appSystemStatus;
                    if (!indicator) {
                        return;
                    }

                    const state = App.systemStatus.getCurrentState();
                    const label = indicator.querySelector('.app-system-status-label');

                    indicator.classList.remove('is-operational', 'is-monitoring', 'is-warning', 'is-closed', 'is-error');
                    indicator.classList.add(`is-${state.key}`);
                    indicator.dataset.systemState = state.key;
                    indicator.title = state.title;
                    indicator.setAttribute('aria-label', `${state.label}: ${state.title}`);

                    if (label) {
                        label.textContent = state.label;
                    }
                }
            },

            parser: {
                hashString(value) {
                    let hash = 2166136261;

                    for (let index = 0; index < value.length; index += 1) {
                        hash ^= value.charCodeAt(index);
                        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
                    }

                    return (hash >>> 0).toString(16).padStart(8, '0');
                },

                buildDocumentFingerprint(rows) {
                    if (!Array.isArray(rows) || rows.length === 0) {
                        return '';
                    }

                    const signature = rows
                        .map(row => [
                            row.numero || '',
                            row.type || '',
                            row.picking || '',
                            row.revision || '',
                            row.zpl || ''
                        ].join('|'))
                        .join('||');

                    return `doc-${rows.length}-${App.parser.hashString(signature)}`;
                },

                getDocumentFingerprint(documentItem) {
                    if (!documentItem) {
                        return '';
                    }

                    return documentItem.fingerprint || App.parser.buildDocumentFingerprint(documentItem.rows);
                },

                buildDuplicateFilesMessage(fileNames) {
                    if (fileNames.length === 1) {
                        return `El archivo "${fileNames[0]}" ya habia sido guardado anteriormente y no se volvio a cargar.`;
                    }

                    return `Los siguientes archivos ya habian sido guardados anteriormente y no se volvieron a cargar:\n- ${fileNames.join('\n- ')}`;
                },

                readFileAsText(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = event => resolve(String(event.target?.result || ''));
                        reader.onerror = () => reject(new Error(`No se pudo leer el archivo "${file.name}".`));
                        reader.readAsText(file);
                    });
                },

                extractBlocksFromText(text) {
                    const normalizedText = String(text ?? '').replace(/\r/g, '').trim();
                    if (!normalizedText) {
                        return [];
                    }

                    const rawBlocks = normalizedText.includes('^XA')
                        ? normalizedText.split(/(?=\^XA)/gi)
                        : normalizedText.split(/\^XZ/gi);

                    return rawBlocks
                        .map(block => block.trim())
                        .filter(Boolean)
                        .map(block => block.endsWith('^XZ') ? block : `${block}^XZ`)
                        .filter(block => /"id"\s*:\s*"?\d+"?/i.test(block) || /"shipping_id"\s*:\s*"?\d+"?/i.test(block));
                },

                buildRowFromBlock(block, picker) {
                    const match = /"id"\s*:\s*"?(?<id>\d+)"?/i.exec(block)
                        || /"shipping_id"\s*:\s*"?(?<id>\d+)"?/i.exec(block);

                    if (!match) {
                        return null;
                    }

                    const normalizedBlock = String(block ?? '').trim();
                    const isFlex = /\bflex\b/i.test(normalizedBlock) || /MESA05|REVISION05/i.test(normalizedBlock);

                    return {
                        proceso: 'INT-PICK-MERCADOLIBRE-MAS',
                        numero: match.groups?.id || match[1],
                        picker,
                        picking: isFlex ? 'MESA05_CD' : 'MESA03_CD',
                        revision: isFlex ? 'REVISION05_CD' : 'REVISION03_CD',
                        type: isFlex ? 'flex' : 'colecta',
                        zpl: normalizedBlock.endsWith('^XZ') ? normalizedBlock : `${normalizedBlock}^XZ`
                    };
                },

                extractRowsFromText(text, picker) {
                    return App.parser.extractBlocksFromText(text).reduce((rows, block) => {
                        const row = App.parser.buildRowFromBlock(block, picker);
                        if (row) {
                            rows.push(row);
                        }
                        return rows;
                    }, []);
                },

                createDocumentRecord({ picker, sourceName, sourceType, text }) {
                    const rows = App.parser.extractRowsFromText(text, picker);
                    if (rows.length === 0) {
                        return null;
                    }

                    return {
                        id: `doc-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
                        picker,
                        sourceName,
                        sourceType,
                        storedAt: new Date().toISOString(),
                        fingerprint: App.parser.buildDocumentFingerprint(rows),
                        rows
                    };
                }
            },
            storage: {
                getBrowserStorage() {
                    try {
                        const testKey = '__novapet_storage_test__';
                        window.localStorage.setItem(testKey, '1');
                        window.localStorage.removeItem(testKey);
                        return window.localStorage;
                    } catch (error) {
                        return null;
                    }
                },

                loadEmbeddedPayload() {
                    const embeddedHistoryNode = document.getElementById(App.config.EMBEDDED_HISTORY_SCRIPT_ID);
                    if (!embeddedHistoryNode) {
                        return {};
                    }

                    try {
                        const parsed = JSON.parse(embeddedHistoryNode.textContent || '{}');
                        return parsed && typeof parsed === 'object' ? parsed : {};
                    } catch (error) {
                        return {};
                    }
                },

                loadStoredPickerOptions() {
                    if (!App.runtime.storage) {
                        return [];
                    }

                    try {
                        const parsed = JSON.parse(App.runtime.storage.getItem(App.config.PICKERS_STORAGE_KEY) || '[]');
                        return App.helpers.normalizePickerOptions(parsed, []);
                    } catch (error) {
                        return [];
                    }
                },

                loadEmbeddedPickerOptions() {
                    const parsed = App.storage.loadEmbeddedPayload();
                    return App.helpers.normalizePickerOptions(parsed.users, []);
                },

                normalizeManualOrderStatuses(statuses) {
                    if (!statuses || typeof statuses !== 'object') {
                        return {};
                    }

                    return Object.entries(statuses).reduce((normalizedStatuses, [rawOrderNumber, rawRecord]) => {
                        const orderNumber = App.helpers.normalizeComparable(rawOrderNumber);
                        if (!orderNumber) {
                            return normalizedStatuses;
                        }

                        const record = rawRecord && typeof rawRecord === 'object'
                            ? rawRecord
                            : { status: rawRecord };
                        const status = App.helpers.normalizeComparable(record.status) || 'PEDIDO CANCELADO';

                        normalizedStatuses[orderNumber] = {
                            status,
                            updatedAt: App.helpers.normalizeComparable(record.updatedAt) || new Date().toISOString()
                        };
                        return normalizedStatuses;
                    }, {});
                },

                loadStoredManualOrderStatuses() {
                    if (!App.runtime.storage) {
                        return {};
                    }

                    try {
                        const parsed = JSON.parse(App.runtime.storage.getItem(App.config.MANUAL_STATUS_STORAGE_KEY) || '{}');
                        return App.storage.normalizeManualOrderStatuses(parsed);
                    } catch (error) {
                        return {};
                    }
                },

                loadEmbeddedManualOrderStatuses() {
                    const parsed = App.storage.loadEmbeddedPayload();
                    return App.storage.normalizeManualOrderStatuses(parsed.manualStatuses);
                },

                persistManualOrderStatuses(statuses = App.state.manualOrderStatuses) {
                    try {
                        const normalizedStatuses = App.storage.normalizeManualOrderStatuses(statuses);
                        App.state.manualOrderStatuses = normalizedStatuses;

                        if (App.runtime.storage) {
                            App.runtime.storage.setItem(
                                App.config.MANUAL_STATUS_STORAGE_KEY,
                                JSON.stringify(normalizedStatuses)
                            );
                        }

                        App.storage.writeEmbeddedState({ manualStatuses: normalizedStatuses });
                        return true;
                    } catch (error) {
                        console.error(error);
                        App.ui.showMessage(
                            'No fue posible guardar el estado manual del pedido.',
                            'error',
                            { title: 'Pedido cancelado' }
                        );
                        return false;
                    }
                },

                normalizeDocuments(documents) {
                    if (!Array.isArray(documents)) {
                        return [];
                    }

                    const seen = new Set();

                    return [...documents]
                        .filter(documentItem => documentItem && Array.isArray(documentItem.rows))
                        .map(documentItem => ({
                            ...documentItem,
                            fingerprint: App.parser.getDocumentFingerprint(documentItem)
                        }))
                        .sort((a, b) => new Date(b.storedAt || 0) - new Date(a.storedAt || 0))
                        .filter(documentItem => {
                            const key = documentItem.fingerprint
                                || documentItem.id
                                || `${documentItem.sourceName || 'sin-nombre'}-${documentItem.storedAt || ''}-${documentItem.rows.length}`;

                            if (seen.has(key)) {
                                return false;
                            }

                            seen.add(key);
                            return true;
                        });
                },

                loadStoredDocuments() {
                    if (!App.runtime.storage) {
                        return [];
                    }

                    try {
                        const parsed = JSON.parse(App.runtime.storage.getItem(App.config.STORAGE_KEY) || '[]');
                        return App.storage.normalizeDocuments(parsed);
                    } catch (error) {
                        return [];
                    }
                },

                loadEmbeddedDocuments() {
                    const parsed = App.storage.loadEmbeddedPayload();
                    return App.storage.normalizeDocuments(parsed.documents);
                },

                getVisibleStoredDocuments(...documentGroups) {
                    const now = new Date();
                    const todayKey = App.storage.getDateKey(now);
                    const mergedDocuments = App.storage.normalizeDocuments(documentGroups.flat());

                    if (!App.storage.isHistoryEnabledNow(now)) {
                        return [];
                    }

                    return mergedDocuments.filter(documentItem => App.storage.getDateKey(documentItem.storedAt) === todayKey);
                },

                loadOutsideHoursHistoryPreference() {
                    if (!App.runtime.storage) {
                        return false;
                    }

                    try {
                        return App.runtime.storage.getItem(App.config.OUTSIDE_HOURS_HISTORY_KEY) === '1';
                    } catch (error) {
                        return false;
                    }
                },

                normalizeOrderLookupRows(rows) {
                    if (!Array.isArray(rows)) {
                        return [];
                    }

                    const allowedKeys = new Set([
                        ...App.orderLookup.getFieldDefinitions().map(field => field.key),
                        'logisticsType'
                    ]);

                    return rows
                        .filter(row => row && typeof row === 'object')
                        .map(row => Array.from(allowedKeys).reduce((normalizedRow, key) => {
                            normalizedRow[key] = App.helpers.normalizeComparable(row[key]);
                            return normalizedRow;
                        }, {}))
                        .filter(row => (
                            App.orderLookup.getSearchableFields().some(field => App.helpers.normalizeComparable(row[field.key]) !== '')
                            || App.helpers.normalizeComparable(row.estado) !== ''
                        ));
                },

                loadStoredOrderLookupState() {
                    if (!App.runtime.storage) {
                        return null;
                    }

                    try {
                        const parsed = JSON.parse(App.runtime.storage.getItem(App.config.ORDER_LOOKUP_STORAGE_KEY) || 'null');
                        if (!parsed || typeof parsed !== 'object') {
                            return null;
                        }

                        const rows = App.storage.normalizeOrderLookupRows(parsed.rows);
                        if (rows.length === 0) {
                            return null;
                        }

                        return {
                            rows,
                            fileName: String(parsed.fileName || '').trim(),
                            filters: {
                                query: App.helpers.normalizeComparable(parsed.filters?.query),
                                state: App.helpers.normalizeComparable(parsed.filters?.state),
                                route: App.helpers.normalizeComparable(parsed.filters?.route)
                            }
                        };
                    } catch (error) {
                        return null;
                    }
                },

                persistStoredOrderLookupState({
                    rows = App.state.orderLookupRows,
                    fileName = App.state.orderLookupFileName,
                    filters = App.orderLookup.getActiveFilters()
                } = {}) {
                    if (!App.runtime.storage) {
                        return false;
                    }

                    try {
                        const normalizedRows = App.storage.normalizeOrderLookupRows(rows);
                        if (normalizedRows.length === 0) {
                            App.storage.clearStoredOrderLookupState();
                            return true;
                        }

                        App.runtime.storage.setItem(
                            App.config.ORDER_LOOKUP_STORAGE_KEY,
                            JSON.stringify({
                                version: 1,
                                fileName: String(fileName || '').trim(),
                                rows: normalizedRows,
                                filters: {
                                    query: App.helpers.normalizeComparable(filters?.query),
                                    state: App.helpers.normalizeComparable(filters?.state),
                                    route: App.helpers.normalizeComparable(filters?.route)
                                }
                            })
                        );
                        return true;
                    } catch (error) {
                        console.error(error);
                        return false;
                    }
                },

                clearStoredOrderLookupState() {
                    if (!App.runtime.storage) {
                        return;
                    }

                    try {
                        App.runtime.storage.removeItem(App.config.ORDER_LOOKUP_STORAGE_KEY);
                    } catch (error) {
                        console.error(error);
                    }
                },

                writeEmbeddedState({
                    documents = App.state.embeddedDocuments,
                    users = App.state.pickerOptions,
                    manualStatuses = App.state.manualOrderStatuses
                } = {}) {
                    const normalizedDocuments = App.storage.normalizeDocuments(documents);
                    const normalizedUsers = App.helpers.normalizePickerOptions(users, []);
                    const normalizedManualStatuses = App.storage.normalizeManualOrderStatuses(manualStatuses);
                    const embeddedHistoryNode = document.getElementById(App.config.EMBEDDED_HISTORY_SCRIPT_ID);

                    App.state.embeddedDocuments = normalizedDocuments;

                    if (!embeddedHistoryNode) {
                        return;
                    }

                    embeddedHistoryNode.textContent = JSON.stringify(
                        {
                            version: 2,
                            documents: normalizedDocuments,
                            users: normalizedUsers,
                            manualStatuses: normalizedManualStatuses
                        },
                        null,
                        0
                    ).replace(/</g, '\\u003c');
                },

                writeEmbeddedDocuments(documents) {
                    App.storage.writeEmbeddedState({ documents, users: App.state.pickerOptions });
                },

                writeEmbeddedPickerOptions(users) {
                    App.storage.writeEmbeddedState({ documents: App.state.embeddedDocuments, users });
                },

                persistStoredDocuments(nextDocuments) {
                    if (!App.runtime.storage) {
                        return false;
                    }

                    try {
                        const normalizedDocuments = App.storage.normalizeDocuments(nextDocuments);
                        App.runtime.storage.setItem(App.config.STORAGE_KEY, JSON.stringify(normalizedDocuments));
                        App.storage.writeEmbeddedDocuments(normalizedDocuments);
                        App.state.storedDocuments = App.storage.getVisibleStoredDocuments(normalizedDocuments);
                        App.storage.updateStorageUI();
                        App.orderLookup.syncReferenceScopeDebounced();
                        return true;
                    } catch (error) {
                        console.error(error);
                        App.ui.showMessage(
                            'No fue posible guardar el historial local. Revisa el espacio disponible del navegador e intenta nuevamente.',
                            'error',
                            { title: 'Historial' }
                        );
                        return false;
                    }
                },

                getCurrentMinutes(date = new Date()) {
                    return (date.getHours() * 60) + date.getMinutes();
                },

                isWithinStorageWindow(date = new Date()) {
                    const currentMinutes = App.storage.getCurrentMinutes(date);
                    return currentMinutes >= App.config.STORAGE_START_MINUTES && currentMinutes < App.config.STORAGE_END_MINUTES;
                },

                isHistoryEnabledNow(date = new Date()) {
                    return App.storage.isWithinStorageWindow(date) || App.state.outsideHoursHistoryEnabled;
                },

                canStoreNow() {
                    return Boolean(App.runtime.storage) && App.storage.isHistoryEnabledNow();
                },

                getDateKey(value = new Date()) {
                    const date = new Date(value);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                },

                formatClockTime(value) {
                    return App.runtime.clockTimeFormatter.format(new Date(value));
                },

                formatDateTime(value) {
                    return App.runtime.dateTimeFormatter.format(new Date(value));
                },

                getNextStorageBoundary(date = new Date()) {
                    const currentMinutes = App.storage.getCurrentMinutes(date);
                    const boundary = new Date(date);

                    if (currentMinutes < App.config.STORAGE_START_MINUTES) {
                        boundary.setHours(
                            Math.floor(App.config.STORAGE_START_MINUTES / 60),
                            App.config.STORAGE_START_MINUTES % 60,
                            0,
                            0
                        );
                        return boundary;
                    }

                    if (currentMinutes < App.config.STORAGE_END_MINUTES) {
                        boundary.setHours(
                            Math.floor(App.config.STORAGE_END_MINUTES / 60),
                            App.config.STORAGE_END_MINUTES % 60,
                            0,
                            0
                        );
                        return boundary;
                    }

                    boundary.setDate(boundary.getDate() + 1);
                    boundary.setHours(
                        Math.floor(App.config.STORAGE_START_MINUTES / 60),
                        App.config.STORAGE_START_MINUTES % 60,
                        0,
                        0
                    );
                    return boundary;
                },

                formatBoundaryCountdown(targetDate, now = new Date()) {
                    const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
                    const totalMinutes = Math.ceil(diffMs / 60000);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    if (hours > 0) {
                        return `${hours}h ${String(minutes).padStart(2, '0')}m`;
                    }

                    return `${Math.max(1, minutes)}m`;
                },

                buildStorageStatusMarkup(label, timeValue, meta) {
                    return `
                        <span class="status-pill-dot" aria-hidden="true"></span>
                        <span class="status-pill-content">
                            <span class="status-pill-label">${App.helpers.escapeHtml(label)}</span>
                            <span class="status-pill-time">${App.helpers.escapeHtml(App.storage.formatClockTime(timeValue))}</span>
                            <span class="status-pill-meta">${App.helpers.escapeHtml(meta)}</span>
                        </span>
                    `;
                },

                updateOutsideHoursToggleButton(now = new Date()) {
                    const button = App.dom.outsideHoursToggleBtn;
                    if (!button) {
                        return;
                    }

                    const enabled = Boolean(App.runtime.storage);
                    const insideWindow = App.storage.isWithinStorageWindow(now);
                    const isActive = enabled && App.state.outsideHoursHistoryEnabled;

                    button.disabled = !enabled;
                    button.classList.toggle('is-active', isActive);
                    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                    button.setAttribute(
                        'title',
                        !enabled
                            ? 'No disponible sin almacenamiento local'
                            : isActive
                                ? insideWindow
                                    ? 'Historial fuera de horario activo para cuando cierre la franja'
                                    : 'Desactivar historial fuera de horario'
                                : insideWindow
                                    ? 'Mantener historial activo tambien fuera de horario'
                                    : 'Activar historial fuera de horario'
                    );
                },

                toggleOutsideHoursHistory() {
                    if (!App.runtime.storage) {
                        return;
                    }

                    const nextValue = !App.state.outsideHoursHistoryEnabled;

                    try {
                        if (nextValue) {
                            App.runtime.storage.setItem(App.config.OUTSIDE_HOURS_HISTORY_KEY, '1');
                        } else {
                            App.runtime.storage.removeItem(App.config.OUTSIDE_HOURS_HISTORY_KEY);
                        }

                        App.state.outsideHoursHistoryEnabled = nextValue;

                        const localDocuments = App.storage.loadStoredDocuments();
                        const previousVisibleDocumentIds = new Set(App.state.storedDocuments.map(documentItem => documentItem.id));
                        App.state.storedDocuments = App.storage.getVisibleStoredDocuments(localDocuments, App.state.embeddedDocuments);
                        const shouldHideCurrentBase = !nextValue
                            && App.state.activeBaseRows.length > 0
                            && App.state.activeBaseRows.every(row => previousVisibleDocumentIds.has(row.documentId))
                            && App.state.storedDocuments.length === 0;

                        if (shouldHideCurrentBase) {
                            App.state.activeBaseRows = [];
                            App.state.activeBaseMessage = '';
                        }

                        App.storage.updateStorageUI();
                        App.orderLookup.syncReferenceScopeDebounced();

                        if (App.dom.searchInput.value.trim()) {
                            App.table.handleSearch();
                        } else if (shouldHideCurrentBase) {
                            App.table.resetWorkspaceView(false);
                        }

                        App.ui.showMessage(
                            nextValue
                                ? 'El historial seguira activo tambien fuera del horario.'
                                : 'El historial fuera de horario fue desactivado.',
                            nextValue ? 'success' : 'info',
                            { title: 'Historial' }
                        );
                    } catch (error) {
                        console.error(error);
                        App.ui.showMessage(
                            'No fue posible actualizar la preferencia del historial fuera de horario.',
                            'error',
                            { title: 'Historial' }
                        );
                    }
                },

                refreshStorageStatus(now = new Date()) {
                    if (!App.dom.storageStatus) {
                        return;
                    }

                    const hasVisibleHistory = App.state.storedDocuments.length > 0;
                    App.storage.updateOutsideHoursToggleButton(now);

                    if (!App.runtime.storage) {
                        App.dom.storageStatus.className = 'status-pill is-disabled';
                        App.dom.storageStatus.innerHTML = App.storage.buildStorageStatusMarkup(
                            hasVisibleHistory ? 'Lectura' : 'Sin storage',
                            now,
                            hasVisibleHistory ? 'portable' : 'sin storage'
                        );
                        return;
                    }

                    const insideWindow = App.storage.isWithinStorageWindow(now);
                    const outsideHoursActive = !insideWindow && App.state.outsideHoursHistoryEnabled;
                    const nextBoundary = App.storage.getNextStorageBoundary(now);
                    const metaText = outsideHoursActive
                        ? '24h activo'
                        : insideWindow
                        ? `cierra ${App.storage.formatBoundaryCountdown(nextBoundary, now)}`
                        : App.storage.getCurrentMinutes(now) < App.config.STORAGE_START_MINUTES
                            ? `abre ${App.storage.formatBoundaryCountdown(nextBoundary, now)}`
                            : `reabre ${App.storage.formatBoundaryCountdown(nextBoundary, now)}`;

                    App.dom.storageStatus.className = `status-pill ${outsideHoursActive ? 'is-extended' : insideWindow ? 'is-open' : 'is-closed'}`;
                    App.dom.storageStatus.innerHTML = App.storage.buildStorageStatusMarkup(
                        outsideHoursActive ? '24h' : insideWindow ? 'Activo' : 'Cerrado',
                        now,
                        metaText
                    );
                },

                renderHistoryPreview(documents) {
                    const selectedIds = App.state.selectedHistoryDocumentIds;
                    return documents
                        .map(documentItem => {
                            const typeSummary = App.helpers.summarizeDocumentType(documentItem.rows);
                            return `
                                <button
                                    class="history-item${selectedIds.has(documentItem.id) ? ' is-selected' : ''}"
                                    type="button"
                                    data-history-document-id="${App.helpers.escapeHtml(documentItem.id || '')}"
                                    aria-pressed="${selectedIds.has(documentItem.id) ? 'true' : 'false'}"
                                    title="Haz clic para sumar o quitar este archivo de la seleccion"
                                >
                                    <strong>${App.helpers.escapeHtml(documentItem.sourceName || 'Documento sin nombre')}</strong>
                                    <div class="history-type-row">
                                        <span class="history-type-badge is-${App.helpers.escapeHtml(typeSummary.key)}">${App.helpers.escapeHtml(typeSummary.label)}</span>
                                        <span class="history-type-meta">${App.helpers.escapeHtml(typeSummary.detail)}</span>
                                    </div>
                                    <span>${documentItem.rows.length} numero(s) - Picker: ${App.helpers.escapeHtml(documentItem.picker || 'sin picker')}</span>
                                    <span>Guardado: ${App.helpers.escapeHtml(App.storage.formatDateTime(documentItem.storedAt))}</span>
                                </button>
                            `;
                        })
                        .join('');
                },

                syncSelectedHistoryDocumentIds() {
                    const validDocumentIds = new Set(App.state.storedDocuments.map(documentItem => documentItem.id));
                    App.state.selectedHistoryDocumentIds = new Set(
                        Array.from(App.state.selectedHistoryDocumentIds).filter(documentId => validDocumentIds.has(documentId))
                    );
                },

                toggleHistoryDocumentSelection(documentId) {
                    const normalizedId = String(documentId || '').trim();
                    if (!normalizedId) {
                        return;
                    }

                    const availableDocuments = App.state.storedDocuments.filter(documentItem => documentItem?.id);
                    if (!availableDocuments.some(documentItem => documentItem.id === normalizedId)) {
                        return;
                    }

                    const nextSelectedIds = new Set(App.state.selectedHistoryDocumentIds);
                    if (nextSelectedIds.has(normalizedId)) {
                        nextSelectedIds.delete(normalizedId);
                    } else {
                        nextSelectedIds.add(normalizedId);
                    }

                    const selectedDocuments = availableDocuments.filter(documentItem => nextSelectedIds.has(documentItem.id));
                    if (selectedDocuments.length === 0) {
                        App.table.showStoredDocuments();
                        return;
                    }

                    const totalRows = selectedDocuments.reduce((sum, documentItem) => sum + documentItem.rows.length, 0);
                    App.table.setActiveBaseFromDocuments(
                        selectedDocuments,
                        `Mostrando ${selectedDocuments.length} archivo(s) guardado(s) seleccionado(s) con ${totalRows} numero(s).`,
                        { selectedHistoryDocumentIds: nextSelectedIds }
                    );
                },

                updateStorageUI() {
                    const now = new Date();
                    const hasVisibleHistory = App.state.storedDocuments.length > 0;
                    App.storage.syncSelectedHistoryDocumentIds();
                    const hasSelectedHistoryDocuments = App.state.selectedHistoryDocumentIds.size > 0;

                    App.storage.refreshStorageStatus(now);

                    if (!App.runtime.storage) {
                        App.dom.storageSummary.textContent = hasVisibleHistory
                            ? `${App.state.storedDocuments.length} documento(s) recuperado(s) desde el HTML portable.`
                            : 'Historial local no disponible.';
                        App.dom.storageNote.textContent = hasVisibleHistory
                            ? 'Puedes consultar estos datos y guardar otra copia portable, pero los nuevos documentos no quedaran guardados localmente. Haz clic en uno o varios archivos guardados para ver sus pedidos.'
                            : 'Para usar busquedas sobre documentos guardados, abre el archivo en un navegador con almacenamiento local habilitado.';
                        App.dom.historyList.innerHTML = hasVisibleHistory
                            ? App.storage.renderHistoryPreview(App.state.storedDocuments.slice(0, App.config.HISTORY_PREVIEW_LIMIT))
                            : '<div class="history-empty">No se puede acceder al historial guardado desde este navegador.</div>';
                        const showStoredLabel = 'Mostrar todo';
                        if (App.dom.showStoredBtn) {
                            App.dom.showStoredBtn.textContent = 'Mostrar todo';
                            App.dom.showStoredBtn.title = showStoredLabel;
                            App.dom.showStoredBtn.disabled = !hasVisibleHistory;
                        }
                        App.dom.clearStoredBtn.disabled = true;
                        App.dom.savePortableBtn.disabled = !App.storage.canSavePortableState();
                        return;
                    }

                    const insideWindow = App.storage.isWithinStorageWindow(now);
                    const outsideHoursActive = !insideWindow && App.state.outsideHoursHistoryEnabled;

                    if (!hasVisibleHistory) {
                        App.dom.storageSummary.textContent = outsideHoursActive
                            ? 'Sin documentos guardados. El modo 24h esta activo.'
                            : 'Sin documentos guardados.';
                        App.dom.historyList.innerHTML = '<div class="history-empty">Aun no hay documentos guardados en este navegador.</div>';
                    } else {
                        const latestDocument = App.state.storedDocuments[0];
                        const totalRows = App.state.storedDocuments.reduce((sum, documentItem) => sum + documentItem.rows.length, 0);
                        App.dom.storageSummary.textContent = `${App.state.storedDocuments.length} doc(s) · ${totalRows} num(s) · Ult.: ${App.storage.formatDateTime(latestDocument.storedAt)}.`;
                        App.dom.historyList.innerHTML = App.storage.renderHistoryPreview(
                            App.state.storedDocuments.slice(0, App.config.HISTORY_PREVIEW_LIMIT)
                        );
                    }

                    App.dom.storageNote.textContent = insideWindow
                        ? App.state.outsideHoursHistoryEnabled
                            ? `Las cargas se guardan de ${App.config.STORAGE_WINDOW_LABEL}. El modo 24h seguira activo despues.${hasVisibleHistory ? ' Selecciona archivos guardados para ver sus pedidos.' : ''}`
                            : `Las cargas se guardan de ${App.config.STORAGE_WINDOW_LABEL}.${hasVisibleHistory ? ' Selecciona archivos guardados para ver sus pedidos.' : ''}`
                        : outsideHoursActive
                            ? `Modo 24h activo. Las cargas nuevas seguiran en el historial.${hasVisibleHistory ? ' Selecciona archivos guardados para ver sus pedidos.' : ''}`
                            : 'Fuera del horario puedes procesar, pero no se guarda en historial.';
                    const showStoredLabel = 'Mostrar todo';
                    if (App.dom.showStoredBtn) {
                        App.dom.showStoredBtn.textContent = 'Mostrar todo';
                        App.dom.showStoredBtn.title = showStoredLabel;
                        App.dom.showStoredBtn.disabled = !hasVisibleHistory;
                    }
                    App.dom.clearStoredBtn.disabled = !hasVisibleHistory;
                    App.dom.savePortableBtn.disabled = !App.storage.canSavePortableState();
                },

                pruneHistoryBySchedule() {
                    const localDocuments = App.storage.loadStoredDocuments();
                    App.state.storedDocuments = App.storage.getVisibleStoredDocuments(localDocuments, App.state.embeddedDocuments);

                    if (!App.runtime.storage) {
                        return;
                    }

                    const now = new Date();
                    const todayKey = App.storage.getDateKey(now);
                    const hasDocumentsFromAnotherDay = localDocuments.some(
                        documentItem => App.storage.getDateKey(documentItem.storedAt) !== todayKey
                    );

                    if (!hasDocumentsFromAnotherDay) {
                        return;
                    }

                    const removedCount = localDocuments.filter(
                        documentItem => App.storage.getDateKey(documentItem.storedAt) !== todayKey
                    ).length;
                    if (removedCount > 0) {
                        App.ui.showMessage(
                            `Se eliminaron ${removedCount} documento(s) de dias anteriores del historial local.`,
                            'info',
                            { title: 'Historial' }
                        );
                    }

                    const previousDocumentIds = new Set(localDocuments.map(documentItem => documentItem.id));
                    const currentDayDocuments = localDocuments.filter(
                        documentItem => App.storage.getDateKey(documentItem.storedAt) === todayKey
                    );

                    try {
                        App.runtime.storage.setItem(App.config.STORAGE_KEY, JSON.stringify(currentDayDocuments));
                    } catch (error) {
                        console.error(error);
                    }

                    App.state.storedDocuments = App.storage.getVisibleStoredDocuments(currentDayDocuments, App.state.embeddedDocuments);
                    App.storage.updateStorageUI();
                    App.orderLookup.syncReferenceScopeDebounced();

                    if (
                        App.state.activeBaseRows.length > 0
                        && App.state.activeBaseRows.every(row => previousDocumentIds.has(row.documentId))
                    ) {
                        App.table.resetWorkspaceView(false);
                    }
                },

                updateWindowControls() {
                    const enabled = Boolean(App.runtime.storage);
                    App.dom.dropzone.classList.toggle('is-disabled', !enabled);
                    App.dom.processTextBtn.disabled = !enabled;
                    App.dom.processTextBtn.classList.toggle('is-disabled', !enabled);
                    App.dom.dropzone.title = enabled
                        ? 'Subir archivo .txt'
                        : 'No se pudo habilitar el almacenamiento local del navegador.';
                },

                switchHistoryTab(name) {
                    document.getElementById('lp-panel-historial')?.classList.add('lp-tab-panel--active');
                    document.getElementById('lp-panel-procesados')?.classList.remove('lp-tab-panel--active');
                },

                canSavePortableState() {
                    const allLocalDocs = App.runtime.storage
                        ? App.storage.loadStoredDocuments()
                        : [];
                    return allLocalDocs.length > 0
                        || App.state.storedDocuments.length > 0
                        || App.users.hasCustomizedPickerOptions()
                        || Object.keys(App.state.manualOrderStatuses || {}).length > 0;
                },

                getPortableEmbeddedState() {
                    return JSON.stringify(
                        {
                            version: 2,
                            documents: App.state.storedDocuments,
                            users: App.state.pickerOptions,
                            manualStatuses: App.storage.normalizeManualOrderStatuses(App.state.manualOrderStatuses)
                        },
                        null,
                        0
                    ).replace(/</g, '\\u003c');
                },

                isLocalResourceUrl(value) {
                    const url = String(value || '').trim();
                    return !!url
                        && !/^data:/i.test(url)
                        && !/^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(url);
                },

                readStylesheetText(stylesheetLink) {
                    if (!stylesheetLink) {
                        return '';
                    }

                    const stylesheet = Array.from(document.styleSheets).find(sheet => sheet.href === stylesheetLink.href);
                    if (!stylesheet) {
                        return '';
                    }

                    try {
                        return Array.from(stylesheet.cssRules).map(rule => rule.cssText).join('\n');
                    } catch (error) {
                        return '';
                    }
                },

                getPortableStylesheets() {
                    return Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
                        .filter(link => App.storage.isLocalResourceUrl(link.getAttribute('href')))
                        .map(link => ({
                            href: link.getAttribute('href'),
                            text: App.storage.readStylesheetText(link)
                        }))
                        .filter(item => item.href && item.text);
                },

                inlinePortableStylesheets(clone, stylesheets) {
                    const cloneLinks = Array.from(clone.querySelectorAll('link[rel="stylesheet"][href]'));
                    stylesheets.forEach(({ href, text }) => {
                        const cloneLink = cloneLinks.find(link => link.getAttribute('href') === href);
                        if (!cloneLink) {
                            return;
                        }

                        const inlineStyles = document.createElement('style');
                        inlineStyles.textContent = text;
                        cloneLink.replaceWith(inlineStyles);
                    });
                },

                buildPortableHtml() {
                    const clone = document.documentElement.cloneNode(true);
                    const cloneEmbeddedState = clone.querySelector(`#${App.config.EMBEDDED_HISTORY_SCRIPT_ID}`);
                    const cloneMessageStack = clone.querySelector('#messageStack');
                    const cloneAppScript = clone.querySelector('script[data-app-script]');
                    const portableStylesheets = App.storage.getPortableStylesheets();

                    if (cloneEmbeddedState) {
                        cloneEmbeddedState.textContent = App.storage.getPortableEmbeddedState();
                    }

                    if (cloneMessageStack) {
                        cloneMessageStack.innerHTML = '';
                    }

                    if (cloneAppScript) {
                        cloneAppScript.remove();
                    }

                    App.storage.inlinePortableStylesheets(clone, portableStylesheets);

                    const portableScript = document.createElement('script');
                    portableScript.textContent = `(${bootstrap.toString()})();`.replace(/<\/script/gi, '<\\/script');
                    clone.querySelector('body')?.appendChild(portableScript);

                    return `<!DOCTYPE html>\n${clone.outerHTML}`;
                }
            },
            users: {
                loadPickerOptions() {
                    const storedPickerOptions = App.storage.loadStoredPickerOptions();
                    if (storedPickerOptions.length > 0) {
                        return storedPickerOptions;
                    }

                    const embeddedPickerOptions = App.storage.loadEmbeddedPickerOptions();
                    if (embeddedPickerOptions.length > 0) {
                        return embeddedPickerOptions;
                    }

                    return [...App.runtime.defaultPickerOptions];
                },

                persistPickerOptions(nextPickerOptions) {
                    const normalizedPickerOptions = App.helpers.normalizePickerOptions(nextPickerOptions, []);
                    if (normalizedPickerOptions.length === 0) {
                        App.ui.showMessage('Debe quedar al menos un usuario disponible.', 'warning', { title: 'Usuarios' });
                        return false;
                    }

                    if (App.runtime.storage) {
                        try {
                            App.runtime.storage.setItem(
                                App.config.PICKERS_STORAGE_KEY,
                                JSON.stringify(normalizedPickerOptions)
                            );
                        } catch (error) {
                            console.error(error);
                            App.ui.showMessage(
                                'No fue posible guardar la lista de usuarios. Intenta nuevamente.',
                                'error',
                                { title: 'Usuarios' }
                            );
                            return false;
                        }
                    }

                    App.state.pickerOptions = normalizedPickerOptions;
                    App.users.renderPickerOptions();
                    App.users.renderPickerManager();
                    App.storage.writeEmbeddedPickerOptions(normalizedPickerOptions);
                    App.storage.updateStorageUI();
                    return true;
                },

                renderPickerOptions() {
                    const previousValue = App.dom.pickerInput.value;
                    App.dom.pickerInput.innerHTML = '';

                    const placeholderOption = document.createElement('option');
                    placeholderOption.value = '';
                    placeholderOption.disabled = true;
                    placeholderOption.textContent = 'Seleccione una opcion...';
                    App.dom.pickerInput.appendChild(placeholderOption);

                    App.state.pickerOptions.forEach(option => {
                        const optionNode = document.createElement('option');
                        optionNode.value = option;
                        optionNode.textContent = option;
                        App.dom.pickerInput.appendChild(optionNode);
                    });

                    App.dom.pickerInput.value = App.state.pickerOptions.includes(previousValue) ? previousValue : '';
                    if (!App.dom.pickerInput.value) {
                        App.dom.pickerInput.selectedIndex = 0;
                    }

                    App.dom.pickerMeta.textContent = `${App.state.pickerOptions.length} usuario(s) disponible(s)`;
                },

                renderPickerManager() {
                    App.dom.pickerManagerCount.textContent = String(App.state.pickerOptions.length);
                    App.dom.pickerListTotal.textContent = String(App.state.pickerOptions.length);
                    App.dom.pickerList.innerHTML = App.state.pickerOptions.length === 0
                        ? '<div class="picker-empty">No hay usuarios disponibles.</div>'
                        : App.state.pickerOptions
                            .map(option => `
                                <div class="picker-row">
                                    <div class="picker-row-main">
                                        <span class="picker-row-badge">${App.helpers.escapeHtml(option.charAt(0).toUpperCase())}</span>
                                        <div class="picker-row-info">
                                            <strong>${App.helpers.escapeHtml(option)}</strong>
                                        </div>
                                    </div>
                                    <button
                                        class="btn btn-secondary picker-remove-btn"
                                        type="button"
                                        data-remove-picker="${App.helpers.escapeHtml(option)}"
                                        aria-label="Eliminar ${App.helpers.escapeHtml(option)}"
                                        title="Eliminar ${App.helpers.escapeHtml(option)}"
                                    >X</button>
                                </div>
                            `)
                            .join('');

                    App.dom.manageUsersBtn.textContent = App.dom.pickerManager.hidden ? '+' : '\u2212';
                    App.dom.manageUsersBtn.title = App.dom.pickerManager.hidden
                        ? 'Mostrar lista de usuarios'
                        : 'Cerrar lista de usuarios';
                    App.dom.manageUsersBtn.setAttribute('aria-label', App.dom.manageUsersBtn.title);
                    App.dom.manageUsersBtn.classList.toggle('is-active', !App.dom.pickerManager.hidden);
                },

                togglePickerManager(forceOpen) {
                    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : App.dom.pickerManager.hidden;
                    App.dom.pickerManager.hidden = !shouldOpen;
                    App.users.renderPickerManager();

                    if (shouldOpen) {
                        App.dom.newPickerInput.focus();
                    }
                },

                handleAddPicker() {
                    const nextPickerName = App.helpers.normalizePickerName(App.dom.newPickerInput.value);
                    if (!nextPickerName) {
                        App.dom.newPickerInput.focus();
                        return;
                    }

                    const alreadyExists = App.state.pickerOptions.some(
                        option => option.toLowerCase() === nextPickerName.toLowerCase()
                    );
                    if (alreadyExists) {
                        App.ui.showMessage(`El usuario "${nextPickerName}" ya existe.`, 'warning', { title: 'Usuarios' });
                        App.dom.newPickerInput.focus();
                        App.dom.newPickerInput.select();
                        return;
                    }

                    if (!App.users.persistPickerOptions([...App.state.pickerOptions, nextPickerName])) {
                        return;
                    }

                    App.dom.pickerInput.value = nextPickerName;
                    App.dom.newPickerInput.value = '';
                    App.users.togglePickerManager(true);
                },

                removePickerOption(optionToRemove) {
                    const normalizedTarget = App.helpers.normalizePickerName(optionToRemove);
                    if (!normalizedTarget) {
                        return;
                    }

                    if (App.state.pickerOptions.length === 1) {
                        App.ui.showMessage('No se puede eliminar el ultimo usuario disponible.', 'warning', { title: 'Usuarios' });
                        return;
                    }

                    const confirmed = window.confirm(
                        `Se eliminara el usuario "${normalizedTarget}" de la lista. Deseas continuar?`
                    );
                    if (!confirmed) {
                        return;
                    }

                    const remainingPickerOptions = App.state.pickerOptions.filter(
                        option => option.toLowerCase() !== normalizedTarget.toLowerCase()
                    );
                    if (!App.users.persistPickerOptions(remainingPickerOptions)) {
                        return;
                    }

                    if (App.dom.pickerInput.value.toLowerCase() === normalizedTarget.toLowerCase()) {
                        App.dom.pickerInput.value = '';
                    }
                },

                hasCustomizedPickerOptions() {
                    const normalizedDefaults = App.helpers.normalizePickerOptions(App.runtime.defaultPickerOptions, []);
                    if (App.state.pickerOptions.length !== normalizedDefaults.length) {
                        return true;
                    }

                    return App.state.pickerOptions.some((option, index) => option !== normalizedDefaults[index]);
                }
            },

            orderLookup: {
                getFieldDefinitions() {
                    return App.config.ORDER_LOOKUP_FIELDS;
                },

                getSearchableFields() {
                    return App.orderLookup.getFieldDefinitions().filter(field => field.searchable);
                },

                getVisibleColumns() {
                    return [
                        { key: 'dato2', label: 'DATO2' },
                        { key: 'estado', label: 'ESTADO' },
                        { key: 'logisticsType', label: 'RUTAS' }
                    ];
                },

                getDefaultDisplayColumns() {
                    return App.orderLookup.getVisibleColumns();
                },

                getReferenceOrderDescriptors() {
                    const descriptors = [];
                    const seen = new Set();

                    App.table.getSearchableRows().forEach(row => {
                        const orderNumber = App.helpers.normalizeComparable(row.numero);
                        if (!orderNumber || seen.has(orderNumber)) {
                            return;
                        }

                        seen.add(orderNumber);
                        descriptors.push({
                            orderNumber,
                            logisticsType: row.type === 'flex'
                                ? 'Flex'
                                : row.type === 'colecta'
                                    ? 'Colecta'
                                    : ''
                        });
                    });

                    return descriptors;
                },

                getReferenceOrderNumbers() {
                    return new Set(
                        App.orderLookup.getReferenceOrderDescriptors()
                            .map(descriptor => descriptor.orderNumber)
                    );
                },

                getReferenceOrderTypeMap() {
                    return new Map(
                        App.orderLookup.getReferenceOrderDescriptors()
                            .filter(descriptor => descriptor.logisticsType)
                            .map(descriptor => [descriptor.orderNumber, descriptor.logisticsType])
                    );
                },

                rowMatchesReferenceOrders(row, referenceOrderNumbers = App.orderLookup.getReferenceOrderNumbers()) {
                    if (!(referenceOrderNumbers instanceof Set) || referenceOrderNumbers.size === 0) {
                        return false;
                    }

                    return App.orderLookup.getSearchableFields().some(field =>
                        referenceOrderNumbers.has(App.helpers.normalizeComparable(row[field.key]))
                    );
                },

                getMatchedReferenceOrderNumber(
                    row,
                    referenceOrderNumbers = App.orderLookup.getReferenceOrderNumbers()
                ) {
                    if (!row || !(referenceOrderNumbers instanceof Set) || referenceOrderNumbers.size === 0) {
                        return '';
                    }

                    return App.orderLookup.getSearchableFields()
                        .map(field => App.helpers.normalizeComparable(row[field.key]))
                        .find(value => value && referenceOrderNumbers.has(value)) || '';
                },

                getMatchedExcelRows(
                    rows = App.state.orderLookupRows,
                    referenceOrderNumbers = App.orderLookup.getReferenceOrderNumbers(),
                    referenceOrderTypeMap = App.orderLookup.getReferenceOrderTypeMap()
                ) {
                    if (!Array.isArray(rows) || rows.length === 0 || referenceOrderNumbers.size === 0) {
                        return [];
                    }

                    return rows
                        .filter(row => App.orderLookup.rowMatchesReferenceOrders(row, referenceOrderNumbers))
                        .map(row => {
                            const matchedReferenceNumber = App.orderLookup.getMatchedReferenceOrderNumber(
                                row,
                                referenceOrderNumbers
                            );

                            return {
                                ...row,
                                matchedReferenceNumber,
                                logisticsType: App.orderLookup.resolveLogisticsType(row, referenceOrderTypeMap)
                            };
                        });
                },

                getMissingReferenceRows(
                    referenceOrderDescriptors = App.orderLookup.getReferenceOrderDescriptors(),
                    matchedRows = []
                ) {
                    if (!Array.isArray(referenceOrderDescriptors) || referenceOrderDescriptors.length === 0) {
                        return [];
                    }

                    const matchedReferenceNumbers = new Set(
                        matchedRows
                            .map(row => App.helpers.normalizeComparable(row.matchedReferenceNumber))
                            .filter(Boolean)
                    );

                    return referenceOrderDescriptors
                        .filter(descriptor => !matchedReferenceNumbers.has(descriptor.orderNumber))
                        .map(descriptor => ({
                            dato2: descriptor.orderNumber,
                            estado: 'N/D',
                            logisticsType: descriptor.logisticsType,
                            referenceNumber: descriptor.orderNumber,
                            buyerOrder: '',
                            orderSource: '',
                            dispatchRoute: '',
                            matchedReferenceNumber: descriptor.orderNumber,
                            isMissingInWorkbook: true
                        }));
                },

                getScopedRows(
                    rows = App.state.orderLookupRows,
                    referenceOrderNumbers = App.orderLookup.getReferenceOrderNumbers(),
                    referenceOrderTypeMap = App.orderLookup.getReferenceOrderTypeMap(),
                    referenceOrderDescriptors = App.orderLookup.getReferenceOrderDescriptors()
                ) {
                    if (!Array.isArray(rows) || rows.length === 0 || referenceOrderNumbers.size === 0) {
                        return [];
                    }

                    const matchedRows = App.orderLookup.getMatchedExcelRows(
                        rows,
                        referenceOrderNumbers,
                        referenceOrderTypeMap
                    );
                    const missingRows = App.orderLookup.getMissingReferenceRows(
                        referenceOrderDescriptors,
                        matchedRows
                    );

                    return [...matchedRows, ...missingRows];
                },

                getSummaryMarkup(title, body, tone = 'default') {
                    const bodyMarkup = String(body || '').trim()
                        ? `<span>${App.helpers.escapeHtml(body)}</span>`
                        : '';

                    return {
                        toneClass: tone,
                        html: `
                            <strong>${App.helpers.escapeHtml(title)}</strong>
                            ${bodyMarkup}
                        `
                    };
                },

                updateSummary(title, body, tone = 'default') {
                    const summary = App.dom.orderLookupSummary;
                    if (!summary) {
                        return;
                    }

                    const { html, toneClass } = App.orderLookup.getSummaryMarkup(title, body, tone);
                    summary.className = `order-lookup-summary${toneClass === 'default' ? '' : ` is-${toneClass}`}`;
                    summary.classList.remove('is-hidden');
                    summary.innerHTML = html;
                },

                hideSummary() {
                    App.dom.orderLookupSummary?.classList.add('is-hidden');
                },

                setTableColumns(columns = App.state.orderLookupDisplayColumns) {
                    const normalizedColumns = Array.isArray(columns) && columns.length > 0
                        ? columns
                        : App.orderLookup.getDefaultDisplayColumns();

                    if (App.dom.orderLookupTableHead) {
                        App.dom.orderLookupTableHead.innerHTML = `
                            <tr>
                                ${normalizedColumns.map(column => `
                                    <th class="order-lookup-col order-lookup-col--${App.helpers.escapeHtml(column.key)}">${App.helpers.escapeHtml(column.label)}</th>
                                `).join('')}
                            </tr>
                        `;
                    }

                    return normalizedColumns;
                },

                renderNoMatchesRow(message = 'No hay coincidencias para mostrar.') {
                    const columns = App.orderLookup.setTableColumns(
                        App.state.orderLookupDisplayColumns.length > 0
                            ? App.state.orderLookupDisplayColumns
                            : App.orderLookup.getDefaultDisplayColumns()
                    );

                    if (App.dom.orderLookupTableBody) {
                        App.dom.orderLookupTableBody.innerHTML = `
                            <tr>
                                <td colspan="${columns.length}" class="order-lookup-empty-row">${App.helpers.escapeHtml(message)}</td>
                            </tr>
                        `;
                    }

                    if (App.dom.orderLookupTableWrap) {
                        App.dom.orderLookupTableWrap.classList.add('is-hidden');
                    }
                },

                resetResults() {
                    App.state.orderLookupMatches = [];
                    App.state.orderLookupDisplayColumns = App.orderLookup.getVisibleColumns();
                    App.orderLookup.setTableColumns(App.state.orderLookupDisplayColumns);
                    App.orderLookup.renderNoMatchesRow('No hay coincidencias para mostrar.');
                    App.orderLookup.updateSummary(
                        'Sin resultados',
                        'Carga un archivo Excel para ver solo pedidos de Mercado Libre que coincidan con los numeros guardados o cargados y filtrarlos por estado, ruta o numero.',
                        'empty'
                    );
                },

                resetData() {
                    App.state.orderLookupRows = [];
                    App.state.orderLookupDisplayColumns = App.orderLookup.getVisibleColumns();
                    App.state.orderLookupAvailableStates = [];
                    App.state.orderLookupAvailableRoutes = [];
                    App.state.orderLookupMatches = [];
                    App.orderLookup.setLoadedFileName('');
                    if (App.dom.orderLookupInput) {
                        App.dom.orderLookupInput.value = '';
                    }
                    if (App.dom.orderLookupRouteFilter) {
                        App.dom.orderLookupRouteFilter.value = '';
                    }
                    App.state.activeStatusFilter = '';
                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = '';
                    }
                    App.orderLookup.populateStateFilter([]);
                    App.orderLookup.populateRouteFilter([]);
                    App.storage.clearStoredOrderLookupState();
                    App.table.refreshStatusColumn();
                },

                restoreStoredState() {
                    const storedState = App.storage.loadStoredOrderLookupState();
                    if (!storedState) {
                        return;
                    }

                    App.state.orderLookupRows = storedState.rows;
                    App.state.orderLookupDisplayColumns = App.orderLookup.getVisibleColumns();
                    App.orderLookup.setLoadedFileName(storedState.fileName || 'Consulta recuperada');

                    if (App.dom.orderLookupInput) {
                        App.dom.orderLookupInput.value = storedState.filters.query || '';
                    }

                    App.orderLookup.populateStateFilter(App.orderLookup.getScopedRows());
                    App.orderLookup.populateRouteFilter(App.orderLookup.getScopedRows());

                    if (App.dom.orderLookupStateFilter) {
                        const normalizedState = App.helpers.normalizeComparable(storedState.filters.state);
                        const hasStoredOption = Array.from(App.dom.orderLookupStateFilter.options)
                            .some(option => App.helpers.normalizeComparable(option.value) === normalizedState);
                        App.dom.orderLookupStateFilter.value = hasStoredOption ? normalizedState : '';
                    }

                    if (App.dom.orderLookupRouteFilter) {
                        const normalizedRoute = App.helpers.normalizeComparable(storedState.filters.route);
                        const hasStoredOption = Array.from(App.dom.orderLookupRouteFilter.options)
                            .some(option => App.helpers.normalizeComparable(option.value) === normalizedRoute);
                        App.dom.orderLookupRouteFilter.value = hasStoredOption ? normalizedRoute : '';
                    }

                    App.state.activeStatusFilter = App.helpers.normalizeComparable(storedState.filters.state);
                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = App.state.activeStatusFilter;
                    }

                    App.orderLookup.applyFilters({ showWarningOnEmptySource: false });
                    App.table.refreshStatusColumn();
                },

                setLoadedFileName(fileName) {
                    App.state.orderLookupFileName = fileName || '';

                    if (App.dom.orderLookupFileName) {
                        App.dom.orderLookupFileName.textContent = fileName || 'No hay archivo Excel cargado.';
                    }
                },

                populateStateFilter(rows = App.orderLookup.getScopedRows()) {
                    const filterSelect = App.dom.orderLookupStateFilter;
                    if (!filterSelect) {
                        return;
                    }

                    const previousValue = App.helpers.normalizeComparable(filterSelect.value);
                    const states = Array.from(new Set(
                        rows
                            .map(row => App.orderLookup.getEffectiveStatus(row))
                            .filter(Boolean)
                    )).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

                    App.state.orderLookupAvailableStates = states;
                    filterSelect.innerHTML = `
                        <option value="">Todos los estados</option>
                        ${states.map(state => `<option value="${App.helpers.escapeHtml(state)}">${App.helpers.escapeHtml(state)}</option>`).join('')}
                    `;

                    filterSelect.value = states.includes(previousValue) ? previousValue : '';
                },

                populateRouteFilter(rows = App.orderLookup.getScopedRows()) {
                    const filterSelect = App.dom.orderLookupRouteFilter;
                    if (!filterSelect) {
                        return;
                    }

                    const previousValue = App.helpers.normalizeComparable(filterSelect.value);
                    const detectedRoutes = new Set(
                        rows
                            .map(row => App.helpers.normalizeComparable(row.logisticsType) || App.orderLookup.resolveLogisticsType(row))
                            .filter(Boolean)
                    );
                    const routes = ['Flex', 'Colecta']
                        .filter(route => detectedRoutes.has(route))
                        .concat(Array.from(detectedRoutes).filter(route => !['Flex', 'Colecta'].includes(route)));

                    App.state.orderLookupAvailableRoutes = routes;
                    filterSelect.innerHTML = `
                        <option value="">Todas las rutas</option>
                        ${routes.map(route => `<option value="${App.helpers.escapeHtml(route)}">${App.helpers.escapeHtml(route)}</option>`).join('')}
                    `;

                    filterSelect.value = routes.includes(previousValue) ? previousValue : '';
                },

                isMercadoLibreRow(row) {
                    const orderSource = App.helpers.normalizeHeaderKey(row.orderSource);
                    const dispatchRoute = App.helpers.normalizeHeaderKey(row.dispatchRoute);

                    return orderSource.includes('MERCADOLIBRE') || dispatchRoute.includes('MERCADOLIBRE');
                },

                resolveLogisticsType(row = {}, referenceOrderTypeMap = App.orderLookup.getReferenceOrderTypeMap()) {
                    if (referenceOrderTypeMap instanceof Map && referenceOrderTypeMap.size > 0) {
                        const matchedReferenceOrder = App.orderLookup.getSearchableFields()
                            .map(field => App.helpers.normalizeComparable(row[field.key]))
                            .find(value => value && referenceOrderTypeMap.has(value));

                        if (matchedReferenceOrder) {
                            return referenceOrderTypeMap.get(matchedReferenceOrder) || '';
                        }
                    }

                    const normalizedSignals = [
                        row.logisticsType,
                        row.dispatchRoute,
                        row.orderSource,
                        row.estado
                    ]
                        .map(App.helpers.normalizeHeaderKey)
                        .filter(Boolean)
                        .join(' ');

                    if (
                        normalizedSignals.includes('FLEX')
                        || normalizedSignals.includes('MESA05')
                        || normalizedSignals.includes('REVISION05')
                    ) {
                        return 'Flex';
                    }

                    if (
                        normalizedSignals.includes('COLECTA')
                        || normalizedSignals.includes('MESA03')
                        || normalizedSignals.includes('REVISION03')
                    ) {
                        return 'Colecta';
                    }

                    return '';
                },

                updateReferenceScopeEmptyState(reason = 'missingReference') {
                    const missingReference = reason === 'missingReference';
                    const title = missingReference ? 'Sin pedidos base' : 'Sin coincidencias';
                    const body = missingReference
                        ? 'Primero procesa etiquetas o usa el historial guardado para tener numeros con los que comparar el Excel.'
                        : 'El Excel cargado no contiene pedidos de Mercado Libre que coincidan con los numeros guardados o cargados actualmente.';
                    const rowMessage = missingReference
                        ? 'Primero carga etiquetas guardadas o pega texto para habilitar la consulta.'
                        : 'No hay pedidos del Excel que coincidan con los numeros guardados o cargados.';

                    App.state.orderLookupMatches = [];
                    App.orderLookup.updateSummary(title, body, missingReference ? 'empty' : 'warning');
                    App.orderLookup.renderNoMatchesRow(rowMessage);
                },

                findHeaderRowIndex(matrix) {
                    const requiredFields  = App.orderLookup.getFieldDefinitions().filter(field => field.required);
                    const allFields       = App.orderLookup.getFieldDefinitions();
                    const maxScore        = allFields.length;
                    let bestIndex         = -1;
                    let bestScore         = -1;

                    for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
                        const row = matrix[rowIndex];
                        if (!Array.isArray(row) || row.length === 0) continue;

                        const normalizedRow = row.map(App.helpers.normalizeHeaderKey);

                        const hasRequired = requiredFields.every(field =>
                            normalizedRow.some(header => field.aliases.includes(header))
                        );
                        if (!hasRequired) continue;

                        const score = allFields.reduce((total, field) =>
                            total + (normalizedRow.some(header => field.aliases.includes(header)) ? 1 : 0), 0
                        );

                        if (score > bestScore) {
                            bestScore = score;
                            bestIndex = rowIndex;
                            if (score === maxScore) break;  // puntuación perfecta, no hay mejor opción
                        }
                    }

                    return bestIndex;
                },

                resolveColumns(headers) {
                    return App.orderLookup.getFieldDefinitions().reduce((fieldMap, field) => {
                        const columnIndex = headers.findIndex(header =>
                            field.aliases.includes(App.helpers.normalizeHeaderKey(header))
                        );

                        fieldMap[field.key] = {
                            header: columnIndex >= 0 ? headers[columnIndex] : '',
                            index: columnIndex
                        };
                        return fieldMap;
                    }, {});
                },

                isSheetJsReady() {
                    return Boolean(
                        globalThis.XLSX
                        && typeof globalThis.XLSX.read === 'function'
                        && globalThis.XLSX.utils
                        && typeof globalThis.XLSX.utils.sheet_to_json === 'function'
                    );
                },

                loadSheetJsScript(src) {
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        const timeoutId = window.setTimeout(() => {
                            script.onload = null;
                            script.onerror = null;
                            reject(new Error(`Tiempo agotado cargando ${src}`));
                        }, 8000);
                        const cleanup = () => {
                            window.clearTimeout(timeoutId);
                            script.onload = null;
                            script.onerror = null;
                        };

                        script.onload = () => {
                            cleanup();
                            resolve();
                        };
                        script.onerror = () => {
                            cleanup();
                            reject(new Error(`No se pudo cargar ${src}`));
                        };

                        script.src = src;
                        script.async = true;
                        script.dataset.sheetjsRetry = 'true';
                        (document.head || document.body || document.documentElement).appendChild(script);
                    });
                },

                async ensureSheetJsLoaded() {
                    if (App.orderLookup.isSheetJsReady()) {
                        return globalThis.XLSX;
                    }

                    if (App.runtime.sheetJsLoadPromise) {
                        return App.runtime.sheetJsLoadPromise;
                    }

                    App.runtime.sheetJsLoadPromise = (async () => {
                        const sources = Array.from(new Set([
                            App.config.SHEETJS_SCRIPT_SRC,
                            ...App.config.SHEETJS_FALLBACK_SCRIPT_SRCS
                        ]));

                        for (const src of sources) {
                            try {
                                await App.orderLookup.loadSheetJsScript(src);
                                if (App.orderLookup.isSheetJsReady()) {
                                    return globalThis.XLSX;
                                }
                            } catch (error) {
                                console.warn('[App] SheetJS no disponible en', src, error);
                            }
                        }

                        throw new Error(
                            'No se pudo cargar la libreria de Excel. Verifica que xlsx.full.min.js este subido junto a index.html y recarga la pagina.'
                        );
                    })().catch(error => {
                        App.runtime.sheetJsLoadPromise = null;
                        throw error;
                    });

                    return App.runtime.sheetJsLoadPromise;
                },

                extractSheetRows(sheet) {
                    const matrix = globalThis.XLSX.utils.sheet_to_json(sheet, {
                        header: 1,
                        defval: '',
                        raw: false,
                        blankrows: false
                    });
                    const headerRowIndex = App.orderLookup.findHeaderRowIndex(matrix);

                    if (headerRowIndex === -1) {
                        return {
                            rows: [],
                            displayColumns: []
                        };
                    }

                    const headers = matrix[headerRowIndex].map((header, index) =>
                        App.helpers.normalizeComparable(header) || `Columna ${index + 1}`
                    );
                    const resolvedColumns = App.orderLookup.resolveColumns(headers);
                    const requiredFields = App.orderLookup.getFieldDefinitions().filter(field => field.required);

                    if (requiredFields.some(field => resolvedColumns[field.key].index < 0)) {
                        return {
                            rows: [],
                            displayColumns: []
                        };
                    }

                    // Convertimos cada fila a un objeto canonico para que luego sea facil
                    // ampliar la consulta con mas columnas sin depender del encabezado original.
                    const rows = matrix
                        .slice(headerRowIndex + 1)
                        .filter(row => Array.isArray(row) && row.some(cell => App.helpers.normalizeComparable(cell) !== ''))
                        .map(row => {
                            const item = {};

                            App.orderLookup.getFieldDefinitions().forEach(field => {
                                item[field.key] = resolvedColumns[field.key].index >= 0
                                    ? App.helpers.normalizeComparable(row[resolvedColumns[field.key].index] ?? '')
                                    : '';
                            });

                            item.logisticsType = App.orderLookup.resolveLogisticsType(item);

                            return item;
                        })
                        .filter(row => (
                            App.orderLookup.getSearchableFields().some(field => App.helpers.normalizeComparable(row[field.key]) !== '')
                            || App.helpers.normalizeComparable(row.estado) !== ''
                        ));

                    return {
                        rows,
                        displayColumns: App.orderLookup.getVisibleColumns()
                    };
                },

                extractWorkbookRows(workbook) {
                    const workbookSheets = workbook.Workbook?.Sheets || [];
                    const visibleSheetNames = workbook.SheetNames.filter((sheetName, index) => !workbookSheets[index]?.Hidden);
                    const sheetNamesToRead = visibleSheetNames.length > 0 ? visibleSheetNames : workbook.SheetNames;

                    const parsedWorkbook = sheetNamesToRead.reduce((accumulator, sheetName) => {
                        const sheet = workbook.Sheets[sheetName];
                        const { rows, displayColumns } = App.orderLookup.extractSheetRows(sheet);

                        if (rows.length > 0) {
                            accumulator.rows.push(...rows);
                            if (displayColumns.length > accumulator.displayColumns.length) {
                                accumulator.displayColumns = displayColumns;
                            }
                        }

                        return accumulator;
                    }, {
                        rows: [],
                        displayColumns: []
                    });

                    const mercadoLibreRows = parsedWorkbook.rows.filter(App.orderLookup.isMercadoLibreRow);

                    if (parsedWorkbook.rows.length === 0) {
                        throw new Error('El archivo Excel no contiene columnas reconocibles para numero de pedido y estado. Se buscan encabezados como DATO2 o Nro.Ref., y ESTADO o Estado Rev.');
                    }

                    if (mercadoLibreRows.length === 0) {
                        throw new Error('El archivo Excel no contiene pedidos de Mercado Libre para mostrar.');
                    }

                    return { ...parsedWorkbook, rows: mercadoLibreRows };
                },

                renderRows(rows) {
                    if (!App.dom.orderLookupTableBody || !App.dom.orderLookupTableWrap) {
                        return;
                    }

                    const columns = App.orderLookup.setTableColumns(App.orderLookup.getVisibleColumns());
                    App.dom.orderLookupTableBody.innerHTML = rows
                        .map(row => {
                            const effectiveStatus = App.orderLookup.getEffectiveStatus(row);
                            const rowClass = App.table.isCancelledStatus(effectiveStatus)
                                ? 'is-cancelled'
                                : App.table.isNdStatus(effectiveStatus)
                                    ? 'is-nd'
                                    : '';
                            return `<tr${rowClass ? ` class="${rowClass}"` : ''}>
                                ${columns.map(column => `
                                    <td class="order-lookup-col order-lookup-col--${App.helpers.escapeHtml(column.key)}">
                                        ${App.orderLookup.getCellMarkup(row, column)}
                                    </td>
                                `).join('')}
                            </tr>`;
                        })
                        .join('');

                    App.dom.orderLookupTableWrap.classList.remove('is-hidden');
                },

                getLogisticsBadgeMarkup(value) {
                    const normalizedValue = App.helpers.normalizeComparable(value);
                    if (!normalizedValue) {
                        return '<span class="order-lookup-badge is-unknown">Sin definir</span>';
                    }
                    const toneClass = normalizedValue === 'Flex'    ? 'is-flex'
                                    : normalizedValue === 'Colecta' ? 'is-colecta'
                                    : 'is-unknown';
                    return `<span class="order-lookup-badge ${toneClass}">${App.helpers.escapeHtml(normalizedValue)}</span>`;
                },

                getCellMarkup(row, column) {
                    const rawValue = row[column.key] ?? '';

                    if (column.key === 'estado') {
                        const normalizedValue = App.orderLookup.getEffectiveStatus(row) || 'Sin estado';
                        const toneClass = normalizedValue === 'N/D'
                            ? 'is-nd'
                            : App.table.isCancelledStatus(normalizedValue)
                                ? 'is-cancelled'
                            : normalizedValue === 'Sin estado'
                                ? 'is-empty'
                                : '';

                        return `<span class="order-lookup-state${toneClass ? ` ${toneClass}` : ''}">${App.helpers.escapeHtml(normalizedValue)}</span>`;
                    }

                    if (column.key === 'logisticsType') {
                        return App.orderLookup.getLogisticsBadgeMarkup(rawValue);
                    }

                    return App.helpers.escapeHtml(rawValue);
                },

                getActiveFilters() {
                    return {
                        query: App.helpers.normalizeComparable(App.dom.orderLookupInput?.value),
                        state: App.helpers.normalizeComparable(App.state.activeStatusFilter || App.dom.mainStatusFilter?.value || App.dom.orderLookupStateFilter?.value),
                        route: App.helpers.normalizeComparable(App.dom.orderLookupRouteFilter?.value)
                    };
                },

                filterRows(filters, rows = App.orderLookup.getScopedRows()) {
                    const searchableFields = App.orderLookup.getSearchableFields();

                    return rows.filter(row => {
                        const matchesQuery = !filters.query || searchableFields.some(field =>
                            App.helpers.normalizeComparable(row[field.key]).includes(filters.query)
                        );
                        const rowStatus = App.orderLookup.getEffectiveStatus(row);
                        const matchesState = !filters.state
                            || (
                                filters.state === App.table.getCancelledStatusFilterValue()
                                    ? App.table.isCancelledStatus(rowStatus)
                                    : App.table.isNdStatus(filters.state)
                                        ? App.table.isNdStatus(rowStatus)
                                        : rowStatus === filters.state
                            );
                        const matchesRoute = !filters.route ||
                            App.helpers.normalizeComparable(row.logisticsType) === filters.route;

                        return matchesQuery && matchesState && matchesRoute;
                    });
                },

                getEffectiveStatus(row = {}) {
                    const referenceNumber = App.helpers.normalizeComparable(
                        row.matchedReferenceNumber
                        || row.referenceNumber
                        || row.dato2
                        || row.numero
                    );

                    if (referenceNumber && App.table.isManualOrderCancelled(referenceNumber)) {
                        return 'PEDIDO CANCELADO';
                    }

                    return App.helpers.normalizeComparable(row.estado) || 'Sin estado';
                },

                getStatusTotals(rows = []) {
                    return rows.reduce((accumulator, row) => {
                        const status = App.orderLookup.getEffectiveStatus(row);
                        if (App.table.isCancelledStatus(status)) {
                            accumulator.cancelled += 1;
                        } else if (App.table.isNdStatus(status)) {
                            accumulator.nd += 1;
                        } else {
                            accumulator.withState += 1;
                        }

                        accumulator.total += 1;
                        return accumulator;
                    }, { total: 0, withState: 0, nd: 0, cancelled: 0 });
                },

                buildNotFoundMessage(filters) {
                    const criteria = [];

                    if (filters.query) {
                        criteria.push(`el pedido "${filters.query}"`);
                    }

                    if (filters.state) {
                        criteria.push(`el estado "${App.table.getStatusFilterLabel(filters.state)}"`);
                    }

                    if (filters.route) {
                        criteria.push(`la ruta "${filters.route}"`);
                    }

                    if (criteria.length > 0) {
                        const criteriaLabel = criteria.length === 1
                            ? criteria[0]
                            : `${criteria.slice(0, -1).join(', ')} y ${criteria[criteria.length - 1]}`;

                        return `No se encontraron pedidos de Mercado Libre para ${criteriaLabel}.`;
                    }

                    return 'No hay pedidos de Mercado Libre que coincidan con los numeros guardados o cargados usando los filtros actuales.';
                },

                updateNotFoundState(filters) {
                    App.orderLookup.updateSummary(
                        'Sin coincidencias',
                        App.orderLookup.buildNotFoundMessage(filters),
                        'warning'
                    );
                    App.orderLookup.renderNoMatchesRow('No hay pedidos de Mercado Libre que coincidan con los numeros guardados o cargados usando los filtros actuales.');
                },

                updateFoundState(matches) {
                    const totals = App.orderLookup.getStatusTotals(matches);

                    // Actualizar badges de stats
                    const elTotal = document.getElementById('olStatTotal');
                    const elWith  = document.getElementById('olStatWithState');
                    const elND    = document.getElementById('olStatND');
                    if (elTotal) elTotal.textContent = totals.total;
                    if (elWith)  elWith.textContent  = totals.withState;
                    if (elND)    elND.textContent     = totals.nd;

                    // Summary compacto con chips en vez de texto largo
                    const summary = App.dom.orderLookupSummary;
                    if (summary) {
                        summary.className = 'order-lookup-summary';
                        summary.innerHTML = `
                            <strong>Consulta actualizada</strong>
                            <div style="display:flex;gap:5px;flex-shrink:0;">
                                ${totals.withState > 0 ? `<span class="ol-chip ol-chip--success">${totals.withState} con estado</span>` : ''}
                                ${totals.nd > 0 ? `<span class="ol-chip ol-chip--warning">${totals.nd} N/D</span>` : ''}
                                ${totals.cancelled > 0 ? `<span class="ol-chip ol-chip--warning">${totals.cancelled} cancelado(s)</span>` : ''}
                            </div>`;
                    }

                    App.orderLookup.renderRows(matches);
                },

                async loadWorkbook(file) {
                    if (!file) {
                        return;
                    }

                    const MAX_MB = 15;
                    if (file.size > MAX_MB * 1024 * 1024) {
                        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). El límite es ${MAX_MB} MB.`);
                    }

                    await App.orderLookup.ensureSheetJsLoaded();

                    const buffer = await file.arrayBuffer();
                    const workbook = globalThis.XLSX.read(buffer, { type: 'array' });

                    if (!workbook.SheetNames.length) {
                        throw new Error('El archivo Excel no contiene hojas disponibles para consultar.');
                    }

                    const { rows } = App.orderLookup.extractWorkbookRows(workbook);
                    App.state.orderLookupRows = rows;  // ya filtrado a ML en extractWorkbookRows
                    App.state.orderLookupDisplayColumns = App.orderLookup.getVisibleColumns();
                    App.orderLookup.setLoadedFileName(file.name);
                    if (App.dom.orderLookupInput) {
                        App.dom.orderLookupInput.value = '';
                    }
                    if (App.dom.orderLookupStateFilter) {
                        App.dom.orderLookupStateFilter.value = '';
                    }
                    if (App.dom.orderLookupRouteFilter) {
                        App.dom.orderLookupRouteFilter.value = '';
                    }
                    App.state.activeStatusFilter = '';
                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = '';
                    }
                    const referenceOrderDescriptors = App.orderLookup.getReferenceOrderDescriptors();
                    const referenceOrderNumbers = new Set(
                        referenceOrderDescriptors.map(descriptor => descriptor.orderNumber)
                    );
                    const referenceOrderTypeMap = new Map(
                        referenceOrderDescriptors
                            .filter(descriptor => descriptor.logisticsType)
                            .map(descriptor => [descriptor.orderNumber, descriptor.logisticsType])
                    );
                    const matchedRows = App.orderLookup.getMatchedExcelRows(
                        App.state.orderLookupRows,
                        referenceOrderNumbers,
                        referenceOrderTypeMap
                    );
                    const scopedRows = App.orderLookup.getScopedRows(
                        App.state.orderLookupRows,
                        referenceOrderNumbers,
                        referenceOrderTypeMap,
                        referenceOrderDescriptors
                    );
                    const missingRows = scopedRows.filter(row => App.helpers.normalizeComparable(row.estado) === 'N/D');

                    App.orderLookup.populateStateFilter(scopedRows);
                    App.orderLookup.populateRouteFilter(scopedRows);
                    App.orderLookup.applyFilters({ showWarningOnEmptySource: false, scopedRows });
                    App.table.refreshStatusColumn();
                    App.ui.updateResultsMeta(`Excel cargado: ${file.name} (${App.state.orderLookupRows.length} pedido(s) de Mercado Libre).`);

                    let message = `Archivo "${file.name}" cargado correctamente. Se detectaron ${App.state.orderLookupRows.length} pedidos de Mercado Libre.`;
                    let messageType = 'success';

                    if (referenceOrderNumbers.size === 0) {
                        message = `Archivo "${file.name}" cargado correctamente. Se detectaron ${App.state.orderLookupRows.length} pedidos de Mercado Libre, pero aun no hay pedidos guardados o cargados para compararlos.`;
                        messageType = 'warning';
                    } else if (matchedRows.length === 0 && missingRows.length === 0) {
                        message = `Archivo "${file.name}" cargado correctamente. Se detectaron ${App.state.orderLookupRows.length} pedidos de Mercado Libre, pero ninguno coincide con los numeros guardados o cargados.`;
                        messageType = 'warning';
                    } else if (missingRows.length > 0) {
                        message = `Archivo "${file.name}" cargado correctamente. Se detectaron ${App.state.orderLookupRows.length} pedidos de Mercado Libre, ${matchedRows.length} coinciden con los numeros guardados o cargados y ${missingRows.length} se marcaron como N/D por no aparecer en el Excel.`;
                    } else {
                        message = `Archivo "${file.name}" cargado correctamente. Se detectaron ${App.state.orderLookupRows.length} pedidos de Mercado Libre y ${matchedRows.length} coinciden con los numeros guardados o cargados.`;
                    }

                    App.ui.showMessage(
                        message,
                        messageType,
                        { title: 'Consulta Pedido' }
                    );
                },

                applyFilters(options = {}) {
                    const { showWarningOnEmptySource = true, scopedRows = null } = options;
                    if (App.state.orderLookupRows.length === 0) {
                        if (showWarningOnEmptySource) {
                            App.ui.showMessage('Primero debes cargar un archivo Excel para consultar pedidos.', 'warning', { title: 'Consulta Pedido' });
                        }
                        return;
                    }

                    const referenceOrderNumbers = App.orderLookup.getReferenceOrderNumbers();
                    if (referenceOrderNumbers.size === 0) {
                        App.orderLookup.populateStateFilter([]);
                        App.orderLookup.populateRouteFilter([]);
                        App.storage.persistStoredOrderLookupState({ filters: App.orderLookup.getActiveFilters() });
                        App.orderLookup.updateReferenceScopeEmptyState('missingReference');
                        return;
                    }

                    const referenceOrderTypeMap = App.orderLookup.getReferenceOrderTypeMap();
                    const availableRows = Array.isArray(scopedRows)
                        ? scopedRows
                        : App.orderLookup.getScopedRows(App.state.orderLookupRows, referenceOrderNumbers, referenceOrderTypeMap);

                    App.orderLookup.populateStateFilter(availableRows);
                    App.orderLookup.populateRouteFilter(availableRows);
                    const filters = App.orderLookup.getActiveFilters();

                    // Solo persiste los filtros (no las filas) para evitar escrituras
                    // pesadas en localStorage en cada cambio de estado/ruta.
                    // Las filas se persisten únicamente al cargar el Excel (loadWorkbook).
                    App.storage.persistStoredOrderLookupState({ rows: App.state.orderLookupRows, filters });

                    if (availableRows.length === 0) {
                        App.orderLookup.updateReferenceScopeEmptyState('noMatches');
                        return;
                    }

                    const matches = App.orderLookup.filterRows(filters, availableRows)
                        .map(row => ({
                            ...row,
                            dato2: App.helpers.normalizeComparable(row.dato2),
                            estado: App.orderLookup.getEffectiveStatus(row),
                            logisticsType: App.helpers.normalizeComparable(row.logisticsType)
                                || App.orderLookup.resolveLogisticsType(row, referenceOrderTypeMap)
                                || ''
                        }));

                    App.state.orderLookupMatches = matches;

                    if (matches.length === 0) {
                        App.orderLookup.updateNotFoundState(filters);
                        return;
                    }

                    App.orderLookup.updateFoundState(matches);
                },

                clearFilters() {
                    if (App.dom.orderLookupInput) {
                        App.dom.orderLookupInput.value = '';
                    }
                    if (App.dom.orderLookupStateFilter) {
                        App.dom.orderLookupStateFilter.value = '';
                    }
                    if (App.dom.orderLookupRouteFilter) {
                        App.dom.orderLookupRouteFilter.value = '';
                    }
                    App.state.activeStatusFilter = '';
                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = '';
                    }
                    // Restaurar todos los estados disponibles (sin filtro de ruta)
                    App.orderLookup.populateStateFilter(App.orderLookup.getScopedRows());

                    App.orderLookup.applyFilters({ showWarningOnEmptySource: false });
                },

                syncReferenceScope(options = {}) {
                    if (App.state.orderLookupRows.length === 0) {
                        return;
                    }

                    const scopedRows = App.orderLookup.getScopedRows();
                    App.orderLookup.populateStateFilter(scopedRows);
                    App.orderLookup.populateRouteFilter(scopedRows);
                    App.orderLookup.applyFilters({
                        showWarningOnEmptySource: false,
                        ...options,
                        scopedRows
                    });
                },

                // Versión con debounce: consolida llamadas consecutivas en una sola
                _syncDebounceTimer: null,
                syncReferenceScopeDebounced(options = {}) {
                    clearTimeout(App.orderLookup._syncDebounceTimer);
                    App.orderLookup._syncDebounceTimer = setTimeout(
                        () => App.orderLookup.syncReferenceScope({ showWarningOnEmptySource: false, ...options }),
                        120
                    );
                },
            },

            pdfLabels: {
                isPdfJsReady() {
                    return Boolean(
                        globalThis.pdfjsLib
                        && typeof globalThis.pdfjsLib.getDocument === 'function'
                    );
                },

                loadPdfJsScript(src) {
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        const timeoutId = window.setTimeout(() => {
                            script.onload = null;
                            script.onerror = null;
                            reject(new Error(`Tiempo agotado cargando ${src}`));
                        }, 10000);
                        const cleanup = () => {
                            window.clearTimeout(timeoutId);
                            script.onload = null;
                            script.onerror = null;
                        };

                        script.onload = () => {
                            cleanup();
                            resolve();
                        };
                        script.onerror = () => {
                            cleanup();
                            reject(new Error(`No se pudo cargar ${src}`));
                        };

                        script.src = src;
                        script.async = true;
                        script.dataset.pdfjsRetry = 'true';
                        (document.head || document.body || document.documentElement).appendChild(script);
                    });
                },

                async ensurePdfJsLoaded() {
                    if (App.pdfLabels.isPdfJsReady()) {
                        globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = App.config.PDFJS_WORKER_SRC;
                        return globalThis.pdfjsLib;
                    }

                    if (App.runtime.pdfJsLoadPromise) {
                        return App.runtime.pdfJsLoadPromise;
                    }

                    App.runtime.pdfJsLoadPromise = (async () => {
                        await App.pdfLabels.loadPdfJsScript(App.config.PDFJS_SCRIPT_SRC);
                        if (!App.pdfLabels.isPdfJsReady()) {
                            throw new Error('La libreria PDF.js no quedo disponible despues de cargarla.');
                        }
                        globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = App.config.PDFJS_WORKER_SRC;
                        return globalThis.pdfjsLib;
                    })().catch(error => {
                        App.runtime.pdfJsLoadPromise = null;
                        throw error;
                    });

                    return App.runtime.pdfJsLoadPromise;
                },

                getRollWidthMm() {
                    const rawValue = App.dom.pdfLabelWidthInput?.value;
                    const parsed = parseFloat(rawValue);
                    return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
                },

                getMaxPrintableWidthPx() {
                    const dpi = 203;
                    const effectiveWidthMm = Math.max(
                        20,
                        App.pdfLabels.getRollWidthMm() - App.config.PDF_PRINT_SAFETY_MARGIN_MM
                    );
                    return Math.round((effectiveWidthMm / 25.4) * dpi);
                },

                setProgress(message = '', type = '') {
                    if (!App.dom.pdfLabelProgress) return;
                    App.dom.pdfLabelProgress.textContent = message;
                    App.dom.pdfLabelProgress.className = `pdf-label-progress${type ? ` is-${type}` : ''}`;
                },

                updateStatus() {
                    const count = App.state.pdfLabels.length;
                    const pending = App.state.pdfLabelsPendingCount;
                    const isBusy = pending > 0 || App.state.pdfLabelsPrinting;
                    const status = pending > 0
                        ? `Procesando ${pending} PDF...`
                        : (count === 0 ? 'Sin PDFs cargados' : `${count} etiqueta(s) PDF lista(s)`);

                    if (App.dom.pdfLabelStatus) {
                        App.dom.pdfLabelStatus.textContent = status;
                    }
                    if (App.dom.pdfLabelPickBtn) {
                        App.dom.pdfLabelPickBtn.disabled = isBusy;
                    }
                    if (App.dom.pdfLabelClearBtn) {
                        App.dom.pdfLabelClearBtn.disabled = count === 0 || isBusy;
                    }
                    if (App.dom.pdfLabelDialogBtn) {
                        App.dom.pdfLabelDialogBtn.disabled = count === 0 || isBusy;
                    }
                    if (App.dom.pdfLabelPrintBtn) {
                        App.dom.pdfLabelPrintBtn.disabled = count === 0 || isBusy;
                    }
                    if (App.dom.pdfLabelWidthInput) {
                        App.dom.pdfLabelWidthInput.disabled = App.state.pdfLabelsPrinting;
                    }
                },

                handleFiles(fileList) {
                    const files = Array.from(fileList || []).filter(file =>
                        file?.type === 'application/pdf'
                        || String(file?.name || '').toLowerCase().endsWith('.pdf')
                    );

                    if (files.length === 0) {
                        App.ui.showMessage('Selecciona uno o mas archivos PDF de etiquetas.', 'warning', { title: 'Etiquetas PDF' });
                        return;
                    }

                    App.pdfLabels.processFilesSequentially(files);
                },

                async processFilesSequentially(files) {
                    for (const file of files) {
                        await App.pdfLabels.processPdfFile(file);
                    }
                },

                async processPdfFile(file) {
                    App.state.pdfLabelsPendingCount += 1;
                    App.pdfLabels.updateStatus();
                    App.pdfLabels.setProgress(`Procesando ${file.name}...`);

                    try {
                        const pdfjs = await App.pdfLabels.ensurePdfJsLoaded();
                        const buffer = await file.arrayBuffer();
                        const pdf = await pdfjs.getDocument({ data: buffer }).promise;

                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
                            App.pdfLabels.setProgress(`Renderizando ${file.name} pagina ${pageNum} de ${pdf.numPages}...`);
                            const page = await pdf.getPage(pageNum);
                            const viewport = page.getViewport({ scale: App.config.PDF_RENDER_SCALE });
                            const canvas = document.createElement('canvas');
                            canvas.width = Math.ceil(viewport.width);
                            canvas.height = Math.ceil(viewport.height);
                            const context = canvas.getContext('2d', { willReadFrequently: true });

                            await page.render({ canvasContext: context, viewport }).promise;

                            const cropped = App.pdfLabels.cropCanvas(canvas);
                            App.state.pdfLabels.push({
                                id: App.state.pdfLabelsNextId,
                                filename: file.name,
                                pageLabel: pdf.numPages > 1 ? `pag. ${pageNum}/${pdf.numPages}` : 'pagina unica',
                                dataUrl: cropped.toDataURL('image/png'),
                                canvas: cropped
                            });
                            App.state.pdfLabelsNextId += 1;
                        }
                    } catch (error) {
                        App.ui.reportError(
                            error,
                            `No se pudo procesar "${file.name}". Revisa que sea un PDF valido.`,
                            'Etiquetas PDF'
                        );
                    } finally {
                        App.state.pdfLabelsPendingCount = Math.max(0, App.state.pdfLabelsPendingCount - 1);
                        App.pdfLabels.render();
                        App.pdfLabels.updateStatus();
                        if (App.state.pdfLabelsPendingCount === 0) {
                            App.pdfLabels.setProgress('');
                        }
                    }
                },

                cropCanvas(canvas) {
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    const { width, height } = canvas;
                    const imageData = context.getImageData(0, 0, width, height).data;
                    const threshold = 250;
                    let minX = width;
                    let minY = height;
                    let maxX = 0;
                    let maxY = 0;
                    let found = false;

                    for (let y = 0; y < height; y += 2) {
                        for (let x = 0; x < width; x += 2) {
                            const index = (y * width + x) * 4;
                            const r = imageData[index];
                            const g = imageData[index + 1];
                            const b = imageData[index + 2];
                            const a = imageData[index + 3];
                            if (a > 0 && (r < threshold || g < threshold || b < threshold)) {
                                found = true;
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }

                    if (!found) {
                        return canvas;
                    }

                    const margin = 14;
                    minX = Math.max(0, minX - margin);
                    minY = Math.max(0, minY - margin);
                    maxX = Math.min(width - 1, maxX + margin);
                    maxY = Math.min(height - 1, maxY + margin);

                    const cropWidth = maxX - minX + 1;
                    const cropHeight = maxY - minY + 1;
                    const cropped = document.createElement('canvas');
                    cropped.width = cropWidth;
                    cropped.height = cropHeight;
                    cropped
                        .getContext('2d', { willReadFrequently: true })
                        .drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                    return cropped;
                },

                render() {
                    const grid = App.dom.pdfLabelGrid;
                    if (!grid) {
                        return;
                    }

                    grid.innerHTML = '';
                    const maxWidthPx = App.pdfLabels.getMaxPrintableWidthPx();

                    App.state.pdfLabels.forEach((label, index) => {
                        const card = document.createElement('article');
                        card.className = 'pdf-label-card';

                        const badge = document.createElement('span');
                        badge.className = 'pdf-label-index';
                        badge.textContent = String(index + 1);

                        const removeButton = document.createElement('button');
                        removeButton.className = 'pdf-label-remove';
                        removeButton.type = 'button';
                        removeButton.title = 'Quitar etiqueta';
                        removeButton.setAttribute('aria-label', 'Quitar etiqueta');
                        removeButton.dataset.pdfLabelAction = 'remove';
                        removeButton.dataset.id = String(label.id);
                        removeButton.textContent = 'x';

                        const thumb = document.createElement('div');
                        thumb.className = 'pdf-label-thumb';
                        const image = document.createElement('img');
                        image.src = label.dataUrl;
                        image.alt = label.filename;
                        thumb.appendChild(image);

                        const meta = document.createElement('div');
                        meta.className = 'pdf-label-meta';
                        const name = document.createElement('strong');
                        name.textContent = label.filename;
                        const page = document.createElement('span');
                        page.textContent = `${label.pageLabel} - ${label.canvas.width} x ${label.canvas.height}px`;
                        meta.append(name, page);

                        if (label.canvas.width > maxWidthPx) {
                            const warning = document.createElement('small');
                            warning.textContent = 'Se reducira para caber en el rollo.';
                            meta.appendChild(warning);
                        }

                        const reorder = document.createElement('div');
                        reorder.className = 'pdf-label-reorder';
                        const upButton = document.createElement('button');
                        upButton.type = 'button';
                        upButton.dataset.pdfLabelAction = 'up';
                        upButton.dataset.id = String(label.id);
                        upButton.disabled = index === 0;
                        upButton.textContent = 'Subir';
                        const downButton = document.createElement('button');
                        downButton.type = 'button';
                        downButton.dataset.pdfLabelAction = 'down';
                        downButton.dataset.id = String(label.id);
                        downButton.disabled = index === App.state.pdfLabels.length - 1;
                        downButton.textContent = 'Bajar';
                        reorder.append(upButton, downButton);

                        card.append(badge, removeButton, thumb, meta, reorder);
                        grid.appendChild(card);
                    });

                    if (App.dom.pdfLabelEmpty) {
                        App.dom.pdfLabelEmpty.hidden = App.state.pdfLabels.length > 0;
                    }

                    App.pdfLabels.syncPrintArea();
                    App.pdfLabels.updateStatus();
                },

                removeLabel(id) {
                    if (App.state.pdfLabelsPrinting || App.state.pdfLabelsPendingCount > 0) return;
                    App.state.pdfLabels = App.state.pdfLabels.filter(label => label.id !== id);
                    App.pdfLabels.render();
                },

                moveLabel(id, direction) {
                    if (App.state.pdfLabelsPrinting || App.state.pdfLabelsPendingCount > 0) return;
                    const index = App.state.pdfLabels.findIndex(label => label.id === id);
                    if (index < 0) return;
                    const nextIndex = direction === 'up' ? index - 1 : index + 1;
                    if (nextIndex < 0 || nextIndex >= App.state.pdfLabels.length) return;
                    [App.state.pdfLabels[index], App.state.pdfLabels[nextIndex]] = [
                        App.state.pdfLabels[nextIndex],
                        App.state.pdfLabels[index]
                    ];
                    App.pdfLabels.render();
                },

                clearAll() {
                    if (App.state.pdfLabelsPrinting || App.state.pdfLabelsPendingCount > 0) return;
                    if (App.state.pdfLabels.length === 0) return;
                    if (!window.confirm('Quitar todas las etiquetas PDF cargadas?')) return;
                    App.state.pdfLabels = [];
                    App.pdfLabels.render();
                    App.pdfLabels.setProgress('');
                },

                handleGridAction(event) {
                    const button = event.target.closest('[data-pdf-label-action]');
                    if (!button) return;
                    const id = parseInt(button.dataset.id || '', 10);
                    if (!Number.isFinite(id)) return;

                    if (button.dataset.pdfLabelAction === 'remove') {
                        App.pdfLabels.removeLabel(id);
                    } else {
                        App.pdfLabels.moveLabel(id, button.dataset.pdfLabelAction);
                    }
                },

                fitCanvasToRollWidth(canvas) {
                    const maxWidthPx = App.pdfLabels.getMaxPrintableWidthPx();
                    if (canvas.width <= maxWidthPx) {
                        return canvas;
                    }

                    const scale = maxWidthPx / canvas.width;
                    const resized = document.createElement('canvas');
                    resized.width = maxWidthPx;
                    resized.height = Math.round(canvas.height * scale);
                    const context = resized.getContext('2d', { willReadFrequently: true });
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, resized.width, resized.height);
                    context.drawImage(
                        canvas,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                        0,
                        0,
                        resized.width,
                        resized.height
                    );
                    return resized;
                },

                canvasToZpl(canvas) {
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    const width = canvas.width;
                    const height = canvas.height;
                    const imageData = context.getImageData(0, 0, width, height).data;
                    const bytesPerRow = Math.ceil(width / 8);
                    const totalBytes = bytesPerRow * height;
                    const buffer = new Uint8Array(totalBytes);

                    for (let y = 0; y < height; y += 1) {
                        const rowOffset = y * bytesPerRow;
                        for (let x = 0; x < width; x += 1) {
                            const index = (y * width + x) * 4;
                            const r = imageData[index];
                            const g = imageData[index + 1];
                            const b = imageData[index + 2];
                            const a = imageData[index + 3];
                            const lum = (r * 0.299) + (g * 0.587) + (b * 0.114);

                            if (a > 10 && lum < 140) {
                                const byteIndex = rowOffset + (x >> 3);
                                const bitPosition = 7 - (x % 8);
                                buffer[byteIndex] |= (1 << bitPosition);
                            }
                        }
                    }

                    const hexParts = new Array(buffer.length);
                    for (let index = 0; index < buffer.length; index += 1) {
                        hexParts[index] = buffer[index].toString(16).padStart(2, '0').toUpperCase();
                    }

                    return `^XA\n^MMT\n^PW${width}\n^LL${height}\n^LS0\n~DGPDFLBL.GRF,${totalBytes},${bytesPerRow},${hexParts.join('')}\n^FO0,0^XGPDFLBL.GRF,1,1^FS\n^PQ1,0,1,Y\n^XZ\n`;
                },

                syncPrintArea() {
                    const printArea = App.dom.pdfLabelPrintArea;
                    if (!printArea) return;
                    printArea.innerHTML = '';

                    App.state.pdfLabels.forEach(label => {
                        const page = document.createElement('div');
                        page.className = 'pdf-print-page';
                        const image = document.createElement('img');
                        image.src = label.dataUrl;
                        image.alt = label.filename;
                        page.appendChild(image);
                        printArea.appendChild(page);
                    });
                },

                printWithDialog() {
                    if (App.state.pdfLabels.length === 0 || App.state.pdfLabelsPendingCount > 0) return;
                    App.pdfLabels.syncPrintArea();
                    window.print();
                },

                async sendZplToPrinter(printer, zpl) {
                    const response = await fetch(`${App.config.ZEBRA_BROWSER_PRINT_BASE_URL}/write`, {
                        method: 'POST',
                        body: JSON.stringify({
                            device: printer,
                            data: zpl
                        })
                    });

                    if (!response.ok) {
                        let detail = 'Error desconocido';
                        try {
                            detail = await response.text();
                        } catch (error) {
                            detail = 'Error desconocido';
                        }
                        throw new Error(`Fallo el envio a Browser Print: ${response.status} ${detail}`);
                    }
                },

                async printAllToZebra() {
                    if (
                        App.state.pdfLabels.length === 0
                        || App.state.pdfLabelsPendingCount > 0
                        || App.state.pdfLabelsPrinting
                    ) {
                        return;
                    }

                    const batch = App.state.pdfLabels.slice();
                    App.state.pdfLabelsPrinting = true;
                    App.pdfLabels.updateStatus();

                    try {
                        const printerConfig = App.actions.getSelectedZebraPrinterConfig();
                        const printer = await App.actions.resolveZebraPrinter(printerConfig);

                        if (!printer || typeof printer !== 'object' || !printer.uid) {
                            throw new Error(
                                'No se encontro ninguna impresora Zebra disponible. Asegurate de que Browser Print este abierto y la impresora este agregada.'
                            );
                        }

                        for (let index = 0; index < batch.length; index += 1) {
                            const label = batch[index];
                            App.pdfLabels.setProgress(`Enviando etiqueta ${index + 1} de ${batch.length} a ${printerConfig.label}...`);
                            const fittedCanvas = App.pdfLabels.fitCanvasToRollWidth(label.canvas);
                            const zpl = App.pdfLabels.canvasToZpl(fittedCanvas);
                            await App.pdfLabels.sendZplToPrinter(printer, zpl);
                        }

                        App.pdfLabels.setProgress(`Listo: ${batch.length} etiqueta(s) enviada(s) a ${printerConfig.label}.`, 'success');
                        App.ui.showMessage(
                            `${batch.length} etiqueta(s) PDF enviadas a ${printerConfig.label}.`,
                            'success',
                            { title: 'Etiquetas PDF' }
                        );
                    } catch (error) {
                        App.pdfLabels.setProgress('No se pudo completar la impresion PDF.', 'error');
                        App.ui.reportError(error, 'No se pudieron imprimir las etiquetas PDF.', 'Etiquetas PDF');
                    } finally {
                        App.state.pdfLabelsPrinting = false;
                        App.pdfLabels.updateStatus();
                    }
                },

                async printPdfBlob(blob, filename = 'Etiqueta PDF', options = {}) {
                    if (!blob) {
                        throw new Error('No se recibio el PDF para imprimir.');
                    }

                    const pdfjs = await App.pdfLabels.ensurePdfJsLoaded();
                    const buffer = await blob.arrayBuffer();
                    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
                    const printerConfig = App.actions.getSelectedZebraPrinterConfig();
                    const printer = await App.actions.resolveZebraPrinter(printerConfig);

                    if (!printer || typeof printer !== 'object' || !printer.uid) {
                        throw new Error(
                            'No se encontro ninguna impresora Zebra disponible. Asegurate de que Browser Print este abierto y la impresora este agregada.'
                        );
                    }

                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
                        options.onProgress?.(`Imprimiendo ${filename} pagina ${pageNum} de ${pdf.numPages}...`);
                        const page = await pdf.getPage(pageNum);
                        const viewport = page.getViewport({ scale: App.config.PDF_RENDER_SCALE });
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.ceil(viewport.width);
                        canvas.height = Math.ceil(viewport.height);
                        const context = canvas.getContext('2d', { willReadFrequently: true });

                        await page.render({ canvasContext: context, viewport }).promise;

                        const cropped = App.pdfLabels.cropCanvas(canvas);
                        const fittedCanvas = App.pdfLabels.fitCanvasToRollWidth(cropped);
                        const zpl = App.pdfLabels.canvasToZpl(fittedCanvas);
                        await App.pdfLabels.sendZplToPrinter(printer, zpl);
                    }

                    return {
                        ok: true,
                        printed: pdf.numPages,
                        printer: printerConfig.label
                    };
                }
            },

            downloadsWatcher: {
                isSupported() {
                    return typeof window.showDirectoryPicker === 'function';
                },

                getHelperToken() {
                    const fallbackToken = App.config.DOWNLOADS_HELPER_DEFAULT_TOKEN;
                    try {
                        const storage = App.downloadsWatcher.getStorage();
                        const storedToken = storage?.getItem(App.config.DOWNLOADS_HELPER_TOKEN_KEY);
                        return String(storedToken || fallbackToken).trim() || fallbackToken;
                    } catch (error) {
                        return fallbackToken;
                    }
                },

                getHelperFetchOptions(options = {}) {
                    const headers = new Headers(options.headers || {});
                    headers.set(App.config.DOWNLOADS_HELPER_TOKEN_HEADER, App.downloadsWatcher.getHelperToken());
                    return {
                        ...options,
                        cache: options.cache || 'no-store',
                        headers
                    };
                },

                getHelperUrl(path = '') {
                    return `${App.config.DOWNLOADS_HELPER_BASE_URL}${path}`;
                },

                async fetchHelperStatus() {
                    const response = await fetch(
                        App.downloadsWatcher.getHelperUrl('/status'),
                        App.downloadsWatcher.getHelperFetchOptions()
                    );

                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Helper local rechazo la conexion. Verifica que el token del .bat y la app coincidan.');
                    }

                    if (!response.ok) {
                        throw new Error(`Helper local no disponible (${response.status}).`);
                    }

                    return response.json();
                },

                async fetchLatestFromHelper() {
                    const since = App.runtime.downloadsWatch.helperLastKey;
                    const path = since
                        ? `/latest-excel?since=${encodeURIComponent(since)}`
                        : '/latest-excel';
                    const response = await fetch(
                        App.downloadsWatcher.getHelperUrl(path),
                        App.downloadsWatcher.getHelperFetchOptions()
                    );

                    if (response.status === 204) {
                        return null;
                    }

                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Helper local rechazo la descarga. Verifica que el token del .bat y la app coincidan.');
                    }

                    if (!response.ok) {
                        throw new Error(`No se pudo consultar Descargas (${response.status}).`);
                    }

                    const fileName = decodeURIComponent(
                        response.headers.get('X-NovaPet-File-Name') || 'GridViewSolicitudDespacho.xlsx'
                    );
                    const helperKey = response.headers.get('X-NovaPet-File-Key') || '';
                    const lastModified = Number(response.headers.get('X-NovaPet-File-Modified')) || Date.now();
                    const blob = await response.blob();
                    const file = new File([blob], fileName, {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        lastModified
                    });

                    return { file, helperKey };
                },

                getStorage() {
                    return App.runtime.storage || window.localStorage || null;
                },

                getProcessedKeys() {
                    if (App.runtime.downloadsWatch.processedKeys.size > 0) {
                        return App.runtime.downloadsWatch.processedKeys;
                    }

                    const storage = App.downloadsWatcher.getStorage();
                    if (!storage) {
                        return App.runtime.downloadsWatch.processedKeys;
                    }

                    try {
                        const parsed = JSON.parse(storage.getItem(App.config.DOWNLOADS_WATCH_STORAGE_KEY) || '[]');
                        App.runtime.downloadsWatch.processedKeys = new Set(Array.isArray(parsed) ? parsed : []);
                    } catch (error) {
                        App.runtime.downloadsWatch.processedKeys = new Set();
                    }

                    return App.runtime.downloadsWatch.processedKeys;
                },

                persistProcessedKeys() {
                    const storage = App.downloadsWatcher.getStorage();
                    if (!storage) {
                        return;
                    }

                    const keys = Array.from(App.runtime.downloadsWatch.processedKeys).slice(-120);
                    App.runtime.downloadsWatch.processedKeys = new Set(keys);
                    storage.setItem(App.config.DOWNLOADS_WATCH_STORAGE_KEY, JSON.stringify(keys));
                },

                buildFileKey(file) {
                    return `${file.name}|${file.size}|${file.lastModified}`;
                },

                normalizeFileName(value) {
                    return String(value || '')
                        .trim()
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '');
                },

                isCandidateName(fileName) {
                    const normalizedName = App.downloadsWatcher.normalizeFileName(fileName);
                    if (!normalizedName.endsWith('.xlsx')) {
                        return false;
                    }

                    if (
                        normalizedName.startsWith('~$')
                        || normalizedName.endsWith('.tmp')
                        || normalizedName.endsWith('.crdownload')
                    ) {
                        return false;
                    }

                    return normalizedName.startsWith(`${App.config.DOWNLOADS_WATCH_FILENAME_PREFIX} -`);
                },

                async ensurePermission(directoryHandle) {
                    if (!directoryHandle?.queryPermission || !directoryHandle?.requestPermission) {
                        return true;
                    }

                    const options = { mode: 'read' };
                    if (await directoryHandle.queryPermission(options) === 'granted') {
                        return true;
                    }

                    return await directoryHandle.requestPermission(options) === 'granted';
                },

                setButtonState(state = 'idle', detail = '') {
                    const button = App.dom.downloadsWatchBtn;
                    if (!button) {
                        return;
                    }

                    const active = state === 'active' || state === 'processing';
                    button.classList.toggle('is-active', active);
                    button.classList.toggle('is-processing', state === 'processing');
                    button.disabled = state === 'processing';
                    button.setAttribute('aria-pressed', String(active));
                    button.title = detail || (
                        active
                            ? 'Detener vigilancia de la carpeta Excel'
                            : 'Selecciona la carpeta DESCARGA donde llegan los Excel'
                    );

                    const activeLabel = App.runtime.downloadsWatch.mode === 'helper'
                        ? 'Vigilando Descargas'
                        : 'Vigilando carpeta';
                    const label = state === 'processing'
                        ? 'Cargando Excel'
                        : active
                            ? activeLabel
                            : 'Vigilar Descargas';

                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h5l2 3h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v2"/></svg>
                        ${label}
                    `;
                },

                async chooseDirectory() {
                    if (!App.downloadsWatcher.isSupported()) {
                        throw new Error('Tu navegador no permite vigilar carpetas desde esta pagina. Usa Chrome o Edge actualizado.');
                    }

                    App.ui.showMessage(
                        'Selecciona la carpeta DESCARGA. No selecciones Descargas completo porque el navegador puede bloquearla.',
                        'info',
                        { title: 'Carpeta Excel', timeout: 9000 }
                    );

                    let directoryHandle;
                    try {
                        directoryHandle = await window.showDirectoryPicker({
                            id: 'novapet-excel-downloads',
                            mode: 'read',
                            startIn: 'downloads'
                        });
                    } catch (error) {
                        if (error?.name === 'AbortError') {
                            throw error;
                        }
                        directoryHandle = await window.showDirectoryPicker({
                            id: 'novapet-excel-downloads',
                            mode: 'read'
                        });
                    }

                    if (!await App.downloadsWatcher.ensurePermission(directoryHandle)) {
                        throw new Error('No se autorizo el acceso de lectura a la carpeta seleccionada.');
                    }

                    return directoryHandle;
                },

                async scanDirectory() {
                    const directoryHandle = App.runtime.downloadsWatch.directoryHandle;
                    if (!directoryHandle) {
                        return [];
                    }

                    const files = [];
                    for await (const [name, handle] of directoryHandle.entries()) {
                        if (handle.kind !== 'file' || !App.downloadsWatcher.isCandidateName(name)) {
                            continue;
                        }

                        try {
                            const file = await handle.getFile();
                            if (file.size > 0 && App.downloadsWatcher.isCandidateName(file.name)) {
                                files.push({ file, handle, key: App.downloadsWatcher.buildFileKey(file) });
                            }
                        } catch (error) {
                            console.warn('[App] No se pudo leer archivo de Descargas:', name, error);
                        }
                    }

                    return files.sort((a, b) => a.file.lastModified - b.file.lastModified);
                },

                getReadyNewFiles(files) {
                    const now = Date.now();
                    const processedKeys = App.downloadsWatcher.getProcessedKeys();
                    return files.filter(item => {
                        if (processedKeys.has(item.key)) {
                            return false;
                        }

                        if (now - item.file.lastModified < App.config.DOWNLOADS_WATCH_STABLE_MS) {
                            return false;
                        }

                        const previous = App.runtime.downloadsWatch.pendingFiles.get(item.key);
                        App.runtime.downloadsWatch.pendingFiles.set(item.key, {
                            size: item.file.size,
                            lastSeenAt: now
                        });

                        return Boolean(previous && previous.size === item.file.size);
                    });
                },

                markProcessed(file) {
                    App.downloadsWatcher.getProcessedKeys().add(App.downloadsWatcher.buildFileKey(file));
                    App.downloadsWatcher.persistProcessedKeys();
                },

                getHelperProcessedKey(helperKey) {
                    return helperKey ? `helper|${helperKey}` : '';
                },

                markHelperProcessed(helperKey) {
                    const key = App.downloadsWatcher.getHelperProcessedKey(helperKey);
                    if (!key) {
                        return;
                    }

                    App.downloadsWatcher.getProcessedKeys().add(key);
                    App.runtime.downloadsWatch.helperLastKey = helperKey;
                    App.downloadsWatcher.persistProcessedKeys();
                },

                async processFile(file, options = {}) {
                    const { force = false } = options;
                    if (!force && App.downloadsWatcher.getProcessedKeys().has(App.downloadsWatcher.buildFileKey(file))) {
                        return false;
                    }

                    App.runtime.downloadsWatch.processing = true;
                    App.downloadsWatcher.setButtonState('processing', `Cargando ${file.name}`);

                    try {
                        await App.orderLookup.loadWorkbook(file);
                        App.downloadsWatcher.markProcessed(file);
                        App.notifications.record({
                            title: 'Excel automatico',
                            message: `Se cargo automaticamente ${file.name}.`,
                            type: 'success'
                        });
                        return true;
                    } catch (error) {
                        App.ui.reportError(error, `No fue posible cargar automaticamente "${file.name}".`, 'Descargas');
                        return false;
                    } finally {
                        App.runtime.downloadsWatch.processing = false;
                        if (App.runtime.downloadsWatch.active) {
                            App.downloadsWatcher.setButtonState('active');
                        }
                    }
                },

                async tick() {
                    if (!App.runtime.downloadsWatch.active || App.runtime.downloadsWatch.processing) {
                        return;
                    }

                    if (App.runtime.downloadsWatch.mode === 'helper') {
                        await App.downloadsWatcher.tickHelper();
                        return;
                    }

                    try {
                        const files = await App.downloadsWatcher.scanDirectory();
                        const readyFiles = App.downloadsWatcher.getReadyNewFiles(files);

                        for (const item of readyFiles) {
                            if (!App.runtime.downloadsWatch.active) {
                                break;
                            }
                            await App.downloadsWatcher.processFile(item.file);
                        }
                    } catch (error) {
                        App.downloadsWatcher.stop();
                        App.ui.reportError(error, 'Se detuvo la vigilancia de Descargas.', 'Descargas');
                    }
                },

                async tickHelper() {
                    try {
                        const latest = await App.downloadsWatcher.fetchLatestFromHelper();
                        if (!latest?.file) {
                            return;
                        }

                        const processedKey = App.downloadsWatcher.getHelperProcessedKey(latest.helperKey);
                        if (processedKey && App.downloadsWatcher.getProcessedKeys().has(processedKey)) {
                            App.runtime.downloadsWatch.helperLastKey = latest.helperKey;
                            return;
                        }

                        const loaded = await App.downloadsWatcher.processFile(latest.file, { force: true });
                        if (loaded) {
                            App.downloadsWatcher.markHelperProcessed(latest.helperKey);
                        }
                    } catch (error) {
                        App.downloadsWatcher.stop();
                        App.ui.reportError(
                            error,
                            'Se perdio la conexion con el ayudante local de Descargas. Ejecuta nuevamente Iniciar-Vigilancia-Descargas.bat.',
                            'Descargas'
                        );
                    }
                },

                schedule() {
                    window.clearInterval(App.runtime.downloadsWatch.timer);
                    App.runtime.downloadsWatch.timer = window.setInterval(
                        () => App.downloadsWatcher.tick(),
                        App.config.DOWNLOADS_WATCH_INTERVAL_MS
                    );
                },

                async start() {
                    if (App.downloadsWatcher.isSupported()) {
                        await App.downloadsWatcher.startBrowserDirectory();
                        return;
                    }

                    try {
                        await App.downloadsWatcher.startLocalHelper();
                    } catch (helperError) {
                        App.downloadsWatcher.stop();
                        throw new Error('Tu navegador no permite vigilar carpetas directamente. Usa Chrome o Edge actualizado.');
                    }
                },

                async startBrowserDirectory() {
                    const directoryHandle = await App.downloadsWatcher.chooseDirectory();
                    App.runtime.downloadsWatch.mode = 'directory';
                    App.runtime.downloadsWatch.directoryHandle = directoryHandle;
                    App.runtime.downloadsWatch.active = true;
                    App.runtime.downloadsWatch.pendingFiles.clear();
                    App.runtime.downloadsWatch.helperLastKey = '';
                    App.downloadsWatcher.getProcessedKeys();
                    App.downloadsWatcher.setButtonState('active');
                    App.downloadsWatcher.schedule();
                    App.ui.showMessage(
                        `Vigilando carpeta: ${directoryHandle.name || 'DESCARGA'}.`,
                        'success',
                        { title: 'Descargas' }
                    );
                    await App.downloadsWatcher.tick();
                },

                async startLocalHelper() {
                    const status = await App.downloadsWatcher.fetchHelperStatus();
                    if (!status?.ok) {
                        throw new Error('El ayudante local no respondio correctamente.');
                    }

                    App.runtime.downloadsWatch.mode = 'helper';
                    App.runtime.downloadsWatch.directoryHandle = null;
                    App.runtime.downloadsWatch.active = true;
                    App.runtime.downloadsWatch.pendingFiles.clear();
                    App.runtime.downloadsWatch.helperLastKey = '';
                    App.downloadsWatcher.getProcessedKeys();
                    App.downloadsWatcher.setButtonState('active');
                    App.downloadsWatcher.schedule();
                    App.ui.showMessage(
                        `Vigilando Descargas real: ${status.downloadsPath || 'carpeta Descargas'}.`,
                        'success',
                        { title: 'Descargas' }
                    );
                    await App.downloadsWatcher.tickHelper();
                },

                stop() {
                    window.clearInterval(App.runtime.downloadsWatch.timer);
                    App.runtime.downloadsWatch.timer = null;
                    App.runtime.downloadsWatch.active = false;
                    App.runtime.downloadsWatch.processing = false;
                    App.runtime.downloadsWatch.mode = '';
                    App.runtime.downloadsWatch.pendingFiles.clear();
                    App.downloadsWatcher.setButtonState('idle');
                },

                async toggle() {
                    if (App.runtime.downloadsWatch.active) {
                        App.downloadsWatcher.stop();
                        App.ui.showMessage('Vigilancia de Descargas detenida.', 'info', { title: 'Descargas' });
                        return;
                    }

                    try {
                        await App.downloadsWatcher.start();
                    } catch (error) {
                        if (error?.name === 'AbortError') {
                            return;
                        }
                        App.downloadsWatcher.stop();
                        App.ui.reportError(error, 'No fue posible activar la vigilancia de Descargas.', 'Descargas');
                    }
                }
            },

            table: {
                flattenDocumentRows(documents) {
                    return documents.flatMap(documentItem =>
                        documentItem.rows.map((row, index) => ({
                            ...row,
                            documentId: documentItem.id,
                            sourceName: documentItem.sourceName || 'Documento sin nombre',
                            storedAt: documentItem.storedAt,
                            storedLabel: App.storage.formatDateTime(documentItem.storedAt),
                            viewId: `${documentItem.id}-${index}-${row.numero}`
                        }))
                    );
                },

                normalizeZplText(value) {
                    return String(value ?? '').trim();
                },

                validateZplRows(rows) {
                    if (!Array.isArray(rows)) {
                        return [];
                    }

                    return rows.map((row, index) => {
                        const zpl = App.table.normalizeZplText(row?.zpl);
                        const labelNumber = index + 1;

                        if (!zpl) {
                            throw new Error(`La etiqueta ${labelNumber} no contiene ZPL para imprimir.`);
                        }

                        if (zpl.length > App.config.ZPL_MAX_LABEL_CHARS) {
                            throw new Error(`La etiqueta ${labelNumber} supera el tamano maximo permitido para impresion.`);
                        }

                        if (!zpl.startsWith('^XA') || !zpl.endsWith('^XZ')) {
                            throw new Error(`La etiqueta ${labelNumber} no tiene estructura ZPL valida (^XA ... ^XZ).`);
                        }

                        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(zpl)) {
                            throw new Error(`La etiqueta ${labelNumber} contiene caracteres de control no permitidos.`);
                        }

                        const upperZpl = zpl.toUpperCase();
                        const blockedCommand = App.config.ZPL_BLOCKED_COMMANDS.find(command => upperZpl.includes(command));
                        if (blockedCommand) {
                            throw new Error(`La etiqueta ${labelNumber} contiene un comando ZPL no permitido (${blockedCommand}).`);
                        }

                        return { ...row, zpl };
                    });
                },

                buildRawZplFromRows(rows) {
                    return rows.map(row => App.table.normalizeZplText(row.zpl)).join('\n');
                },

                buildPrintableZplFromRows(rows) {
                    const validatedRows = App.table.validateZplRows(rows);
                    const zpl = App.table.buildRawZplFromRows(validatedRows);
                    if (zpl.length > App.config.ZPL_MAX_BATCH_CHARS) {
                        throw new Error('El lote de etiquetas supera el tamano maximo permitido para impresion.');
                    }
                    return zpl;
                },

                getSelectedRows() {
                    return Array.from(App.state.selectedRowsById.values());
                },

                getVisibleCheckedRows() {
                    return Array.from(App.dom.tableBody.querySelectorAll('tr'))
                        .filter(tr => tr.querySelector('input[type="checkbox"]')?.checked)
                        .map(tr => App.state.extractedRows.find(row => row.viewId === tr.dataset.rowId))
                        .filter(Boolean);
                },

                getRowsSelectedForStatusAction() {
                    const rowsByKey = new Map();
                    const addRow = row => {
                        const orderNumber = App.helpers.normalizeComparable(row?.numero);
                        const key = orderNumber || row?.viewId;
                        if (key && !rowsByKey.has(key)) {
                            rowsByKey.set(key, row);
                        }
                    };

                    App.table.getSelectedRows().forEach(addRow);
                    App.state.extractedRows
                        .filter(row => App.state.selectedRowIds.has(row.viewId))
                        .forEach(addRow);
                    App.table.getVisibleCheckedRows().forEach(addRow);

                    return Array.from(rowsByKey.values());
                },

                clearSelectedRows() {
                    App.state.selectedRowIds = new Set();
                    App.state.selectedRowsById = new Map();
                },

                setActiveBaseFromDocuments(documents, message, options = {}) {
                    const { selectedHistoryDocumentIds = null } = options;
                    App.state.activeBaseRows = App.table.flattenDocumentRows(documents);
                    App.state.activeBaseMessage = message;
                    App.state.selectedHistoryDocumentIds = selectedHistoryDocumentIds instanceof Set
                        ? new Set(selectedHistoryDocumentIds)
                        : Array.isArray(selectedHistoryDocumentIds)
                            ? new Set(selectedHistoryDocumentIds)
                            : new Set();
                    App.dom.searchInput.value = '';
                    App.table.renderResults(App.state.activeBaseRows, App.state.activeBaseMessage);
                    App.storage.updateStorageUI();
                    App.orderLookup.syncReferenceScopeDebounced();
                },

                getSearchableRows() {
                    const combinedRows = [
                        ...App.state.activeBaseRows,
                        ...App.table.flattenDocumentRows(App.state.storedDocuments)
                    ];
                    const seen = new Set();

                    return combinedRows.filter(row => {
                        const key = `${row.documentId || 'sin-doc'}-${row.numero}-${row.zpl}`;
                        if (seen.has(key)) {
                            return false;
                        }

                        seen.add(key);
                        return true;
                    });
                },

                normalizeRowTypeFilter(filter) {
                    return filter === 'flex' || filter === 'colecta' ? filter : 'all';
                },

                getRowTypeFilterLabel(filter = App.state.activeRowTypeFilter) {
                    return filter === 'flex'
                        ? 'FLEX'
                        : filter === 'colecta'
                            ? 'COLECTA'
                            : 'TODOS';
                },

                getManualOrderStatus(orderNumber) {
                    const key = App.helpers.normalizeComparable(orderNumber);
                    return key ? App.helpers.normalizeComparable(App.state.manualOrderStatuses?.[key]?.status) : '';
                },

                isCancelledStatus(status) {
                    const key = App.helpers.normalizeHeaderKey(status);
                    return key.includes('CANCEL') || key.includes('ANUL');
                },

                isNdStatus(status) {
                    const key = App.helpers.normalizeHeaderKey(status);
                    return !key || key === 'ND' || key === 'SINESTADO' || key === 'SINDEFINIR';
                },

                isManualOrderCancelled(orderNumber) {
                    return App.table.isCancelledStatus(App.table.getManualOrderStatus(orderNumber));
                },

                getOrderStatusForRow(row, options = {}) {
                    const orderNumber = App.helpers.normalizeComparable(row?.numero);
                    const manualStatus = options.ignoreManual
                        ? ''
                        : App.table.getManualOrderStatus(orderNumber);
                    if (manualStatus) {
                        return manualStatus;
                    }

                    if (!orderNumber || !Array.isArray(App.state.orderLookupRows) || App.state.orderLookupRows.length === 0) {
                        return 'N/D';
                    }

                    const matchedOrder = App.state.orderLookupRows.find(lookupRow =>
                        App.orderLookup.getSearchableFields().some(field =>
                            App.helpers.normalizeComparable(lookupRow[field.key]) === orderNumber
                        )
                    );

                    return App.helpers.normalizeComparable(matchedOrder?.estado) || 'N/D';
                },

                getOrderStatusClass(status) {
                    const key = App.helpers.normalizeHeaderKey(status);
                    if (App.table.isCancelledStatus(status)) {
                        return 'is-cancelled';
                    }

                    if (App.table.isNdStatus(status)) {
                        return 'is-nd';
                    }

                    if (
                        key.includes('COMPLETO') ||
                        key.includes('FINALIZADO') ||
                        key.includes('ENTREGADO') ||
                        key === 'OK'
                    ) {
                        return 'is-complete';
                    }

                    if (
                        key.includes('DIGITACION') ||
                        key.includes('PENDIENTE') ||
                        key.includes('PROCESO') ||
                        key.includes('REVISION')
                    ) {
                        return 'is-progress';
                    }

                    return 'is-default';
                },

                getOrderStatusMarkup(row) {
                    const status = App.table.getOrderStatusForRow(row);
                    const statusClass = App.table.getOrderStatusClass(status);
                    const manualStatus = App.table.getManualOrderStatus(row?.numero);
                    const isManual = Boolean(manualStatus);
                    const routeLabel = row?.type
                        ? `Etiqueta: ${String(row.type).toUpperCase()}`
                        : 'Etiqueta sin tipo';
                    const title = isManual
                        ? `Estado manual: ${manualStatus}`
                        : routeLabel;

                    return `<span class="row-status-badge ${statusClass}" title="${App.helpers.escapeHtml(title)}">${App.helpers.escapeHtml(status)}</span>`;
                },

                getActiveStatusFilter() {
                    return App.helpers.normalizeComparable(App.state.activeStatusFilter || App.dom.mainStatusFilter?.value);
                },

                getCancelledStatusFilterValue() {
                    return '__CANCELLED__';
                },

                getStatusFilterLabel(filter = App.table.getActiveStatusFilter()) {
                    const normalizedFilter = App.helpers.normalizeComparable(filter);
                    if (normalizedFilter === App.table.getCancelledStatusFilterValue()) {
                        return 'CANCELADOS / ANULADOS';
                    }

                    return normalizedFilter;
                },

                getStatusDisplayLabel(status) {
                    const normalizedStatus = App.helpers.normalizeComparable(status);
                    const statusKey = App.helpers.normalizeHeaderKey(normalizedStatus);

                    if (!normalizedStatus || App.table.isNdStatus(normalizedStatus)) {
                        return 'N/D';
                    }

                    if (App.table.isCancelledStatus(normalizedStatus)) {
                        return 'Cancelado / Anulado';
                    }

                    const knownLabels = {
                        GESTIONDERUTA: 'Gestion de ruta',
                        PENDIENTE: 'Pendiente',
                        ENPROCESO: 'En proceso',
                        DIGITACION: 'Digitacion',
                        REVISION: 'Revision',
                        COMPLETO: 'Completo',
                        FINALIZADO: 'Finalizado',
                        ENTREGADO: 'Entregado'
                    };

                    if (knownLabels[statusKey]) {
                        return knownLabels[statusKey];
                    }

                    if (normalizedStatus === normalizedStatus.toUpperCase()) {
                        return normalizedStatus
                            .toLowerCase()
                            .replace(/(^|\s)\S/g, character => character.toUpperCase());
                    }

                    return normalizedStatus;
                },

                getStatusSummaryIcon(item) {
                    if (item.key === '__TOTAL__') {
                        return 'T';
                    }

                    if (item.filter === App.table.getCancelledStatusFilterValue()) {
                        return 'X';
                    }

                    if (App.table.isNdStatus(item.filter)) {
                        return 'N';
                    }

                    const words = String(item.label || '')
                        .split(/\s+/)
                        .filter(Boolean);
                    const initials = words
                        .slice(0, 2)
                        .map(word => word.charAt(0).toUpperCase())
                        .join('');
                    return initials || 'E';
                },

                getStatusSummaryItems(rows = App.state.currentResultRows) {
                    const summary = new Map();

                    rows.forEach(row => {
                        const status = App.table.getOrderStatusForRow(row);
                        const isCancelled = App.table.isCancelledStatus(status);
                        const isNd = App.table.isNdStatus(status);
                        const filter = isCancelled
                            ? App.table.getCancelledStatusFilterValue()
                            : isNd
                                ? 'N/D'
                                : App.helpers.normalizeComparable(status);
                        const key = isCancelled
                            ? '__CANCELLED__'
                            : isNd
                                ? 'ND'
                                : App.helpers.normalizeHeaderKey(filter);

                        if (!summary.has(key)) {
                            summary.set(key, {
                                key,
                                filter,
                                label: isCancelled ? 'Cancelado / Anulado' : App.table.getStatusDisplayLabel(filter),
                                count: 0,
                                toneClass: isCancelled ? 'is-cancelled' : App.table.getOrderStatusClass(filter)
                            });
                        }

                        summary.get(key).count += 1;
                    });

                    const totalsByType = App.table.countRowsByType(rows);
                    const preferredOrder = new Map([
                        ['GESTIONDERUTA', 1],
                        ['ND', 2],
                        ['__CANCELLED__', 3],
                        ['PENDIENTE', 4],
                        ['ENPROCESO', 5]
                    ]);
                    const defaultStatusItems = [
                        {
                            key: 'GESTIONDERUTA',
                            filter: 'Gestion de ruta',
                            label: 'Gestion de ruta',
                            count: 0,
                            toneClass: 'is-default'
                        },
                        {
                            key: 'ND',
                            filter: 'N/D',
                            label: 'N/D',
                            count: 0,
                            toneClass: 'is-nd'
                        },
                        {
                            key: '__CANCELLED__',
                            filter: App.table.getCancelledStatusFilterValue(),
                            label: 'Cancelado / Anulado',
                            count: 0,
                            toneClass: 'is-cancelled'
                        },
                        {
                            key: 'PENDIENTE',
                            filter: 'Pendiente',
                            label: 'Pendiente',
                            count: 0,
                            toneClass: 'is-progress'
                        },
                        {
                            key: 'ENPROCESO',
                            filter: 'En proceso',
                            label: 'En proceso',
                            count: 0,
                            toneClass: 'is-progress'
                        }
                    ];

                    defaultStatusItems.forEach(item => {
                        if (!summary.has(item.key)) {
                            summary.set(item.key, { ...item });
                        }
                    });

                    const statusItems = Array.from(summary.values())
                        .filter(item => item.count > 0)
                        .sort((a, b) => {
                            const priorityA = preferredOrder.get(a.key) ?? 50;
                            const priorityB = preferredOrder.get(b.key) ?? 50;
                            if (priorityA !== priorityB) {
                                return priorityA - priorityB;
                            }

                            return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
                        });

                    return [
                        {
                            key: '__TOTAL__',
                            filter: '',
                            label: 'Todos',
                            count: totalsByType.flexTotal + totalsByType.colectaTotal,
                            detail: `Flex ${totalsByType.flexTotal} / Colecta ${totalsByType.colectaTotal}`,
                            toneClass: 'is-total'
                        },
                        ...statusItems
                    ];
                },

                renderStatusSummary(rows = App.state.currentResultRows) {
                    const list = App.dom.statusSummaryList;
                    if (!list) {
                        return;
                    }

                    const items = App.table.getStatusSummaryItems(rows);
                    const activeStatusFilter = App.table.getActiveStatusFilter();
                    const activeTypeFilter = App.table.normalizeRowTypeFilter(App.state.activeRowTypeFilter);

                    list.innerHTML = items.map(item => {
                        const isSelected = item.filter
                            ? App.helpers.normalizeComparable(item.filter) === activeStatusFilter
                            : !activeStatusFilter && activeTypeFilter === 'all';
                        const disabledAttribute = item.count === 0 && item.key !== '__TOTAL__' ? ' disabled' : '';
                        const classes = [
                            'status-summary-option',
                            item.toneClass,
                            item.count === 0 && item.key !== '__TOTAL__' ? 'is-empty' : '',
                            isSelected ? 'is-selected' : ''
                        ].filter(Boolean).join(' ');
                        const icon = App.table.getStatusSummaryIcon(item);
                        const detailMarkup = item.detail
                            ? `<small>${App.helpers.escapeHtml(item.detail)}</small>`
                            : '';

                        return `
                            <button class="${App.helpers.escapeHtml(classes)}" type="button" data-status-summary-filter="${App.helpers.escapeHtml(item.filter)}" title="Mostrar pedidos: ${App.helpers.escapeHtml(item.label)}"${disabledAttribute}>
                                <span class="status-summary-icon" aria-hidden="true">${App.helpers.escapeHtml(icon)}</span>
                                <span class="status-summary-copy"><span>${App.helpers.escapeHtml(item.label)}</span><strong>${App.helpers.escapeHtml(item.count)}</strong>${detailMarkup}</span>
                            </button>
                        `;
                    }).join('');
                },

                rowMatchesStatusFilter(row, filter = App.table.getActiveStatusFilter()) {
                    const normalizedFilter = App.helpers.normalizeComparable(filter);
                    if (!normalizedFilter) {
                        return true;
                    }

                    const status = App.table.getOrderStatusForRow(row);
                    if (normalizedFilter === App.table.getCancelledStatusFilterValue()) {
                        return App.table.isCancelledStatus(status);
                    }

                    if (App.table.isNdStatus(normalizedFilter)) {
                        return App.table.isNdStatus(status);
                    }

                    return App.helpers.normalizeComparable(status) === normalizedFilter;
                },

                updateStatusFilterOptions(rows = App.table.getRowsForActiveTypeFilter(App.state.currentResultRows)) {
                    const filterSelect = App.dom.mainStatusFilter;
                    if (!filterSelect) {
                        return;
                    }

                    const previousValue = App.table.getActiveStatusFilter();
                    const cancelledFilterValue = App.table.getCancelledStatusFilterValue();
                    const hasCancelledRows = rows.some(row => App.table.isCancelledStatus(App.table.getOrderStatusForRow(row)));
                    const states = Array.from(new Set(
                        rows
                            .map(row => App.helpers.normalizeComparable(App.table.getOrderStatusForRow(row)))
                            .filter(Boolean)
                    )).sort((a, b) => {
                        if (a === 'N/D') return 1;
                        if (b === 'N/D') return -1;
                        return a.localeCompare(b, 'es', { sensitivity: 'base' });
                    });

                    filterSelect.innerHTML = `
                        <option value="">Estado</option>
                        ${hasCancelledRows ? `<option value="${cancelledFilterValue}">Cancelados / anulados</option>` : ''}
                        ${states.map(state => `<option value="${App.helpers.escapeHtml(state)}">${App.helpers.escapeHtml(state)}</option>`).join('')}
                    `;

                    const nextValue = previousValue === cancelledFilterValue && hasCancelledRows
                        ? previousValue
                        : states.includes(previousValue)
                            ? previousValue
                            : '';
                    App.state.activeStatusFilter = nextValue;
                    filterSelect.value = nextValue;

                    if (App.dom.orderLookupStateFilter) {
                        const hasOption = Array.from(App.dom.orderLookupStateFilter.options)
                            .some(option => App.helpers.normalizeComparable(option.value) === nextValue);
                        App.dom.orderLookupStateFilter.value = hasOption ? nextValue : '';
                    }
                },

                getRowsForActiveStatusFilter(rows = []) {
                    const filter = App.table.getActiveStatusFilter();
                    if (!filter) {
                        return rows;
                    }

                    return rows.filter(row => App.table.rowMatchesStatusFilter(row, filter));
                },

                setStatusFilter(nextStatus) {
                    const normalizedStatus = App.helpers.normalizeComparable(nextStatus);
                    App.state.activeStatusFilter = normalizedStatus;

                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = normalizedStatus;
                    }

                    if (App.dom.orderLookupStateFilter) {
                        const hasOption = Array.from(App.dom.orderLookupStateFilter.options)
                            .some(option => App.helpers.normalizeComparable(option.value) === normalizedStatus);
                        App.dom.orderLookupStateFilter.value = hasOption ? normalizedStatus : '';
                    }

                    App.table.renderCurrentResults();

                    if (App.state.orderLookupRows.length > 0) {
                        App.orderLookup.applyFilters({ showWarningOnEmptySource: false });
                    }
                },

                setStatusSummaryFilter(nextStatus) {
                    App.state.activeRowTypeFilter = 'all';
                    App.table.setStatusFilter(nextStatus);
                },

                setStatStatusFilter(rowType, statusFilter) {
                    if (App.state.currentResultRows.length === 0 && !App.state.currentResultMessage) {
                        return;
                    }

                    const normalizedType = App.table.normalizeRowTypeFilter(rowType);
                    const normalizedStatusFilter = statusFilter === 'cancelled'
                        ? App.table.getCancelledStatusFilterValue()
                        : statusFilter === 'nd'
                            ? 'N/D'
                            : App.helpers.normalizeComparable(statusFilter);

                    App.state.activeRowTypeFilter = normalizedType;
                    App.state.activeStatusFilter = normalizedStatusFilter;

                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = normalizedStatusFilter;
                    }

                    if (App.dom.orderLookupStateFilter) {
                        const hasOption = Array.from(App.dom.orderLookupStateFilter.options)
                            .some(option => App.helpers.normalizeComparable(option.value) === normalizedStatusFilter);
                        App.dom.orderLookupStateFilter.value = hasOption ? normalizedStatusFilter : '';
                    }

                    App.table.renderCurrentResults();

                    if (App.state.orderLookupRows.length > 0) {
                        App.orderLookup.applyFilters({ showWarningOnEmptySource: false });
                    }
                },

                refreshStatusColumn() {
                    if (App.state.currentResultRows.length === 0) {
                        App.table.updateStatusFilterOptions([]);
                        return;
                    }

                    App.table.renderCurrentResults();
                },

                countRowsByType(rows = App.state.currentResultRows) {
                    return rows.reduce((counts, row) => {
                        const status = App.table.getOrderStatusForRow(row);
                        const isNd = App.table.isNdStatus(status);
                        const isCancelled = App.table.isCancelledStatus(status);
                        const hasValidState = !isNd && !isCancelled;

                        if (row.type === 'flex') {
                            counts.flexTotal += 1;
                            if (hasValidState) {
                                counts.flex += 1;
                            }
                            if (isNd) {
                                counts.flexNd += 1;
                            }
                            if (isCancelled) {
                                counts.flexCancelled += 1;
                            }
                        } else if (row.type === 'colecta') {
                            counts.colectaTotal += 1;
                            if (hasValidState) {
                                counts.colecta += 1;
                            }
                            if (isNd) {
                                counts.colectaNd += 1;
                            }
                            if (isCancelled) {
                                counts.colectaCancelled += 1;
                            }
                        }

                        if (isNd) {
                            counts.totalNd += 1;
                        }
                        if (isCancelled) {
                            counts.totalCancelled += 1;
                        }
                        if (hasValidState) {
                            counts.totalWithState += 1;
                        }
                        counts.total += 1;
                        return counts;
                    }, {
                        flex: 0,
                        colecta: 0,
                        total: 0,
                        flexTotal: 0,
                        colectaTotal: 0,
                        totalWithState: 0,
                        flexNd: 0,
                        flexCancelled: 0,
                        colectaNd: 0,
                        colectaCancelled: 0,
                        totalNd: 0,
                        totalCancelled: 0
                    });
                },

                getRowsForActiveTypeFilter(rows = App.state.currentResultRows) {
                    const filter = App.table.normalizeRowTypeFilter(App.state.activeRowTypeFilter);
                    if (filter === 'all') {
                        return rows;
                    }

                    return rows.filter(row => row.type === filter);
                },

                buildResultsMetaMessage(metaMessage, sourceRows, visibleRows, typeRows = sourceRows) {
                    const typeFilter = App.table.normalizeRowTypeFilter(App.state.activeRowTypeFilter);
                    const statusFilter = App.table.getActiveStatusFilter();
                    const statusFilterLabel = App.table.getStatusFilterLabel(statusFilter);
                    const filterMessages = [];

                    if (typeFilter !== 'all' && sourceRows.length > 0) {
                        filterMessages.push(`${App.table.getRowTypeFilterLabel(typeFilter)} (${typeRows.length} de ${sourceRows.length})`);
                    }

                    if (statusFilter && typeRows.length > 0) {
                        filterMessages.push(`Estado ${statusFilterLabel} (${visibleRows.length} de ${typeRows.length})`);
                    }

                    if (filterMessages.length === 0) {
                        return metaMessage;
                    }

                    const filterMessage = `Filtro activo: ${filterMessages.join(' · ')}.`;
                    return metaMessage ? `${metaMessage} ${filterMessage}` : filterMessage;
                },

                updateTypeFilterButtons(counts = App.table.countRowsByType()) {
                    const filter = App.table.normalizeRowTypeFilter(App.state.activeRowTypeFilter);
                    const activeStatusFilter = App.table.getActiveStatusFilter();
                    const setText = (node, value) => {
                        if (node) {
                            node.textContent = String(value || 0);
                        }
                    };
                    const buttonDefinitions = [
                        { button: App.dom.flexStatBtn, filter: 'flex', count: counts.flex },
                        { button: App.dom.colectaStatBtn, filter: 'colecta', count: counts.colecta },
                        { button: App.dom.totalStatBtn, filter: 'all', count: counts.total }
                    ];

                    setText(App.dom.countFlexNd, counts.flexNd);
                    setText(App.dom.countFlexCancelled, counts.flexCancelled);
                    setText(App.dom.countColectaNd, counts.colectaNd);
                    setText(App.dom.countColectaCancelled, counts.colectaCancelled);
                    setText(App.dom.countFlexSubtotal, counts.flexTotal);
                    setText(App.dom.countColectaSubtotal, counts.colectaTotal);
                    setText(App.dom.countTotalFlex, counts.flexTotal);
                    setText(App.dom.countTotalColecta, counts.colectaTotal);

                    buttonDefinitions.forEach(({ button, filter: buttonFilter, count }) => {
                        if (!button) {
                            return;
                        }

                        const isActive = filter === buttonFilter;
                        const shouldDim = filter !== 'all' && buttonFilter !== filter && count > 0;

                        button.classList.toggle('is-active', isActive);
                        button.classList.toggle('is-dimmed', shouldDim);
                        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                    });

                    document.querySelectorAll('[data-stat-status-filter]').forEach(chip => {
                        const chipType = App.table.normalizeRowTypeFilter(chip.dataset.statRowType || chip.closest('[data-row-type-filter]')?.dataset.rowTypeFilter);
                        const chipStatus = chip.dataset.statStatusFilter === 'cancelled'
                            ? App.table.getCancelledStatusFilterValue()
                            : chip.dataset.statStatusFilter === 'nd'
                                ? 'N/D'
                                : App.helpers.normalizeComparable(chip.dataset.statStatusFilter);
                        chip.classList.toggle('is-active', filter === chipType && activeStatusFilter === chipStatus);
                    });
                },

                setRowTypeFilter(nextFilter) {
                    try {
                        if (typeof DriveSync !== 'undefined' && DriveSync?.showLabelSource) {
                            DriveSync.showLabelSource('mercadolibre');
                        }
                    } catch (error) {
                        console.warn('[App] No se pudo volver a Mercado Libre:', error);
                    }

                    if (App.state.currentResultRows.length === 0 && !App.state.currentResultMessage) {
                        return;
                    }

                    const normalizedFilter = App.table.normalizeRowTypeFilter(nextFilter);
                    App.state.activeRowTypeFilter = normalizedFilter === App.state.activeRowTypeFilter
                        ? 'all'
                        : normalizedFilter;
                    App.table.renderCurrentResults();
                },

                updateSelectionState() {
                    const rows = App.dom.tableBody.querySelectorAll('tr');

                    rows.forEach(tr => {
                        const rowId = tr.dataset.rowId;
                        const isSelected = App.state.selectedRowIds.has(rowId);
                        tr.classList.toggle('is-selected', isSelected);

                        const checkbox = tr.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            checkbox.checked = isSelected;
                        }
                    });

                    const selectedRows = App.table.getRowsSelectedForStatusAction();
                    const visibleSelectedCount = App.state.extractedRows.filter(
                        row => App.state.selectedRowIds.has(row.viewId)
                    ).length;
                    if (App.dom.cancelOrderBtn) {
                        App.dom.cancelOrderBtn.disabled = selectedRows.length === 0;
                    }

                    if (selectedRows.length === 0) {
                        App.dom.selectedInfo.textContent = App.defaults.selectionMessage;
                        App.dom.printZebraBtn.disabled = App.state.extractedRows.length === 0;
                        return;
                    }

                    if (selectedRows.length === 1) {
                        const selectedRow = selectedRows[0];
                        App.dom.selectedInfo.textContent = visibleSelectedCount === 0
                            ? `1 bulto seleccionado: ${selectedRow.numero} (fuera del filtro actual).`
                            : `1 bulto seleccionado: ${selectedRow.numero}`;
                        App.dom.printZebraBtn.disabled = false;
                        return;
                    }

                    const hiddenSelectedCount = selectedRows.length - visibleSelectedCount;
                    App.dom.selectedInfo.textContent = hiddenSelectedCount > 0
                        ? `${selectedRows.length} bultos seleccionados (${hiddenSelectedCount} fuera del filtro actual).`
                        : `${selectedRows.length} bultos seleccionados para impresion.`;
                    App.dom.printZebraBtn.disabled = false;
                },

                toggleRowSelection(row, forceSelected) {
                    if (!row || !row.viewId) {
                        return;
                    }

                    const shouldSelect = typeof forceSelected === 'boolean'
                        ? forceSelected
                        : !App.state.selectedRowIds.has(row.viewId);

                    if (shouldSelect) {
                        App.state.selectedRowIds.add(row.viewId);
                        App.state.selectedRowsById.set(row.viewId, row);
                    } else {
                        App.state.selectedRowIds.delete(row.viewId);
                        App.state.selectedRowsById.delete(row.viewId);
                    }

                    App.table.updateSelectionState();
                },

                markSelectedRowsAsCancelled() {
                    const selectedRows = App.table.getRowsSelectedForStatusAction();
                    if (selectedRows.length === 0) {
                        App.ui.showMessage(
                            'Selecciona uno o mas pedidos para marcarlos como cancelados.',
                            'warning',
                            { title: 'Pedido cancelado' }
                        );
                        return;
                    }

                    const nextStatuses = { ...App.state.manualOrderStatuses };
                    const updatedAt = new Date().toISOString();
                    const processedOrders = new Set();
                    let cancelledCount = 0;
                    let restoredCount = 0;

                    selectedRows.forEach(row => {
                        const orderNumber = App.helpers.normalizeComparable(row?.numero);
                        if (!orderNumber || processedOrders.has(orderNumber)) {
                            return;
                        }
                        processedOrders.add(orderNumber);

                        const currentStatus = App.table.getOrderStatusForRow(row);
                        if (App.table.isCancelledStatus(currentStatus)) {
                            const originalStatus = App.table.getOrderStatusForRow(row, { ignoreManual: true });
                            if (App.table.isCancelledStatus(originalStatus)) {
                                nextStatuses[orderNumber] = {
                                    status: 'N/D',
                                    updatedAt
                                };
                            } else {
                                delete nextStatuses[orderNumber];
                            }
                            restoredCount += 1;
                        } else {
                            nextStatuses[orderNumber] = {
                                status: 'PEDIDO CANCELADO',
                                updatedAt
                            };
                            cancelledCount += 1;
                        }
                    });

                    if (cancelledCount === 0 && restoredCount === 0) {
                        App.ui.showMessage(
                            'No se encontraron numeros validos para actualizar.',
                            'warning',
                            { title: 'Pedido cancelado' }
                        );
                        return;
                    }

                    if (!App.storage.persistManualOrderStatuses(nextStatuses)) {
                        return;
                    }

                    App.table.renderCurrentResults();
                    if (App.state.orderLookupRows.length > 0) {
                        App.orderLookup.applyFilters({ showWarningOnEmptySource: false });
                    }

                    const parts = [];
                    if (cancelledCount > 0) {
                        parts.push(`${cancelledCount} pedido(s) marcado(s) como PEDIDO CANCELADO`);
                    }
                    if (restoredCount > 0) {
                        parts.push(`${restoredCount} pedido(s) restaurado(s)`);
                    }

                    App.ui.showMessage(`${parts.join(' y ')}.`, 'success', { title: 'Pedido cancelado' });
                },

                renderResults(rows, metaMessage) {
                    App.state.currentResultRows = Array.isArray(rows) ? [...rows] : [];
                    App.state.currentResultMessage = metaMessage || '';
                    App.table.renderCurrentResults();
                },

                renderCurrentResults() {
                    const sourceRows = App.state.currentResultRows.map((row, index) => ({
                        ...row,
                        viewId: row.viewId || `view-${index}-${row.numero}`
                    }));
                    const counts = App.table.countRowsByType(sourceRows);
                    const typeRows = App.table.getRowsForActiveTypeFilter(sourceRows);
                    App.table.updateStatusFilterOptions(typeRows);
                    App.table.renderStatusSummary(sourceRows);
                    const visibleRows = App.table.getRowsForActiveStatusFilter(typeRows);
                    const activeFilter = App.table.normalizeRowTypeFilter(App.state.activeRowTypeFilter);
                    const hasActiveTypeFilter = activeFilter !== 'all';
                    const activeStatusFilter = App.table.getActiveStatusFilter();
                    const activeStatusFilterLabel = App.table.getStatusFilterLabel(activeStatusFilter);
                    const hasActiveStatusFilter = activeStatusFilter !== '';

                    App.state.extractedRows = visibleRows;
                    App.state.rawZplData = App.table.buildRawZplFromRows(App.state.extractedRows);
                    App.dom.tableBody.innerHTML = '';

                    App.state.extractedRows.forEach(row => {
                        if (App.state.selectedRowIds.has(row.viewId)) {
                            App.state.selectedRowsById.set(row.viewId, row);
                        }
                    });

                    App.state.extractedRows.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.dataset.rowId = row.viewId;
                        const selectorId = `row-selector-${App.helpers.escapeHtml(row.viewId)}`;
                        tr.innerHTML = `
                            <td><input class="row-selector" id="${selectorId}" name="rowSelector" type="checkbox" aria-label="Seleccionar ${App.helpers.escapeHtml(row.numero)}"></td>
                            <td>${App.helpers.escapeHtml(row.proceso)}</td>
                            <td><strong>${App.helpers.escapeHtml(row.numero)}</strong></td>
                            <td>${App.helpers.escapeHtml(row.picker)}</td>
                            <td>${App.helpers.escapeHtml(row.picking)}</td>
                            <td><span style="color: ${row.type === 'flex' ? 'var(--primary)' : 'var(--success)'}">${App.helpers.escapeHtml(row.revision)}</span></td>
                            <td>
                                <div class="meta-cell">
                                    <strong>${App.helpers.escapeHtml(row.storedLabel || 'Carga actual')}</strong>
                                    <span>${App.helpers.escapeHtml(row.sourceName || 'Documento actual')}</span>
                                </div>
                            </td>
                            <td>${App.table.getOrderStatusMarkup(row)}</td>
                        `;

                        tr.addEventListener('click', () => {
                            App.table.toggleRowSelection(row);
                        });

                        const checkbox = tr.querySelector('input[type="checkbox"]');
                        checkbox.addEventListener('click', event => {
                            event.stopPropagation();
                            App.table.toggleRowSelection(row, checkbox.checked);
                        });

                        App.dom.tableBody.appendChild(tr);
                    });

                    App.dom.countFlex.textContent = String(counts.flex);
                    App.dom.countColecta.textContent = String(counts.colecta);
                    App.dom.countTotal.textContent = String(counts.total);
                    App.table.updateTypeFilterButtons(counts);

                    App.ui.setResultsVisible(true);
                    App.ui.setClearButtonVisible(true);
                    App.ui.updateResultsMeta(
                        App.table.buildResultsMetaMessage(
                            App.state.currentResultMessage,
                            sourceRows,
                            App.state.extractedRows,
                            typeRows
                        )
                    );

                    if (App.state.extractedRows.length === 0) {
                        App.table.resetActionButtons(true);
                        App.table.updateSelectionState();
                        if (App.state.selectedRowsById.size === 0) {
                            App.dom.selectedInfo.textContent = hasActiveTypeFilter && hasActiveStatusFilter
                                ? `No se encontraron bultos ${App.table.getRowTypeFilterLabel(activeFilter)} con estado ${activeStatusFilterLabel}.`
                                : hasActiveStatusFilter
                                    ? `No se encontraron pedidos con estado ${activeStatusFilterLabel}.`
                                    : hasActiveTypeFilter
                                        ? `No se encontraron bultos ${App.table.getRowTypeFilterLabel(activeFilter)} para mostrar.`
                                        : 'No se encontraron numeros para mostrar.';
                        }
                        return;
                    }

                    App.dom.downloadBtn.disabled = false;
                    App.dom.printZebraBtn.disabled = false;
                    App.dom.downloadBtn.innerHTML = App.table.getDownloadButtonMarkup();
                    App.table.updateSelectionState();
                },

                resetWorkspaceView(resetInputs) {
                    App.state.activeBaseRows = [];
                    App.state.activeBaseMessage = '';
                    App.state.currentResultRows = [];
                    App.state.currentResultMessage = '';
                    App.state.activeRowTypeFilter = 'all';
                    App.state.activeStatusFilter = '';
                    App.state.selectedHistoryDocumentIds = new Set();
                    App.state.extractedRows = [];
                    App.state.rawZplData = '';
                    App.table.clearSelectedRows();
                    App.dom.tableBody.innerHTML = '';
                    App.dom.countFlex.textContent = '0';
                    App.dom.countColecta.textContent = '0';
                    App.dom.countTotal.textContent = '0';
                    App.table.updateTypeFilterButtons({ flex: 0, colecta: 0, total: 0 });
                    App.table.renderStatusSummary([]);
                    App.table.updateStatusFilterOptions([]);
                    App.ui.setResultsVisible(false);
                    App.ui.setClearButtonVisible(false);
                    App.dom.searchInput.value = '';
                    if (App.dom.mainStatusFilter) {
                        App.dom.mainStatusFilter.value = '';
                    }
                    App.dom.selectedInfo.textContent = App.defaults.selectionMessage;
                    App.ui.updateResultsMeta(App.defaults.emptyResultsMessage);
                    App.table.resetActionButtons();

                    if (resetInputs) {
                        App.dom.fileInput.value = '';
                        App.dom.textInput.value = '';
                        App.dom.pickerInput.value = '';
                    }

                    App.storage.updateStorageUI();
                    App.orderLookup.syncReferenceScopeDebounced();
                },

                getDownloadButtonMarkup() {
                    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Descargar CSV';
                },

                resetActionButtons(emptyState = false) {
                    App.dom.downloadBtn.disabled = true;
                    App.dom.printZebraBtn.disabled = App.state.extractedRows.length === 0 && App.state.selectedRowsById.size === 0;
                    if (App.dom.cancelOrderBtn) {
                        App.dom.cancelOrderBtn.disabled = App.state.selectedRowsById.size === 0;
                    }
                    App.dom.downloadBtn.innerHTML = emptyState
                        ? 'No se encontraron numeros'
                        : App.table.getDownloadButtonMarkup();
                },

                formatCsvCell(value) {
                    let text = String(value ?? '').replace(/\0/g, '');
                    if (/^\s*[=+\-@]/.test(text)) {
                        text = `'${text}`;
                    }
                    return /[;"\r\n]/.test(text)
                        ? `"${text.replace(/"/g, '""')}"`
                        : text;
                },

                buildCsvContent(data) {
                    const headers = ['Proceso', 'NUMERO', 'PICKER', 'PICKING', 'REVISION'];
                    const rows = data.map(row => [
                        row.proceso,
                        row.numero,
                        row.picker,
                        row.picking,
                        row.revision
                    ].map(App.table.formatCsvCell).join(';'));

                    return [headers.join(';'), ...rows].join('\r\n') + '\r\n';
                },

                downloadCSV(data, filename) {
                    if (data.length === 0) {
                        return;
                    }

                    const csvContent = App.table.buildCsvContent(data);

                    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                },

                getFlexColectaRows(rows) {
                    return Array.isArray(rows)
                        ? rows.filter(row => row?.type === 'flex' || row?.type === 'colecta')
                        : [];
                },

                downloadFlexColectaCsv(rows) {
                    const outputRows = App.table.getFlexColectaRows(rows);
                    const flexData = outputRows.filter(row => row.type === 'flex');
                    const colectaData = outputRows.filter(row => row.type === 'colecta');

                    if (flexData.length > 0) {
                        App.table.downloadCSV(flexData, '1 f.csv');
                    }

                    if (colectaData.length > 0) {
                        window.setTimeout(() => {
                            App.table.downloadCSV(colectaData, '1 c.csv');
                        }, flexData.length > 0 ? 300 : 0);
                    }

                    return {
                        flex: flexData.length,
                        colecta: colectaData.length,
                        total: outputRows.length
                    };
                },

                async printRowsToZebra(rows, options = {}) {
                    const outputRows = App.table.getFlexColectaRows(rows);
                    const zplToPrint = App.table.buildPrintableZplFromRows(outputRows);

                    if (!zplToPrint) {
                        return { ok: false, printed: 0, skipped: true };
                    }

                    const printerConfig = App.actions.getSelectedZebraPrinterConfig();
                    const printer = await App.actions.resolveZebraPrinter(printerConfig);

                    if (!printer || typeof printer !== 'object' || !printer.uid) {
                        throw new Error(
                            'No se encontro ninguna impresora Zebra disponible.\nAsegurate de que este encendida, con papel y conectada por cable o red.'
                        );
                    }

                    const resWrite = await fetch(`${App.config.ZEBRA_BROWSER_PRINT_BASE_URL}/write`, {
                        method: 'POST',
                        body: JSON.stringify({
                            device: printer,
                            data: zplToPrint
                        })
                    });

                    if (!resWrite.ok) {
                        let errText = 'Error desconocido';
                        try {
                            errText = await resWrite.text();
                        } catch (error) {
                            errText = 'Error desconocido';
                        }

                        throw new Error(
                            `Se encontro la impresora, pero fallo la transmision del texto hacia ella.\nDetalle: ${resWrite.status} ${errText}`
                        );
                    }

                    if (options.showSuccess !== false) {
                        App.ui.showMessage(
                            options.successMessage || 'Las etiquetas fueron enviadas a la impresora Zebra exitosamente.',
                            'success',
                            { title: options.title || 'Impresion Zebra' }
                        );
                    }

                    return {
                        ok: true,
                        printed: outputRows.length,
                        printer: printerConfig.label
                    };
                },

                async handleAutomaticDriveOutput(rows, options = {}) {
                    const outputRows = App.table.getFlexColectaRows(rows);
                    if (outputRows.length === 0) {
                        return { downloaded: 0, printed: 0, skipped: true };
                    }

                    const counts = App.table.downloadFlexColectaCsv(outputRows);

                    try {
                        const printResult = await App.table.printRowsToZebra(outputRows, {
                            showSuccess: false
                        });

                        App.ui.showMessage(
                            `Descargado CSV y enviado a ${printResult.printer}: Flex ${counts.flex}, Colecta ${counts.colecta}.`,
                            'success',
                            { title: 'Automatico Drive', timeout: 9000 }
                        );

                        return {
                            downloaded: counts.total,
                            printed: printResult.printed,
                            counts
                        };
                    } catch (error) {
                        App.ui.reportError(
                            error,
                            'Se descargaron los CSV Flex/Colecta, pero no fue posible imprimir automaticamente en Zebra.',
                            'Automatico Drive'
                        );

                        return {
                            downloaded: counts.total,
                            printed: 0,
                            counts,
                            error
                        };
                    }
                },

                handleSearch() {
                    const query = App.dom.searchInput.value.trim().toLowerCase();

                    if (!query) {
                        if (App.state.activeBaseRows.length === 0) {
                            if (App.state.selectedRowsById.size > 0) {
                                App.table.renderResults(
                                    [],
                                    'La seleccion actual se conserva. Realiza otra busqueda para seguir agregando bultos.'
                                );
                                return;
                            }

                            App.table.resetWorkspaceView(false);
                            return;
                        }

                        App.table.renderResults(
                            App.state.activeBaseRows,
                            App.state.activeBaseMessage || 'Mostrando la ultima carga procesada.'
                        );
                        return;
                    }

                    const matchedRows = App.table.getSearchableRows().filter(
                        row => row.numero.toLowerCase().includes(query)
                    );

                    if (matchedRows.length === 0) {
                        App.table.renderResults(
                            [],
                            `No se encontraron coincidencias guardadas para "${App.dom.searchInput.value.trim()}".`
                        );
                        return;
                    }

                    const documentCount = new Set(matchedRows.map(row => row.documentId)).size;
                    App.table.renderResults(
                        matchedRows,
                        `Mostrando ${matchedRows.length} coincidencia(s) encontradas en ${documentCount} documento(s) guardado(s).`
                    );
                },

                showStoredDocuments() {
                    if (App.state.storedDocuments.length === 0) {
                        App.ui.showMessage('Todavia no hay documentos guardados para mostrar.', 'info', { title: 'Historial' });
                        return;
                    }

                    App.table.setActiveBaseFromDocuments(
                        App.state.storedDocuments,
                        `Mostrando ${App.state.storedDocuments.length} documento(s) guardado(s) en el historial local.`
                    );
                },

                handleShowStoredAction() {
                    App.table.showStoredDocuments();
                }
            },
            actions: {
                preventDefaults(event) {
                    event.preventDefault();
                    event.stopPropagation();
                },

                validateProcessingReady(actionLabel) {
                    if (!App.runtime.storage) {
                        App.ui.showMessage(
                            'No fue posible habilitar el historial local del navegador. Sin ese historial no se puede guardar ni buscar documentos previos.',
                            'error',
                            { title: 'Historial' }
                        );
                        return false;
                    }

                    if (!App.dom.pickerInput.value.trim()) {
                        App.ui.showMessage(
                            `Por favor, selecciona un usuario antes de ${actionLabel}.`,
                            'warning',
                            { title: 'Usuario' }
                        );
                        App.dom.pickerInput.focus();
                        return false;
                    }

                    return true;
                },

                appendDocumentsToHistory(documents) {
                    const nextDocuments = [...documents, ...App.state.storedDocuments].sort(
                        (a, b) => new Date(b.storedAt) - new Date(a.storedAt)
                    );

                    return App.storage.persistStoredDocuments(nextDocuments);
                },

                restoreStoredDocumentsOnOpen() {
                    if (App.state.storedDocuments.length === 0) {
                        return;
                    }

                    App.table.setActiveBaseFromDocuments(
                        App.state.storedDocuments,
                        `Historial recuperado automaticamente al abrir el archivo (${App.state.storedDocuments.length} documento(s) disponibles).`
                    );
                },

                async handleDrop(event) {
                    const dataTransfer = event.dataTransfer;
                    if (!dataTransfer) {
                        return;
                    }

                    await App.actions.handleFiles(dataTransfer.files);
                },

                async handlePastedText() {
                    if (!App.actions.validateProcessingReady('procesar el texto')) {
                        return;
                    }

                    const text = App.dom.textInput.value.trim();
                    if (!text) {
                        App.ui.showMessage('Por favor, pega el contenido del archivo en el area de texto.', 'warning', { title: 'Texto' });
                        App.dom.textInput.focus();
                        return;
                    }

                    const picker = App.dom.pickerInput.value.trim();
                    const shouldPersist = App.storage.canStoreNow();
                    const documentRecord = App.parser.createDocumentRecord({
                        picker,
                        sourceName: `Texto pegado ${App.storage.formatDateTime(new Date())}`,
                        sourceType: 'text',
                        text
                    });

                    if (!documentRecord) {
                        App.ui.showMessage('No se encontraron numeros validos dentro del texto pegado.', 'warning', { title: 'Texto' });
                        return;
                    }

                    if (shouldPersist && !App.actions.appendDocumentsToHistory([documentRecord])) {
                        return;
                    }

                    App.dom.fileInput.value = '';
                    App.dom.textInput.value = '';
                    App.table.setActiveBaseFromDocuments(
                        [documentRecord],
                        shouldPersist
                            ? `Mostrando 1 documento recien guardado (${documentRecord.rows.length} numero(s)).`
                            : `Mostrando 1 documento procesado (${documentRecord.rows.length} numero(s)). Fuera del horario de historial, por eso no se guardo.`
                    );
                },

                async handleFiles(files) {
                    if (!App.actions.validateProcessingReady('cargar archivos')) {
                        App.dom.fileInput.value = '';
                        return { ok: false, documents: [], reason: 'not-ready' };
                    }

                    const txtFiles = Array.from(files || []).filter(
                        file => file.name.toLowerCase().endsWith('.txt')
                    );

                    if (txtFiles.length === 0) {
                        App.ui.showMessage('Solo se admiten archivos .txt de MercadoLibre.', 'warning', { title: 'Archivos' });
                        App.dom.fileInput.value = '';
                        return { ok: false, documents: [], reason: 'invalid-type' };
                    }

                    const picker = App.dom.pickerInput.value.trim();
                    const shouldPersist = App.storage.canStoreNow();
                    const newDocuments = [];
                    const knownFingerprints = new Set(
                        App.state.storedDocuments
                            .map(documentItem => App.parser.getDocumentFingerprint(documentItem))
                            .filter(Boolean)
                    );
                    const duplicateFiles = [];

                    for (const file of txtFiles) {
                        const text = await App.parser.readFileAsText(file);
                        const documentRecord = App.parser.createDocumentRecord({
                            picker,
                            sourceName: file.name,
                            sourceType: 'file',
                            text
                        });

                        if (!documentRecord) {
                            App.ui.showMessage(
                                `No se encontraron numeros validos en el archivo "${file.name}".`,
                                'warning',
                                { title: 'Archivos' }
                            );
                            App.dom.fileInput.value = '';
                            return { ok: false, documents: [], reason: 'empty-file', fileName: file.name };
                        }

                        if (documentRecord.fingerprint && knownFingerprints.has(documentRecord.fingerprint)) {
                            duplicateFiles.push(file.name);
                            continue;
                        }

                        if (documentRecord.fingerprint) {
                            knownFingerprints.add(documentRecord.fingerprint);
                        }

                        newDocuments.push(documentRecord);
                    }

                    if (newDocuments.length === 0) {
                        if (duplicateFiles.length > 0) {
                            App.ui.showMessage(
                                App.parser.buildDuplicateFilesMessage(duplicateFiles),
                                'warning',
                                { title: 'Archivos duplicados', timeout: 9000 }
                            );
                        }

                        App.dom.fileInput.value = '';
                        return { ok: false, documents: [], duplicateFiles, reason: 'duplicate' };
                    }

                    if (shouldPersist && !App.actions.appendDocumentsToHistory(newDocuments)) {
                        App.dom.fileInput.value = '';
                        return { ok: false, documents: newDocuments, duplicateFiles, reason: 'persist-failed' };
                    }

                    App.dom.textInput.value = '';
                    App.dom.fileInput.value = '';

                    const duplicateMessage = duplicateFiles.length > 0
                        ? ` Se omitieron ${duplicateFiles.length} archivo(s) ya guardado(s).`
                        : '';

                    App.table.setActiveBaseFromDocuments(
                        newDocuments,
                        shouldPersist
                            ? `Mostrando ${newDocuments.length} documento(s) recien guardado(s) con ${newDocuments.reduce((sum, documentItem) => sum + documentItem.rows.length, 0)} numero(s).${duplicateMessage}`
                            : `Mostrando ${newDocuments.length} documento(s) procesado(s) con ${newDocuments.reduce((sum, documentItem) => sum + documentItem.rows.length, 0)} numero(s). Fuera del horario de historial, por eso no se guardaron.${duplicateMessage}`
                    );

                    if (duplicateFiles.length > 0) {
                        App.ui.showMessage(
                            App.parser.buildDuplicateFilesMessage(duplicateFiles),
                            'warning',
                            { title: 'Archivos duplicados', timeout: 9000 }
                        );
                    }

                    return {
                        ok: true,
                        documents: newDocuments,
                        duplicateFiles,
                        persisted: shouldPersist
                    };
                },

                clearStoredHistory() {
                    if (!App.runtime.storage || App.state.storedDocuments.length === 0) {
                        return;
                    }

                    const btn = App.dom.clearStoredBtn;
                    if (!btn) return;

                    if (btn.dataset.confirmPending !== '1') {
                        btn.dataset.confirmPending = '1';
                        const originalText = btn.textContent;
                        btn.textContent = '¿Confirmar?';
                        btn.classList.add('is-danger');
                        btn._confirmTimer = setTimeout(() => {
                            btn.dataset.confirmPending = '';
                            btn.textContent = originalText;
                            btn.classList.remove('is-danger');
                        }, 4000);
                        return;
                    }

                    clearTimeout(btn._confirmTimer);
                    btn.dataset.confirmPending = '';
                    btn.textContent = 'Limpiar historial';
                    btn.classList.remove('is-danger');

                    if (!App.storage.persistStoredDocuments([])) {
                        return;
                    }

                    App.state.activeBaseRows = [];
                    App.state.activeBaseMessage = '';

                    if (App.dom.searchInput.value.trim()) {
                        App.table.renderResults([], 'El historial fue limpiado. No hay coincidencias para mostrar.');
                        return;
                    }

                    App.table.resetWorkspaceView(false);
                },

                async handlePortableSave() {
                    if (!App.storage.canSavePortableState()) {
                        App.ui.showMessage(
                            'No hay historial ni usuarios personalizados para guardar dentro del HTML portable.',
                            'info',
                            { title: 'Portable' }
                        );
                        return;
                    }

                    App.storage.writeEmbeddedState({
                        documents: App.state.storedDocuments,
                        users: App.state.pickerOptions,
                        manualStatuses: App.state.manualOrderStatuses
                    });

                    const portableHtml = App.storage.buildPortableHtml();
                    const timestamp = new Date();
                    const filename = `${App.config.PORTABLE_FILENAME_PREFIX}-${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}-${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}.html`;

                    if (window.showSaveFilePicker) {
                        try {
                            const fileHandle = await window.showSaveFilePicker({
                                suggestedName: filename,
                                types: [
                                    {
                                        description: 'Archivo HTML',
                                        accept: {
                                            'text/html': ['.html']
                                        }
                                    }
                                ]
                            });
                            const writable = await fileHandle.createWritable();
                            await writable.write(portableHtml);
                            await writable.close();
                            App.ui.showMessage(
                                'Se guardo una copia portable del HTML con el historial y los usuarios actuales.',
                                'success',
                                { title: 'Portable' }
                            );
                            return;
                        } catch (error) {
                            if (error && error.name === 'AbortError') {
                                return;
                            }

                            App.ui.reportError(error, 'No fue posible guardar la copia portable.', 'Portable');
                            return;
                        }
                    }

                    const blob = new Blob([portableHtml], { type: 'text/html;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    App.ui.showMessage(
                        'Se descargo una copia portable del HTML con el historial y los usuarios actuales.',
                        'success',
                        { title: 'Portable' }
                    );
                },

                handleCsvDownload() {
                    if (App.state.extractedRows.length === 0) {
                        return;
                    }

                    App.table.downloadFlexColectaCsv(App.state.extractedRows);
                },

                loadZebraPrinterPreference() {
                    if (!App.runtime.storage) {
                        return 'default';
                    }

                    try {
                        return App.helpers.normalizeZebraPrinterKey(
                            App.runtime.storage.getItem(App.config.ZEBRA_PRINTER_STORAGE_KEY)
                        );
                    } catch (error) {
                        return 'default';
                    }
                },

                persistZebraPrinterPreference(key) {
                    if (!App.runtime.storage) {
                        return;
                    }

                    try {
                        App.runtime.storage.setItem(
                            App.config.ZEBRA_PRINTER_STORAGE_KEY,
                            App.helpers.normalizeZebraPrinterKey(key)
                        );
                    } catch (error) {
                        // Ignore storage failures; printing can still continue.
                    }
                },

                getSelectedZebraPrinterConfig() {
                    const key = App.helpers.normalizeZebraPrinterKey(
                        App.dom.zebraPrinterSelect?.value || App.state.selectedZebraPrinter
                    );

                    return App.config.ZEBRA_PRINTERS[key] || App.config.ZEBRA_PRINTERS.default;
                },

                handleZebraPrinterChange() {
                    const config = App.actions.getSelectedZebraPrinterConfig();
                    App.state.selectedZebraPrinter = config.key;
                    App.actions.persistZebraPrinterPreference(config.key);

                    if (App.dom.zebraPrinterSelect) {
                        App.dom.zebraPrinterSelect.value = config.key;
                    }
                },

                getZebraDeviceSearchText(device) {
                    try {
                        return JSON.stringify(device).toLowerCase().replace(/\s+/g, ' ');
                    } catch (error) {
                        return String(device ?? '').toLowerCase().replace(/\s+/g, ' ');
                    }
                },

                getAvailableZebraPrinters(devices) {
                    if (!devices || typeof devices !== 'object') {
                        return [];
                    }

                    return Array.isArray(devices.printer)
                        ? devices.printer.filter(printer => printer && typeof printer === 'object')
                        : [];
                },

                matchesSelectedZebraPrinter(device, config) {
                    const deviceText = App.actions.getZebraDeviceSearchText(device);
                    const aliases = Array.isArray(config?.aliases) ? config.aliases : [];
                    return aliases.some(alias => deviceText.includes(String(alias).toLowerCase()));
                },

                async fetchDefaultZebraPrinter() {
                    try {
                        const resDefault = await fetch(`${App.config.ZEBRA_BROWSER_PRINT_BASE_URL}/default`);
                        if (!resDefault.ok) {
                            return null;
                        }

                        const defaultText = await resDefault.text();
                        if (!defaultText || !defaultText.includes('uid')) {
                            return null;
                        }

                        try {
                            const printer = JSON.parse(defaultText);
                            return printer && typeof printer === 'object' ? printer : null;
                        } catch (error) {
                            return null;
                        }
                    } catch (error) {
                        return null;
                    }
                },

                async fetchAvailableZebraPrinters() {
                    const resAvailable = await fetch(`${App.config.ZEBRA_BROWSER_PRINT_BASE_URL}/available`);
                    if (!resAvailable.ok) {
                        throw new Error('No se pudo conectar a Zebra Browser Print.');
                    }

                    return App.actions.getAvailableZebraPrinters(await resAvailable.json());
                },

                async resolveZebraPrinter(config = App.config.ZEBRA_PRINTERS.default) {
                    if (!config || config.key === 'default') {
                        const defaultPrinter = await App.actions.fetchDefaultZebraPrinter();
                        if (defaultPrinter) {
                            return defaultPrinter;
                        }

                        const printers = await App.actions.fetchAvailableZebraPrinters();
                        return printers[0] || null;
                    }

                    const printers = await App.actions.fetchAvailableZebraPrinters();
                    const matchedPrinter = printers.find(printer => App.actions.matchesSelectedZebraPrinter(printer, config));

                    if (matchedPrinter) {
                        return matchedPrinter;
                    }

                    throw new Error(
                        `No se encontro la impresora ${config.label} en Zebra Browser Print.\nVerifica que este agregada, encendida y conectada a la red correcta.`
                    );
                },

                async handleZebraPrint() {
                    const selectedRows = App.table.getSelectedRows();
                    const rowsToPrint = selectedRows.length > 0
                        ? selectedRows
                        : App.state.extractedRows;

                    if (App.table.getFlexColectaRows(rowsToPrint).length === 0) {
                        return;
                    }

                    const originalText = App.dom.printZebraBtn.innerHTML;
                    App.dom.printZebraBtn.innerHTML = 'Buscando Zebra...';
                    App.dom.printZebraBtn.disabled = true;

                    try {
                        const printerConfig = App.actions.getSelectedZebraPrinterConfig();
                        App.dom.printZebraBtn.innerHTML = `Enviando a ${printerConfig.label}...`;
                        await App.table.printRowsToZebra(rowsToPrint);

                        if (selectedRows.length > 0) {
                            App.table.clearSelectedRows();
                            App.table.updateSelectionState();
                        }
                    } catch (error) {
                        App.ui.reportError(
                            error,
                            'Error de impresion Zebra.\n\n1. Instala Zebra Browser Print desde la web oficial.\n2. Verifica que el icono de Zebra este activo junto al reloj de Windows.\n3. Autoriza el localhost con "Yes" la primera vez que se ejecute Desktop Print.',
                            'Impresion Zebra'
                        );
                    } finally {
                        App.dom.printZebraBtn.innerHTML = originalText;
                        App.dom.printZebraBtn.disabled = App.state.extractedRows.length === 0 && App.state.selectedRowsById.size === 0;
                    }
                },

                async handleCarrierLabelPrint(sourceKey) {
                    const sync = typeof DriveSync !== 'undefined' ? DriveSync : null;
                    const targetButton = sourceKey === 'bluexpress'
                        ? App.dom.bluexpressLabelsBtn
                        : App.dom.walmartLabelsBtn;

                    if (!sync?.printCarrierLabels) {
                        App.ui.showMessage(
                            'Conecta Drive para cargar e imprimir etiquetas PDF.',
                            'error',
                            { title: 'Etiquetas PDF' }
                        );
                        return;
                    }

                    const originalText = targetButton?.innerHTML || '';
                    if (targetButton) {
                        targetButton.disabled = true;
                        targetButton.innerHTML = 'Preparando PDF...';
                    }

                    try {
                        const result = await sync.printCarrierLabels(sourceKey);
                        if (result?.ok) {
                            App.ui.showMessage(
                                'Se abrio el visor de etiquetas PDF dentro de la app.',
                                'success',
                                { title: 'Etiquetas PDF' }
                            );
                        } else if (result?.message) {
                            App.ui.showMessage(result.message, 'error', { title: 'Etiquetas PDF' });
                        }
                    } catch (error) {
                        App.ui.reportError(
                            error,
                            'No se pudieron preparar las etiquetas PDF para imprimir.',
                            'Etiquetas PDF'
                        );
                    } finally {
                        if (targetButton) {
                            targetButton.innerHTML = originalText;
                            targetButton.disabled = false;
                        }
                    }
                },

                bindEvents() {
                    App.dom.dropzone.addEventListener('click', () => {
                        if (App.runtime.storage) {
                            App.dom.fileInput.click();
                        }
                    });

                    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                        App.dom.dropzone.addEventListener(eventName, App.actions.preventDefaults, false);
                    });

                    ['dragenter', 'dragover'].forEach(eventName => {
                        App.dom.dropzone.addEventListener(eventName, () => {
                            if (App.runtime.storage) {
                                App.dom.dropzone.classList.add('dragover');
                            }
                        }, false);
                    });

                    ['dragleave', 'drop'].forEach(eventName => {
                        App.dom.dropzone.addEventListener(eventName, () => {
                            App.dom.dropzone.classList.remove('dragover');
                        }, false);
                    });

                    App.dom.dropzone.addEventListener('drop', async event => {
                        try {
                            await App.actions.handleDrop(event);
                        } catch (error) {
                            App.ui.reportError(error, 'No fue posible procesar los archivos seleccionados.', 'Archivos');
                            App.dom.fileInput.value = '';
                        }
                    }, false);

                    App.dom.fileInput.addEventListener('change', async event => {
                        try {
                            await App.actions.handleFiles(event.target.files);
                        } catch (error) {
                            App.ui.reportError(error, 'No fue posible procesar los archivos seleccionados.', 'Archivos');
                            App.dom.fileInput.value = '';
                        }
                    }, false);

                    App.dom.manageUsersBtn.addEventListener('click', () => App.users.togglePickerManager());
                    App.dom.addPickerBtn.addEventListener('click', App.users.handleAddPicker);
                    App.dom.newPickerInput.addEventListener('keydown', event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            App.users.handleAddPicker();
                        }
                    });

                    App.dom.pickerList.addEventListener('click', event => {
                        const removeButton = event.target.closest('[data-remove-picker]');
                        if (!removeButton) {
                            return;
                        }

                        App.users.removePickerOption(removeButton.dataset.removePicker || '');
                    });

                    App.dom.historyList.addEventListener('click', event => {
                        const historyButton = event.target.closest('[data-history-document-id]');
                        if (!historyButton) {
                            return;
                        }

                        App.storage.toggleHistoryDocumentSelection(historyButton.dataset.historyDocumentId || '');
                    });

                    App.dom.searchInput.addEventListener('input', App.table.handleSearch);
                    App.dom.flexStatBtn?.addEventListener('click', () => App.table.setRowTypeFilter('flex'));
                    App.dom.colectaStatBtn?.addEventListener('click', () => App.table.setRowTypeFilter('colecta'));
                    App.dom.totalStatBtn?.addEventListener('click', () => App.table.setRowTypeFilter('all'));
                    App.dom.statusSummaryList?.addEventListener('click', event => {
                        const statusButton = event.target.closest('[data-status-summary-filter]');
                        if (!statusButton || statusButton.disabled) {
                            return;
                        }

                        App.table.setStatusSummaryFilter(statusButton.dataset.statusSummaryFilter || '');
                    });
                    document.querySelectorAll('[data-stat-status-filter]').forEach(chip => {
                        chip.addEventListener('click', event => {
                            event.preventDefault();
                            event.stopPropagation();
                            App.table.setStatStatusFilter(
                                chip.dataset.statRowType || chip.closest('[data-row-type-filter]')?.dataset.rowTypeFilter || 'all',
                                chip.dataset.statStatusFilter || ''
                            );
                        });
                    });
                    App.dom.outsideHoursToggleBtn?.addEventListener('click', App.storage.toggleOutsideHoursHistory);
                    App.dom.showStoredBtn.addEventListener('click', App.table.handleShowStoredAction);
                    App.dom.clearStoredBtn.addEventListener('click', App.actions.clearStoredHistory);
                    App.dom.cancelOrderBtn?.addEventListener('click', App.table.markSelectedRowsAsCancelled);
                    App.dom.savePortableBtn.addEventListener('click', App.actions.handlePortableSave);

                    App.storage.switchHistoryTab('historial');
                    App.dom.clearBtn.addEventListener('click', () => App.table.resetWorkspaceView(true));
                    App.dom.processTextBtn.addEventListener('click', async () => {
                        try {
                            await App.actions.handlePastedText();
                        } catch (error) {
                            App.ui.reportError(error, 'No fue posible procesar el texto pegado.', 'Texto');
                        }
                    });

                    App.dom.orderLookupLoadBtn?.addEventListener('click', () => {
                        App.dom.orderLookupFileInput?.click();
                    });

                    App.dom.downloadsWatchBtn?.addEventListener('click', () => {
                        App.downloadsWatcher.toggle();
                    });

                    App.dom.orderLookupFileInput?.addEventListener('change', async event => {
                        const file = event.target.files?.[0];
                        if (!file) {
                            return;
                        }

                        if (!file.name.toLowerCase().endsWith('.xlsx')) {
                            App.ui.showMessage('Solo se admiten archivos Excel con extension .xlsx.', 'warning', { title: 'Consulta Pedido' });
                            event.target.value = '';
                            return;
                        }

                        try {
                            await App.orderLookup.loadWorkbook(file);
                            App.downloadsWatcher.markProcessed(file);
                        } catch (error) {
                            App.ui.reportError(error, 'No fue posible cargar el archivo Excel.', 'Consulta Pedido');
                            App.orderLookup.resetData();
                            App.orderLookup.resetResults();
                        } finally {
                            event.target.value = '';
                        }
                    });

                    App.dom.orderLookupSearchBtn?.addEventListener('click', () => {
                        App.orderLookup.applyFilters();
                    });

                    App.dom.orderLookupInput?.addEventListener('keydown', event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            App.orderLookup.applyFilters();
                        }
                    });

                    App.dom.orderLookupStateFilter?.addEventListener('change', () => {
                        App.table.setStatusFilter(App.dom.orderLookupStateFilter.value);
                    });

                    App.dom.mainStatusFilter?.addEventListener('change', () => {
                        App.table.setStatusFilter(App.dom.mainStatusFilter.value);
                    });

                    App.dom.orderLookupRouteFilter?.addEventListener('change', () => {
                        // Re-poblar Estado filtrado por la ruta seleccionada
                        const selectedRoute = App.helpers.normalizeComparable(
                            App.dom.orderLookupRouteFilter.value
                        );
                        const allRows = App.orderLookup.getScopedRows();
                        const filteredRows = selectedRoute
                            ? allRows.filter(row => {
                                const route = App.helpers.normalizeComparable(
                                    row.logisticsType || App.orderLookup.resolveLogisticsType(row)
                                );
                                return route === selectedRoute;
                            })
                            : allRows;

                        // Resetear Estado a "Todos" antes de re-poblar
                        if (App.dom.orderLookupStateFilter) {
                            App.dom.orderLookupStateFilter.value = '';
                        }
                        App.orderLookup.populateStateFilter(filteredRows);

                        App.orderLookup.applyFilters({ showWarningOnEmptySource: false });
                    });

                    App.dom.orderLookupClearFiltersBtn?.addEventListener('click', () => {
                        App.orderLookup.clearFilters();
                    });

                    App.dom.downloadBtn.addEventListener('click', App.actions.handleCsvDownload);
                    App.dom.printZebraBtn.addEventListener('click', App.actions.handleZebraPrint);
                    App.dom.bluexpressLabelsBtn?.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        App.actions.handleCarrierLabelPrint('bluexpress');
                    });
                    App.dom.walmartLabelsBtn?.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        App.actions.handleCarrierLabelPrint('walmart');
                    });
                    App.dom.pdfLabelPickBtn?.addEventListener('click', () => {
                        App.dom.pdfLabelFileInput?.click();
                    });
                    App.dom.pdfLabelFileInput?.addEventListener('change', event => {
                        App.pdfLabels.handleFiles(event.target.files);
                        event.target.value = '';
                    });
                    App.dom.pdfLabelGrid?.addEventListener('click', App.pdfLabels.handleGridAction);
                    App.dom.pdfLabelClearBtn?.addEventListener('click', App.pdfLabels.clearAll);
                    App.dom.pdfLabelDialogBtn?.addEventListener('click', App.pdfLabels.printWithDialog);
                    App.dom.pdfLabelPrintBtn?.addEventListener('click', App.pdfLabels.printAllToZebra);
                    App.dom.pdfLabelWidthInput?.addEventListener('input', App.pdfLabels.render);
                    App.dom.zebraPrinterSelect?.addEventListener('change', App.actions.handleZebraPrinterChange);
                    App.dom.themeToggleBtn?.addEventListener('click', event => {
                        event.stopPropagation();
                        App.theme.toggle();
                    });
                    App.dom.notificationBellBtn?.addEventListener('click', event => {
                        event.stopPropagation();
                        App.notifications.toggle();
                    });
                    App.dom.notificationPanelCloseBtn?.addEventListener('click', () => {
                        App.notifications.setOpen(false);
                    });
                    App.dom.notificationPanelRefreshBtn?.addEventListener('click', () => {
                        App.notifications.render();
                    });
                    App.dom.notificationDriveBtn?.addEventListener('click', () => {
                        App.notifications.openDrivePanel();
                    });
                    App.dom.notificationPanel?.addEventListener('click', event => {
                        event.stopPropagation();
                    });
                    document.addEventListener('click', () => {
                        if (App.state.notificationPanelOpen) {
                            App.notifications.setOpen(false);
                        }
                    });
                    document.addEventListener('keydown', event => {
                        if (event.key === 'Escape' && App.state.notificationPanelOpen) {
                            App.notifications.setOpen(false);
                        }
                    });
                },

                startTimers() {
                    window.setInterval(() => {
                        App.storage.pruneHistoryBySchedule();
                        App.storage.updateStorageUI();
                        App.storage.updateWindowControls();
                    }, 60000);

                window.setInterval(() => {
                    App.storage.refreshStorageStatus(new Date());
                    App.systemStatus.refresh();
                    App.notifications.updateBadge();
                    if (App.state.notificationPanelOpen) {
                        App.notifications.render();
                    }
                }, 1000);
                }
            },

            init() {
                App.runtime.storage = App.storage.getBrowserStorage();
                App.theme.apply(App.theme.loadPreference());
                App.runtime.defaultPickerOptions = Array.from(App.dom.pickerInput.querySelectorAll('option'))
                    .map(option => option.value.trim())
                    .filter(Boolean);

                App.state.embeddedDocuments = App.storage.loadEmbeddedDocuments();
                App.state.outsideHoursHistoryEnabled = App.storage.loadOutsideHoursHistoryPreference();
                App.state.pickerOptions = App.users.loadPickerOptions();
                App.state.manualOrderStatuses = {
                    ...App.storage.loadEmbeddedManualOrderStatuses(),
                    ...App.storage.loadStoredManualOrderStatuses()
                };
                App.state.selectedZebraPrinter = App.actions.loadZebraPrinterPreference();
                App.state.storedDocuments = App.storage.getVisibleStoredDocuments(
                    App.storage.loadStoredDocuments(),
                    App.state.embeddedDocuments
                );

                if (App.dom.zebraPrinterSelect) {
                    App.dom.zebraPrinterSelect.value = App.state.selectedZebraPrinter;
                }

                if (App.dom.pasteTitle) {
                    App.dom.pasteTitle.textContent = 'Pegar Texto';
                }

                App.users.renderPickerOptions();
                App.users.renderPickerManager();
                App.dom.selectedInfo.textContent = App.defaults.selectionMessage;
                App.orderLookup.setLoadedFileName('');
                App.orderLookup.resetResults();

                App.storage.pruneHistoryBySchedule();
                App.ui.updateResultsMeta(App.defaults.emptyResultsMessage);
                App.storage.updateStorageUI();
                App.storage.updateWindowControls();
                App.storage.refreshStorageStatus(new Date());
                App.systemStatus.refresh();
                App.table.resetActionButtons();
                App.table.updateTypeFilterButtons({ flex: 0, colecta: 0, total: 0 });
                App.pdfLabels.render();
                App.notifications.updateBadge();
                App.actions.restoreStoredDocumentsOnOpen();
                App.orderLookup.restoreStoredState();
                App.actions.bindEvents();
                App.actions.startTimers();
            }
        };

        window.App = App;
        try {
            App.init();
        } catch (error) {
            console.error('[App] No se pudo inicializar EXTRACTOR:', error);
            App.ui?.reportError?.(error, 'No se pudo inicializar EXTRACTOR.', 'Inicio');
        }
    }

    bootstrap();
})();
