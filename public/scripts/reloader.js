// PWA can get stale on a device's home screen, so reload
// every hour in case there are page updates.
setTimeout(() => {
    window.location.reload();
}, 1000 * 60 * 60);
