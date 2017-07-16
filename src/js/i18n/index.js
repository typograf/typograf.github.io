var texts = require('./texts');

function i18n(id, lang) {
    var key = texts[id];
    if (!key) {
        console.warn('Not found key "' + id + '" in getText().');
        return '';
    }

    var l = lang || i18n.lang,
        value = key[l];

    if (typeof value === 'undefined') {
        console.warn('Not found key "' + id + '", lang "' + l + '" in getText().');
        return '';
    }

    return value;
}

module.exports = i18n;
