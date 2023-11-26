import { db } from "./database.js";
import { collection, getDocs } from "firebase/firestore";

const IS_DEVELOPMENT = false,
    SERVER_URL = IS_DEVELOPMENT
        ? "http://localhost:5001/uposatha-f7d3e/us-central1/api/push"
        : "https://us-central1-uposatha-f7d3e.cloudfunctions.net/api/push";

async function pushToAllUsers() {
    Object.values(await getAllUsers()).forEach(({ subscription }) => {
        pushToUser(subscription);
    });
}

async function pushToUser(subscription) {
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ subscription }),
        });
    } catch (err) {
        console.error(err);
    }
}

async function getAllUsers() {
    const result = {},
        snapshot = await getDocs(collection(db, "users"));
    snapshot.forEach((d) => (result[d.id] = d.data()));
    return result;
}

export { pushToAllUsers };
