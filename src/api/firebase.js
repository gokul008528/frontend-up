/**
 * Firebase is the entire auth system for this app: email/password,
 * Google sign-in, and password reset all go through Firebase directly.
 * There is NO custom backend for any of this — Firebase sends the
 * password-reset emails itself, automatically, once Email/Password sign-in
 * is enabled in the Firebase console. No SMTP/email provider setup needed.
 *
 * Your teammate's backend is only used for the actual image-generation
 * endpoints (see src/api/client.js) — it never sees passwords or issues
 * its own session tokens. It should verify the Firebase ID token sent with
 * each generation request instead (via the Firebase Admin SDK).
 *
 * Fill in the VITE_FIREBASE_* values in .env (Firebase console > Project
 * settings > General > Your apps > SDK config), and enable both "Email/
 * Password" and "Google" under Authentication > Sign-in method.
 */
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
)

let firebaseApp = null
let firebaseAuth = null
let initError = null

if (isFirebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
  } catch (err) {
    // A malformed/invalid key shouldn't crash the whole app - surface it
    // through firebaseInitError so App.jsx can show a clear setup screen
    // instead of a blank white page.
    initError = err
    // eslint-disable-next-line no-console
    console.error('[firebase] Failed to initialize - check your VITE_FIREBASE_* values:', err)
  }
}

export const firebaseInitError = initError
export const googleProvider = new GoogleAuthProvider()
export { firebaseAuth }
