export default function i18n(id, lang) {
    const key = i18n.texts[id];
    if (!key) {
        console.warn(`Not found key "${id}" in getText().`);
        return '';
    }

    const
        l = lang || i18n.lang,
        value = key[l];

    if (typeof value === 'undefined') {
        console.warn(`Not found key "${id}", lang "${l}" in getText().`);
        return '';
    }

    return value;
}

i18n.texts = {};
