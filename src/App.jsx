
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { isFirebaseConfigured, firebaseInitError } from './api/firebase'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import StudioPage from './pages/StudioPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'

function FirebaseSetupNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="card max-w-lg p-8">
        <span className="font-mono text-xs uppercase tracking-wider text-marker">Setup needed</span>
        <h1 className="mt-2 font-display text-2xl font-semibold text-chalk">
          Firebase isn&apos;t configured yet
        </h1>
        <p className="mt-3 text-sm text-graphite">
          This app uses Firebase for all sign-in, sign-up, and password reset. Add your project&apos;s
          config to <code className="rounded bg-panel px-1.5 py-0.5 text-xs">.env</code>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-panelBorder bg-panel p-4 text-xs text-graphite">
{`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=`}
        </pre>
        <p className="mt-4 text-sm text-graphite">
          Find these at Firebase console &rarr; Project settings &rarr; General &rarr; Your apps &rarr;
          SDK config. Then enable <strong className="text-chalk">Email/Password</strong> and{' '}
          <strong className="text-chalk">Google</strong> under Authentication &rarr; Sign-in method, and
          restart <code className="rounded bg-panel px-1.5 py-0.5 text-xs">npm run dev</code>.
        </p>
        {firebaseInitError && (
          <p className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-xs text-danger">
            {firebaseInitError.message}
          </p>
        )}
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-panelBorder border-t-marker" />
    </div>
  )
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <BrowserRouter>
        <ThemeProvider>
          <FirebaseSetupNeeded />
        </ThemeProvider>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
