import { truncate } from "./string";

export function getHashParams() {
    const hash = window.location.hash.replace(/^#!/, '');
    const params: Record<string, string | undefined> = {};

    hash.split('&').forEach(item => {
        const [name, value] = item.split('=');
        if (value !== undefined) {
            try {
                params[name] = window.decodeURIComponent(value);
            } catch (e) {
                params[name] = value;
            }
        }
    });

    return params;
}

export function getHashParam(name: string): string | undefined {
    return getHashParams()[name];
}

const MAX_HASH_LENGTH = 512;

export function setTextHashParam(text: string) {
    window.location.hash = '#!text=' + window.encodeURIComponent(truncate(text, MAX_HASH_LENGTH));
}

export function setPrefsHash() {
    window.location.hash = '#!prefs';
}

export function isPrefsHash() {
    return window.location.hash === '#!prefs';
}

export function resetHash() {
    window.location.hash = '';
}
