const fs = require('fs');
const path = require('path');

const root = __dirname;

function read(name) {
    return fs.readFileSync(path.join(root, name), 'utf8');
}

function escapeScript(content) {
    return content.replace(/<\/script/gi, '<\\/script');
}

function scriptTag(attributes, content) {
    return `<script ${attributes}>\n${escapeScript(content)}\n</script>`;
}

function replaceOnce(source, pattern, replacement, label) {
    let count = 0;
    const next = source.replace(pattern, (...args) => {
        count += 1;
        return typeof replacement === 'function' ? replacement(...args) : replacement;
    });

    if (count !== 1) {
        throw new Error(`Expected one replacement for ${label}, got ${count}`);
    }

    return next;
}

let html = read('index.html');
const sheetJs = read('xlsx.full.min.js');
const appJs = read('app.js');
const driveSyncJs = read('drive-sync.js');

html = replaceOnce(
    html,
    /(\s*)<script id="embeddedHistoryData" type="application\/json">/,
    (_, indent) => `${indent}${scriptTag('data-inline-source="xlsx.full.min.js"', sheetJs)}\n${indent}<script id="embeddedHistoryData" type="application/json">`,
    'SheetJS inline script'
);

html = replaceOnce(
    html,
    /\s*<script src="app\.js[^"]*" defer data-app-script><\/script>/,
    `\n    ${scriptTag('data-app-script', appJs)}`,
    'app.js script'
);

html = replaceOnce(
    html,
    /\s*<script src="drive-sync\.js[^"]*" defer><\/script>/,
    `\n    ${scriptTag('data-drive-sync', driveSyncJs)}`,
    'drive-sync.js script'
);

fs.writeFileSync(path.join(root, 'index.github-standalone.html'), html, 'utf8');
