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
    // TODO:
    // get time info from another api,
    // get goals from user db
    /*
        IN CLOUD FUNCTIONS:
        1. Every day, in every timezone, check if there's a new or full moon.
        If there is, update a data object with the timezone as a key and an
        object with sunrise and sunset data as the value.

        2. Take this data object and scan through the users db, filtering out
        all users that match the relevant timezones

        {
            // timezone in hours from UTC
            -8: {
                sunrise: "06:12:34",
                sunset: "18:43:21",
                users: [
                    {subscription, goals},
                    ...
                ], 
            },
            ...
        }

        Users need to provide a notification time and their location.
        Both these can be updated in settings.

        // Every hour, a cloud function should update next_times for each user
        // in the database. If it's the user-set time in that person's timezone
        // on the day of next_times, and next_times !== last times,
        // push the data to the user's phone
    */
    const subscription = dummyDb.subscription, // TODO: make req.subscription
        sunrise = `6am`,
        sunset = "6pm",
        goals = ["fasting", "no smoking"],
        s = goals.length > 1 ? "s" : "",
        message = `
            sunrise: ${sunrise};
            sunset: ${sunset};
            effort${s}: ${goals.join(", ")}
        `;
    sendNotification(subscription, message);
    res.json({ message: "message sent" });
});

function sendNotification(subscription, dataToSend) {
    webpush.sendNotification(subscription, dataToSend);
}

module.exports = { api: functions.https.onRequest(api) };
