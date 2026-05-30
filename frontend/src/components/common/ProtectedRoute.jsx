import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

// ==================== PROTECTED ROUTE ====================
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((s) => s.auth)
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ==================== ADMIN ROUTE ====================
export function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useSelector((s) => s.auth)
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// ==================== PAGE LOADER ====================
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--gold-border)' }} />
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
               style={{ borderTopColor: 'var(--gold)' }} />
          <div className="absolute inset-3 rounded-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#d4a842,#f0c866,#d4a842)' }}>
            <span className="font-display font-bold text-[#0a0a0f] text-sm">L</span>
          </div>
        </div>
        <p className="text-sm font-medium animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading LuxeStay...</p>
      </div>
    </div>
  )
}

// ==================== SCROLL TO TOP ====================
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// ==================== SKELETON LOADER ====================
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-56 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-24 rounded-lg" />
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ==================== EMPTY STATE ====================
export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-6">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="font-display text-2xl font-light text-white mb-2">{title}</h3>
      <p className="text-dark-400 max-w-md text-sm leading-relaxed mb-6">{description}</p>
      {action}
    </motion.div>
  )
}

// ==================== LOADING SPINNER ====================
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} ${className} rounded-full border-2 border-primary-500/20 border-t-primary-400 animate-spin`} />
  )
}

export default ProtectedRoute
