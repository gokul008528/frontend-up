import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import { friendlyAuthError } from '../api/firebaseErrors'

export default function ChangePasswordPage() {
  const { user, changePassword } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Google-only accounts have no password to change - send them back with
  // an explanation instead of showing a form that can never work for them.
  if (user && user.hasPasswordProvider === false) {
    return (
      <AuthLayout eyebrow="Account" title="No password to change">
        <p className="text-sm text-graphite">
          Your account signs in with Google, so there&apos;s no separate studio password to update.
          Manage sign-in through your Google account instead.
        </p>
        <Link to="/profile" className="mt-6 inline-block text-sm text-marker hover:underline">
          Back to profile
        </Link>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout eyebrow="All set" title="Password updated">
        <p className="text-sm text-graphite">Your password has been changed.</p>
        <Link to="/profile" className="mt-6 inline-block text-sm text-marker hover:underline">
          Back to profile
        </Link>
      </AuthLayout>
    )
  }

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
    if (password === currentPassword) {
      setError('New password must be different from your current password.')
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword(currentPassword, password)
      setDone(true)
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else {
        setError(friendlyAuthError(err))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Account"
      title="Change your password"
      subtitle={user?.email ? `For ${user.email}` : undefined}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-graphite">Current password</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
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
      <p className="mt-6 text-center text-sm text-graphite">
        <Link to="/profile" className="text-marker hover:underline">
          Back to profile
        </Link>
      </p>
    </AuthLayout>
  )
}
