import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Footer() {
  const { user } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-panelBorder/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="font-display text-lg font-semibold text-chalk">
              Sketch<span className="text-marker">2</span>Real
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-graphite">
              Turn line art into photoreal renders in seconds — same composition, same intent,
              new material.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-chalk">Explore</h3>
            <nav className="mt-3 flex flex-col gap-2">
              <Link to="/#home" className="text-sm text-graphite hover:text-chalk">Home</Link>
              <Link to="/#features" className="text-sm text-graphite hover:text-chalk">Features</Link>
              <Link to="/#how-it-works" className="text-sm text-graphite hover:text-chalk">How it works</Link>
            </nav>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-chalk">Account</h3>
            <nav className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/studio" className="text-sm text-graphite hover:text-chalk">Dashboard</Link>
                  <Link to="/history" className="text-sm text-graphite hover:text-chalk">History</Link>
                  <Link to="/profile" className="text-sm text-graphite hover:text-chalk">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-graphite hover:text-chalk">Sign in</Link>
                  <Link to="/register" className="text-sm text-graphite hover:text-chalk">Get started</Link>
                </>
              )}
            </nav>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-chalk">Contact</h3>
            <nav className="mt-3 flex flex-col gap-2">
              <a href="mailto:support@sketch2real.app" className="text-sm text-graphite hover:text-chalk">
                support@sketch2real.app
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-graphite hover:text-chalk"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-graphite hover:text-chalk"
              >
                Twitter / X
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-panelBorder/60 pt-6 sm:flex-row">
          <p className="text-xs text-graphite">© {year} Sketch2Real. All rights reserved.</p>
          <p className="text-xs text-graphite">Built for artists & design teams.</p>
        </div>
      </div>
    </footer>
  )
}
