async function main() {
    check();
    const permission = await requestNotificationPermission();
    const swRegistration = await registerServiceWorker();
}

function check() {
    if (!("serviceWorker" in navigator)) {
        throw new Error("No Service Worker support!");
    }
    if (!("PushManager" in window)) {
        throw new Error("No Push API support!");
    }
}

async function requestNotificationPermission() {
    const permission = await window.Notification.requestPermission();
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    if (permission !== "granted") {
        throw new Error("Permission not granted for window.Notification");
    }
    return permission;
}

async function registerServiceWorker() {
    const swRegistration = await navigator.serviceWorker.register("sw.js");
    return swRegistration;
}
