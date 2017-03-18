var texts = require('./texts'),
    baseLang;

module.exports = {
    getText: function(id, lang) {
        var key = texts[id];
        if(!key) {
            console.warn('Not found key "' + id + '" in getText().');
            return '';
        }

        var l = lang || baseLang,
            value = key[l];

        if(typeof value === 'undefined') {
            console.warn('Not found key "' + id + '", lang "' + l + '" in getText().');
            return '';
        }

        return value;
    },
    setLang: function(lang) {
        baseLang = lang;
    }
};
