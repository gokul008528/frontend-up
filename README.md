# Sketch2Real — Frontend

React + Vite frontend for the Sketch-to-Real image generator.

**All authentication (login, signup, Google sign-in, and password reset) is
handled entirely by Firebase, directly from the frontend.** There is no
custom auth backend, no SMTP setup, no email service to configure — Firebase
sends real password-reset emails automatically once Email/Password sign-in
is enabled in the console.

Your teammate's backend is only used for the actual sketch → image
generation calls (Studio/History) — it never sees a password.

## Stack

- React 18 + React Router
- Tailwind CSS, themeable via CSS variables — **light "professional" theme
  is the default**, with dark and system-follow available from the header
  toggle (`src/styles/theme.css`)
- **Firebase Auth** — the entire auth system (`src/context/AuthContext.jsx`)
- Plain `fetch` client for the generation backend only (`src/api/client.js`),
  authenticated with a Firebase ID token per request

## 1. Set up Firebase (required — the app won't run without this)

1. Go to https://console.firebase.google.com → create a project (or reuse one).
2. **Authentication** → **Sign-in method** → enable both:
   - **Email/Password**
   - **Google**
3. **Project settings** (gear icon) → **General** → "Your apps" → add a Web
   app → copy the config values.
4. **Authentication** → **Settings** → **Authorized domains** → confirm
   `localhost` is listed (it is by default).

## 2. Install and configure

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourapp
VITE_FIREBASE_APP_ID=...
```

`VITE_USE_MOCK_API=true` is left on by default — that only affects Studio/
History (image generation), which will run against a local in-memory mock
until your teammate's backend is ready. Auth works for real either way,
since it's Firebase.

## 3. Run it

```bash
npm run dev
```

If Firebase isn't configured yet, the app shows a clear setup screen
instead of a blank/broken page, telling you exactly what's missing.

## What's in the app

- **Left sidebar** (History, Profile, Logout) for authenticated routes.
- **Header theme toggle** — System / Light / Dark, persisted, defaults to Light.
- **Login** — email/password or "Continue with Google."
- **Register** — email/password or "Sign up with Google" (same Firebase
  flow either way — Firebase treats "new Google user" as a signup
  automatically).
- **Forgot password** (`/forgot-password`) — always shows the same
  generic success message, regardless of whether the email has an account
  (avoids leaking which emails are registered). Fires a real Firebase
  password-reset email if the account exists.
- **Reset password** (`/reset-password?oobCode=...`) — the page the emailed
  link opens. Verifies the link is still valid, shows which account it's
  for, then lets you set a new password.
- **Profile** (`/profile`) — edit display name.

## How password reset actually works (no setup needed beyond step 1)

1. User requests a reset on `/forgot-password`.
2. `sendPasswordResetEmail(auth, email, { url: '.../reset-password' })` in
   `AuthContext.jsx` tells Firebase to email a link that points back at
   *this app's* `/reset-password` page (not Firebase's generic hosted page).
3. Firebase emails the link itself — using Firebase's own infrastructure,
   not your Gmail or any SMTP account. Nothing to configure beyond
   Authentication being enabled.
4. The link is `https://yourapp/reset-password?oobCode=XYZ&mode=resetPassword`.
5. `ResetPasswordPage.jsx` verifies `oobCode` with `verifyPasswordResetCode`,
   shows which account it's for, then calls `confirmPasswordReset` on submit.

This is genuinely how Firebase's password reset works out of the box — no
custom email templates or SMTP credentials are required. (You can
customize the email's look under Authentication → Templates in the
Firebase console, later, if you want.)

## Plugging in the real generation backend

Once your teammate's backend is ready:

1. Set `VITE_USE_MOCK_API=false` in `.env`.
2. Set `VITE_API_BASE_URL` to the backend's base URL (or leave `/api` and
   set `VITE_API_PROXY_TARGET` in `vite.config.js` for local dev proxying).
3. Confirm the backend matches the contract documented at the top of
   `src/api/client.js`.

### Expected generation endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/generations` | ✓ | Multipart upload: sketch file + style/palette/quality/variations |
| GET | `/api/generations` | ✓ | Paginated history |
| GET | `/api/generations/:id` | ✓ | Single generation detail |
| DELETE | `/api/generations/:id` | ✓ | Remove a generation |

"Auth" here means `Authorization: Bearer <firebase ID token>` — the
frontend attaches this automatically on every generation request. **Your
teammate's backend needs to verify this token using the Firebase Admin
SDK** (`admin.auth().verifyIdToken(token)`), not trust any user info sent
in the request body. This requires a Firebase service account key on the
backend (Firebase console → Project settings → Service accounts →
Generate new private key) — a backend-only secret, never put it in the
frontend.

## Project structure

```
src/
  api/
    firebase.js         # Firebase init - the entire auth backend
    firebaseErrors.js     # maps Firebase error codes to friendly messages
    client.js            # generation backend calls only, Firebase-ID-token authed
    mockClient.js          # in-memory generation mock, used when VITE_USE_MOCK_API=true
    index.js              # picks real vs mock generation API based on env
  components/
    layout/
      Navbar.jsx, Sidebar.jsx, AppShell.jsx
    auth/
      AuthLayout.jsx, GoogleSignInButton.jsx
    ui/
      ThemeToggle.jsx, Spinner.jsx
  context/
    AuthContext.jsx     # login/register/loginWithGoogle/reset password/logout - all Firebase
    ThemeContext.jsx
  styles/
    theme.css
  pages/
    LandingPage.jsx, LoginPage.jsx, RegisterPage.jsx,
    ForgotPasswordPage.jsx, ResetPasswordPage.jsx,
    StudioPage.jsx, HistoryPage.jsx, ProfilePage.jsx
  __tests__/
```

## Testing

```bash
npm run test
npm run test:watch
```

## Notes for the backend teammate

- Auth is entirely Firebase - you'll never receive a password, register a
  user, or issue a session token. Just verify the Firebase ID token on
  each `/api/generations/*` request.
- File uploads are sent as `multipart/form-data` with the field name `sketch`.
- Errors should come back as `message` or `error` fields on non-2xx JSON
  responses, so they surface correctly in the UI.
