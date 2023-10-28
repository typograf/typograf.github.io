export function withInstallApp() {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e => {
        // eslint-disable-next-line no-unused-vars
        deferredPrompt = e;
    });
}
