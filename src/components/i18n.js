import {keys, langs} from './i18n.data';
import storage from './storage/storage';

function prepareLang(value) {
    // TODO: Удалить после 01.09.2018
    if (value === 'en') {
        value = 'en-US';
        storage.set('lang', value);
    }

    let result = '';
    langs.some(function(item) {
        if (value === item.value) {
            result = value;
            return true;
        }

        return false;
    });

    return result || langs[0].value;
}

let lang = prepareLang(storage.get('lang'));

export default function i18n(id, forceLang) {
    const key = keys[id];
    if (!key) {
        console.warn(`Not found key "${id}" in getText().`);
        return '';
    }

    const
        l = forceLang || lang,
        value = key[l];

    if (typeof value === 'undefined') {
        console.warn(`Not found key "${id}", lang "${l}" in getText().`);
        return '';
    }

    return value;
}

i18n.getLang = function() {
    return lang;
};

i18n.getLangs = function() {
    return langs;
};

i18n.setLang = function(value) {
    lang = value;
    storage.set('lang', lang);
};
