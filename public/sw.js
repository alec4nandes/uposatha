const cacheName = "cache66"; // Change value to force update

// PWA

self.addEventListener("install", (event) => {
    cacheFiles(event);
    // Kick out the old service worker
    self.skipWaiting();
});

function cacheFiles(event) {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll([
                "/",
                "android-chrome-36x36.png", // Favicon, Android Chrome M39+ with 0.75 screen density
                "android-chrome-48x48.png", // Favicon, Android Chrome M39+ with 1.0 screen density
                "android-chrome-72x72.png", // Favicon, Android Chrome M39+ with 1.5 screen density
                "android-chrome-96x96.png", // Favicon, Android Chrome M39+ with 2.0 screen density
                "android-chrome-144x144.png", // Favicon, Android Chrome M39+ with 3.0 screen density
                "android-chrome-192x192.png", // Favicon, Android Chrome M39+ with 4.0 screen density
                "android-chrome-256x256.png", // Favicon, Android Chrome M47+ Splash screen with 1.5 screen density
                "android-chrome-384x384.png", // Favicon, Android Chrome M47+ Splash screen with 3.0 screen density
                "android-chrome-512x512.png", // Favicon, Android Chrome M47+ Splash screen with 4.0 screen density
                "apple-touch-icon.png", // Favicon, Apple default
                "apple-touch-icon-57x57.png", // Apple iPhone, Non-retina with iOS6 or prior
                "apple-touch-icon-60x60.png", // Apple iPhone, Non-retina with iOS7
                "apple-touch-icon-72x72.png", // Apple iPad, Non-retina with iOS6 or prior
                "apple-touch-icon-76x76.png", // Apple iPad, Non-retina with iOS7
                "apple-touch-icon-114x114.png", // Apple iPhone, Retina with iOS6 or prior
                "apple-touch-icon-120x120.png", // Apple iPhone, Retina with iOS7
                "apple-touch-icon-144x144.png", // Apple iPad, Retina with iOS6 or prior
                "apple-touch-icon-152x152.png", // Apple iPad, Retina with iOS7
                "apple-touch-icon-180x180.png", // Apple iPhone 6 Plus with iOS8
                "browserconfig.xml", // IE11 icon configuration file
                "favicon.ico", // Favicon, IE and fallback for other browsers
                "favicon-16x16.png", // Favicon, default
                "favicon-32x32.png", // Favicon, Safari on Mac OS
                "index.html", // Main HTML file
                "index.js", // Webpack bundle
                "logo.png", // Logo
                "manifest.json", // Manifest file
                "maskable_icon.png", // Favicon, maskable https://web.dev/maskable-icon
                "mstile-70x70.png", // Favicon, Windows 8 / IE11
                "mstile-144x144.png", // Favicon, Windows 8 / IE10
                "mstile-150x150.png", // Favicon, Windows 8 / IE11
                "mstile-310x150.png", // Favicon, Windows 8 / IE11
                "mstile-310x310.png", // Favicon, Windows 8 / IE11
                "safari-pinned-tab.svg", // Favicon, Safari pinned tab
                "share.jpg", // Social media sharing
                "style.css", // Main CSS file
            ]);
        })
    );
}

// Offline-first, cache-first strategy
// Kick off two asynchronous requests, one to the cache and one to the network
// If there's a cached version available, use it, but fetch an update for next time.
// Gets data on screen as quickly as possible, then updates once the network has returned the latest data.
self.addEventListener("fetch", (event) => {
    event.request.method.toUpperCase() !== "POST" &&
        event.respondWith(
            caches.open(cacheName).then((cache) => {
                return cache.match(event.request).then((response) => {
                    return (
                        response ||
                        fetch(event.request).then((networkResponse) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        })
                    );
                });
            })
        );
});

// PUSH NOTIFICATIONS

self.addEventListener("push", function (event) {
    if (event.data) {
        console.log("Push event:", event.data.text());
        showLocalNotification(
            "Today is Uposatha",
            event.data.text(),
            self.registration
        );
    } else {
        console.warn("Push event, but no data.");
    }
});

function showLocalNotification(title, body, swRegistration) {
    const options = {
        // here you can add more properties like icon, image, vibrate, etc.
        body,
    };
    swRegistration.showNotification(title, options);
}

// BOTH PWA & PUSH NOTIFICATIONS

self.addEventListener("activate", async (event) => {
    event.waitUntil(cleanCache);
    await handleActivatePushManager();
});

async function cleanCache() {
    const cacheKeys = await caches.keys();
    return await Promise.all(
        cacheKeys.map((key) => {
            if (![cacheName].includes(key)) {
                return caches.delete(key);
            }
        })
    );
}

async function handleActivatePushManager() {
    // This will be called only once when the service worker is activated.
    try {
        const applicationServerKey =
                "BL9RzIuTXf5t8XSB7On9IfCNucATGUhS3kqTVp3W6HBajUEGdclXaoo2Nhlqx1xGXoS-rgHATdsR_jOCf4fdzHE",
            options = { applicationServerKey, userVisibleOnly: true },
            subscription = await self.registration.pushManager.subscribe(
                options
            ),
            response = await contactServer(subscription);
        console.log(response);
    } catch (err) {
        console.error("[ERROR]", err);
    }
}

const IS_DEVELOPMENT = false;

async function contactServer(subscription) {
    const SERVER_URL = IS_DEVELOPMENT
            ? "http://localhost:5001/uposatha-f7d3e/us-central1/api"
            : "https://us-central1-uposatha-f7d3e.cloudfunctions.net/api",
        response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
        });
    return response.json();
}
