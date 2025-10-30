export function withInstallApp() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e => {
        deferredPrompt = e;
    });
}
