import fs from 'fs';
import Typograf from 'typograf';

const indexHtml = fs.readFileSync('./src/html/index.html', { encoding: 'utf8'});
const typografScript = fs.readFileSync('./node_modules/typograf/dist/typograf.all.min.js', { encoding: 'utf8'});
const js = fs.readFileSync('./dist/index.js', { encoding: 'utf8'});
const css = fs.readFileSync('./dist/index.css', { encoding: 'utf8'});

function changeVars(text) {
    return text
        .replace(/\{\{VERSION\}\}/, Typograf.version)
        .replace(/\{\{TYPOGRAF_SCRIPT\}\}/, typografScript)
        .replace(/\{\{CSS\}\}/, css)
        .replace(/\{\{JS\}\}/, js);
}

fs.writeFileSync('./index.html', changeVars(indexHtml));
