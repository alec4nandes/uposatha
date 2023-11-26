import { auth, db } from "./database.js";
import {
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getNotifications } from "./notify.js";
import { pushToAllUsers } from "./push.js";

pushToAllUsers();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const data = await getUserData(user),
            tz = data?.timezone,
            sub = data?.subscription;
        if (tz) {
            elem("timezone").value = tz;
            elem("notify-btn").textContent = `${
                sub ? "RESET" : "START"
            } NOTIFICATIONS`;
            setOnClick("notify-btn", () => getNotifications(user));
        } else {
            elem("notify-btn").style.display = "none";
        }
        setOnClick("set-timezone-btn", () => setTimezone(user));
    } else {
        setOnClick("login-btn", handleLogin);
    }
    elem("login").style.display = user ? "none" : "block";
    elem("verified").style.display = user ? "block" : "none";
});

async function getUserData(user) {
    const result = await getDoc(doc(db, "users", user.email));
    return result.data();
}

async function setTimezone(user) {
    const timezone = elem("timezone").value;
    try {
        const docRef = doc(db, "users", user.email),
            docExists = (await getDoc(docRef)).exists();
        await (docExists ? updateDoc : setDoc)(docRef, { timezone });
        window.location.reload();
    } catch (err) {
        console.error(err);
    }
}

function elem(id) {
    return document.querySelector(`#${id}`);
}

function setOnClick(id, func) {
    elem(id).onclick = func;
}

function handleLogin() {
    const getVal = (id) => elem(id).value,
        email = getVal("email"),
        password = getVal("password");
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            // Existing and future Auth states are now persisted in the current
            // session only. Closing the window would clear any existing state even
            // if a user forgets to sign out.
            // ...
            // New sign-in will be persisted with session persistence.
            return signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                })
                .catch((err) => {
                    console.error(err);
                    alert(err.message);
                });
        })
        .catch((err) => {
            console.error(err);
            alert(err.message);
        });
}
