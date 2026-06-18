// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth,
         signInWithPopup,
         GoogleAuthProvider,
         onAuthStateChanged,
         User
        } from "firebase/auth";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
export const functions = getFunctions();

/**
 * Signs in the user with a Google account using a popup.
 * @returns A promise that resolves with the signed-in user, or null if the sign-in was unsuccessful.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider())
}

/**
 * Signs out the currently signed-in user.
 * @returns A promise that resolves when the sign-out is complete.
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback whenever the authentication state changes (e.g. user signs in or out).
 * @param callback - A function that takes the current user (or null if not signed in) as an argument.
 * @returns A function that can be called to unsubscribe from authentication state changes.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
