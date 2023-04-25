declare global {
    interface Window {
        InstallTrigger: unknown;
    }
}

export function isYaBrowser() {
    return navigator.userAgent.search('YaBrowser') > -1;
}

export function isFirefox() {
    return typeof window.InstallTrigger !== 'undefined';
}

export function isOpera() {
    return navigator.userAgent.search(' OPR/') > -1;
}
