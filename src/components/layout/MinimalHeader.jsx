import { Link } from 'react-router-dom'

export default function MinimalHeader() {
  return (
    <header className="border-b border-panelBorder/60 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M4 20 C6 10, 10 4, 14 4 C18 4, 20 8, 24 6" stroke="rgb(var(--color-marker))" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4" />
            <circle cx="24" cy="6" r="2.5" fill="rgb(var(--color-marker))" />
          </svg>
          <span className="font-display text-base font-semibold tracking-tight text-chalk">
            Sketch<span className="text-marker">2</span>Real
          </span>
        </Link>
        <Link to="/" className="font-display text-sm text-graphite hover:text-chalk">Back to home</Link>
      </div>
    </header>
  )
}