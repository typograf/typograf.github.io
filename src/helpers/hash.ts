export function getHashParams() {
    const hash = window.location.hash.replace(/^#!/, '');
    const params: Record<string, string | undefined> = {};

    hash.split('&').forEach(item => {
        const [name, value] = item.split('=');
        if (value !== undefined) {
            try {
                params[name] = window.decodeURIComponent(value);
            } catch {
                params[name] = value;
            }
        }
    });

    return params;
}

export function getHashParam(name: string): string | undefined {
    return getHashParams()[name];
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
