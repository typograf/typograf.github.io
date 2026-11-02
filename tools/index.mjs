import fs from 'fs';
import Typograf from 'typograf';
import { JSDOM } from 'jsdom';

const indexHtml = fs.readFileSync('./src/html/index.html', { encoding: 'utf8'});
const typografScript = fs.readFileSync('./node_modules/typograf/dist/typograf.all.min.js', { encoding: 'utf8'});
const js = fs.readFileSync('./dist/index.js', { encoding: 'utf8'});
const css = fs.readFileSync('./dist/index.css', { encoding: 'utf8'});
const dom = new JSDOM('', { url: 'https://typograf.github.io/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
dom.window.Typograf = Typograf;
const { renderInitialPage } = await import('../dist/ssr.mjs');
const rendered = renderInitialPage();

function changeVars(text) {
    return text
        .replace(/\{\{VERSION\}\}/, Typograf.version)
        .replace(/\{\{TYPOGRAF_SCRIPT\}\}/, typografScript)
        .replace(/\{\{NOW\}\}/g, Date.now())
        .replace(/\{\{CSS\}\}/, css)
        .replace(/\{\{APP_HTML\}\}/, rendered.app)
        .replace(/\{\{LANGUAGE_SELECTOR_HTML\}\}/, rendered.languageSelector)
        .replace(/\{\{JS\}\}/, js);
}

fs.writeFileSync('./index.html', changeVars(indexHtml));
