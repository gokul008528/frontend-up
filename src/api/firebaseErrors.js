const MESSAGES = {
  'auth/invalid-email': 'That email address doesn\u2019t look valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': null, // user-initiated cancel, not an error worth showing
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/expired-action-code': 'This reset link has expired. Request a new one.',
  'auth/invalid-action-code': 'This reset link is invalid or has already been used.',
  'auth/requires-recent-login': 'Please sign in again and retry - this action needs a recent login.',
}

export function friendlyAuthError(err) {
  if (!err) return null
  const code = err.code || ''
  if (code in MESSAGES) return MESSAGES[code]
  return err.message || 'Something went wrong. Please try again.'
}
