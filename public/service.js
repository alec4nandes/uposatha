const IS_DEVELOPMENT = false;

self.addEventListener("activate", async () => {
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
});

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

function showLocalNotification(title, body, swRegistration) {
    const options = {
        // here you can add more properties like icon, image, vibrate, etc.
        body,
    };
    swRegistration.showNotification(title, options);
}
