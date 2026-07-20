import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import MinimalHeader from './MinimalHeader'
import Footer from './Footer'

const MINIMAL_HEADER_PATHS = ['/login', '/register']

export default function AppShell({ children }) {
  const location = useLocation()
  const isAuthPage = MINIMAL_HEADER_PATHS.includes(location.pathname)
  return (
    <div className="grain flex min-h-screen flex-col bg-canvas">
      {isAuthPage ? <MinimalHeader /> : <Navbar />}
      <div className="min-w-0 flex-1">{children}</div>
      {!isAuthPage && <Footer />}
    </div>
  )
}