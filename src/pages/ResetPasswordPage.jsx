import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import { friendlyAuthError } from '../api/firebaseErrors'

export default function ResetPasswordPage() {
  const { resetPassword, verifyResetCode } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Firebase's emailed link uses ?oobCode=... (and a mode=resetPassword
  // param we don't need to read ourselves).
  const oobCode = searchParams.get('oobCode')

  const [checking, setChecking] = useState(true)
  const [linkError, setLinkError] = useState(null)
  const [accountEmail, setAccountEmail] = useState(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setChecking(false)
      return
    }
    verifyResetCode(oobCode)
      .then((email) => setAccountEmail(email))
      .catch((err) => setLinkError(friendlyAuthError(err)))
      .finally(() => setChecking(false))
  }, [oobCode, verifyResetCode])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword(oobCode, password)
      setDone(true)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!oobCode || linkError) {
    return (
      <AuthLayout eyebrow="Reset password" title="Link missing or invalid">
        <p className="text-sm text-graphite">
          {linkError || 'This page needs a valid reset link.'} Request a new one below.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm text-marker hover:underline">
          Request a new reset link
        </Link>
      </AuthLayout>
    )
  }

  if (checking) {
    return (
      <AuthLayout eyebrow="Reset password" title="Checking your link\u2026">
        <p className="text-sm text-graphite">One moment.</p>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout eyebrow="All set" title="Password updated">
        <p className="text-sm text-graphite">You can now sign in with your new password.</p>
        <Link to="/login" className="mt-6 inline-block text-sm text-marker hover:underline">
          Go to sign in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Almost there"
      title="Choose a new password"
      subtitle={accountEmail ? `For ${accountEmail}` : undefined}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-graphite">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-graphite">Confirm new password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthLayout>
  )
}
