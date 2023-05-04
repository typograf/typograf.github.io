export type I18NKeys = { 'en-US': string, ru: string };
export type I18nKeysets = Record<string, I18NKeys>;
export type I18NLanguage = keyof I18NKeys;

let i18nKeysets: I18nKeysets = {};
let i18nLang: I18NLanguage;

export function i18n(id: string) {
    const key = i18nKeysets[id];
    if (!key) {
        console.error(`Not found key "${id}" in getText().`);
        return '';
    }

    const value = key[i18nLang];

    if (typeof value === 'undefined') {
        console.error(`Not found key "${id}", lang "${i18nLang}" in getText().`);
        return '';
    }

    return value;
}

export function addI18nKeysets(keysets: I18nKeysets) {
    i18nKeysets = {
        ...i18nKeysets,
        ...keysets,
    };
}

export function setI18nLang(lang: I18NLanguage) {
    i18nLang = lang;
}

function i18nUpdateHtml() {
    Array.from(document.querySelectorAll<HTMLElement>('[data-text-id]')).forEach(elem => {
        if (elem.dataset.textId) {
            elem.innerHTML = i18n(elem.dataset.textId);
        }
    });
}

function i18nUpdateValue() {
    Array.from(document.querySelectorAll<HTMLInputElement>('[data-value-id]')).forEach(elem => {
        if (elem.dataset.valueId) {
            elem.value = i18n(elem.dataset.valueId);
        }
    });
}

function i18nUpdateTitle() {
    Array.from(document.querySelectorAll<HTMLElement>('[data-title-id]')).forEach(elem => {
        if (elem.dataset.titleId) {
            elem.title = i18n(elem.dataset.titleId);
        }
    });
}

function i18nUpdatePlaceholder() {
    Array.from(document.querySelectorAll<HTMLInputElement>('[data-placeholder-id]')).forEach(elem => {
        if (elem.dataset.placeholderId) {
            elem.placeholder = i18n(elem.dataset.placeholderId);
        }
    });
}

export function i18nUpdatePage() {
    i18nUpdateHtml();
    i18nUpdateValue();
    i18nUpdateTitle();
    i18nUpdatePlaceholder();
}
