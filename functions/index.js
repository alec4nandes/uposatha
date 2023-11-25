require("dotenv").config();

const webpush = require("web-push"),
    express = require("express"),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    functions = require("firebase-functions");

webpush.setVapidDetails(
    "mailto:al@fern.haus",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const api = express();
api.use(cors());
api.use(bodyParser.json());

const dummyDb = { subscription: null }; // dummy in memory store

api.post("/", async (req, res) => {
    const subscription = req.body;
    await saveToDatabase(subscription);
    res.json({ message: "notifications enabled" });
});

async function saveToDatabase(subscription) {
    // TODO: add Firestore db logic
    dummyDb.subscription = subscription;
}

// push notification endpoint

api.get("/push", (req, res) => {
    // TODO: make this req.subscription
    // (only push to certain users based on their settings)
    const subscription = dummyDb.subscription,
        sunrise = `6am`,
        sunset = "6pm",
        goals = ["fasting", "no smoking"],
        s = goals.length > 1 ? "s" : "",
        message = `sunrise: ${sunrise}; sunset: ${sunset}; effort${s}: ${goals.join(
            ", "
        )}`;
    sendNotification(subscription, message);
    res.json({ message: "message sent" });
});

function sendNotification(subscription, dataToSend) {
    webpush.sendNotification(subscription, dataToSend);
}

module.exports = { api: functions.https.onRequest(api) };
