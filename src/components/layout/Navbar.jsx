import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

function Logo() {
  return (
    <Link to="/#home" className="flex items-center gap-2.5 group">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M4 20 C6 10, 10 4, 14 4 C18 4, 20 8, 24 6"
          stroke="rgb(var(--color-graphite))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 4"
          className="transition-all duration-300 group-hover:stroke-marker"
        />
        <path
          d="M4 20 C6 10, 10 4, 14 4 C18 4, 20 8, 24 6"
          stroke="rgb(var(--color-marker))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 40"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <circle cx="24" cy="6" r="2.5" fill="rgb(var(--color-marker))" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-chalk">
        Sketch<span className="text-marker">2</span>Real
      </span>
    </Link>
  )
}

// Public links: always visible, point at sections on the landing page.
const PUBLIC_LINKS = [
  { to: '/#home', label: 'Home' },
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
]

// Account links: only shown once the user is signed in.
const ACCOUNT_LINKS = [
  { to: '/studio', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-panelBorder/60 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-md px-3.5 py-2 font-display text-base text-graphite hover:text-chalk"
            >
              {label}
            </Link>
          ))}

          {user ? (
            <>
              <div className="mx-2 h-5 border-l border-panelBorder" />
              {ACCOUNT_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-md px-3.5 py-2 font-display text-base transition-colors ${
                      isActive ? 'text-chalk' : 'text-graphite hover:text-chalk'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3.5 py-2 font-display text-base text-graphite hover:text-chalk"
              >
                Logout
              </button>
              <div className="ml-3 border-l border-panelBorder pl-3">
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              <div className="ml-1">
                <ThemeToggle />
              </div>
              <Link to="/login" className="rounded-md px-3.5 py-2 font-display text-base text-graphite hover:text-chalk">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-base">
                Get started
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="flex flex-col gap-1.5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-chalk transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-chalk transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-chalk transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-panelBorder bg-canvas px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="py-2 font-display text-base text-chalk"
              >
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="my-2 border-t border-panelBorder" />
                {ACCOUNT_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 font-display text-base text-chalk"
                  >
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="py-2 text-left font-display text-base text-graphite">
                  Logout ({user.name})
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-panelBorder" />
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 font-display text-base text-chalk">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 font-display text-base text-marker">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
