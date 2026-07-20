import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateProfile as firebaseUpdateProfile,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  signOut,
} from 'firebase/auth'
import { firebaseAuth, googleProvider, isFirebaseConfigured } from '../api/firebase'

const AuthContext = createContext(null)

function mapFirebaseUser(fbUser) {
  if (!fbUser) return null
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'there',
    email: fbUser.email,
    picture: fbUser.photoURL,
    // Whether this account has an email/password credential attached (vs.
    // Google-only). Only password accounts can use changePassword() below -
    // ChangePasswordPage uses this to hide the form for Google-only users.
    hasPasswordProvider: (fbUser.providerData || []).some((p) => p.providerId === 'password'),
  }
}

// Where Firebase's password reset link points back to. Configured here so
// the emailed link opens this app's own /reset-password page, not a
// generic Firebase-hosted page.
function resetPasswordActionSettings() {
  return { url: `${window.location.origin}/reset-password` }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false)
      return undefined
    }
    // Firebase persists the session itself (localStorage by default) and
    // restores it automatically - this listener just mirrors that into
    // our own `user` state, and fires once immediately with the restored
    // session (or null) before any real auth event happens.
    const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser) => {
      setUser(mapFirebaseUser(fbUser))
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return mapFirebaseUser(cred.user)
  }, [])

  const register = useCallback(async (name, email, password) => {
    setError(null)
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    if (name) await firebaseUpdateProfile(cred.user, { displayName: name })
    return mapFirebaseUser(cred.user)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    const cred = await signInWithPopup(firebaseAuth, googleProvider)
    return mapFirebaseUser(cred.user)
  }, [])

  // Always resolves, even for an email with no account - Firebase's own
  // "Email enumeration protection" (Authentication > Settings in the
  // console) makes this true at the Firebase level too, but we swallow
  // auth/user-not-found here as well so the UI is correct either way.
  const requestPasswordReset = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email, resetPasswordActionSettings())
    } catch (err) {
      if (err.code !== 'auth/user-not-found' && err.code !== 'auth/invalid-email') {
        throw err
      }
    }
  }, [])

  // oobCode is Firebase's reset token, arrives as ?oobCode=... on the
  // emailed link (see ResetPasswordPage).
  const resetPassword = useCallback(async (oobCode, newPassword) => {
    await confirmPasswordReset(firebaseAuth, oobCode, newPassword)
  }, [])

  // Confirms the link is still valid and returns the account's email, so
  // the Reset Password page can show "Resetting password for x@y.com"
  // before the user commits to a new password.
  const verifyResetCode = useCallback(
    (oobCode) => verifyPasswordResetCode(firebaseAuth, oobCode),
    []
  )

  // Changes the password for the signed-in user. Firebase requires a
  // "recent" login for this sensitive action, so we reauthenticate with the
  // current password first - this also doubles as verifying the user
  // actually knows their current password before we let them set a new one.
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const current = firebaseAuth.currentUser
    if (!current || !current.email) throw new Error('Not authenticated')
    const credential = EmailAuthProvider.credential(current.email, currentPassword)
    await reauthenticateWithCredential(current, credential)
    await firebaseUpdatePassword(current, newPassword)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!firebaseAuth.currentUser) throw new Error('Not authenticated')
    await firebaseUpdateProfile(firebaseAuth.currentUser, {
      ...(updates.name ? { displayName: updates.name } : {}),
    })
    const updated = mapFirebaseUser(firebaseAuth.currentUser)
    setUser(updated)
    return updated
  }, [])

  const logout = useCallback(async () => {
    await signOut(firebaseAuth)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        setError,
        login,
        register,
        loginWithGoogle,
        requestPasswordReset,
        resetPassword,
        verifyResetCode,
        changePassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
