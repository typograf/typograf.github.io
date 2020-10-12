if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./build/service-worker.js')
        .then(() => {
            console.log('Service Worker Registered');
        });
}
