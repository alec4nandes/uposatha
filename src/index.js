import { auth, db } from "./database.js";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getNotifications } from "./notify.js";

onAuthStateChanged(auth, async (user) => {
    elem("login").style.display = user ? "none" : "block";
    elem("verified").style.display = user ? "block" : "none";
    if (user) {
        setOnClick("set-timezone-btn", () => setTimezone(user));
        setOnClick("notify-btn", () => getNotifications(user));
        const hasTZ = !!(await getTimezone(user));
        elem("notify-btn").style.display = hasTZ ? "block" : "none";
    } else {
        if (elem("login")) {
            setOnClick("login-btn", handleLogin);
        }
    }
});

async function getTimezone(user) {
    const resource = await getDoc(doc(db, "users", user.email)),
        data = resource.data();
    return data?.timezone;
}

async function setTimezone(user) {
    const timezone = elem("timezone").value;
    try {
        await setDoc(doc(db, "users", user.email), { timezone });
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
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
        })
        .catch((err) => {
            console.error(err);
            alert(err.message);
        });
}
