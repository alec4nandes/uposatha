import { db } from "./database.js";
import { doc, updateDoc } from "firebase/firestore";

async function getNotifications(user) {
    if (window.Notification.permission === "denied") {
        alert(
            "You have previously blocked notifications for this site. Please allow notifications."
        );
    }
    check();
    const granted = window.Notification.permission === "granted",
        permission = !granted && (await requestNotificationPermission()),
        swRegistration = await registerServiceWorker();
    let subscription;
    while (!subscription) {
        subscription = await swRegistration.pushManager.getSubscription();
    }
    // TODO: push new subscriptions to array: one user, different devices
    updateDoc(doc(db, "users", user.email), {
        subscription: JSON.parse(JSON.stringify(subscription)),
    });
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

export { getNotifications };
