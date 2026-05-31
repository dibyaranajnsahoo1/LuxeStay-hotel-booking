import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu, FiX, FiLogOut, FiGrid,
  FiHeart, FiBookOpen, FiSettings, FiChevronDown, FiUser
} from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'
import { toggleMobileMenu, closeMobileMenu } from '../../store/slices/uiSlice'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const { isMobileMenuOpen, isDarkMode } = useSelector((s) => s.ui)

  const [scrolled,     setScrolled]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const isHome = location.pathname === '/'

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* close mobile menu on route change */
  useEffect(() => { dispatch(closeMobileMenu()) }, [location, dispatch])

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const navLinks = [
    { label: 'Hotels',       to: '/hotels' },
    { label: 'Destinations', to: '/hotels?featured=true' },
    { label: 'Offers',       to: '/hotels?sort=-ratings.average' },
  ]

  /* ── Navbar background logic ── */
  const transparentOnHome = isHome && !scrolled
  const navStyle = transparentOnHome
    ? 'bg-transparent'
    : isDarkMode
      ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#252535]'
      : 'bg-[#ffffff] border-b border-[#dddde8] shadow-sm'

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navStyle}`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[var(--shadow-glow)]"
                 style={{ background: 'linear-gradient(135deg,#d4a842,#f0c866,#d4a842)' }}>
              <span className="font-display font-bold text-[#0a0a0f] text-sm">L</span>
            </div>
            <span className="font-display text-2xl font-semibold"
                  style={{ color: transparentOnHome ? '#fff' : 'var(--text-primary)' }}>
              Luxe<span className="text-gradient">Stay</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.to.split('?')[0]
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color: active
                      ? 'var(--gold)'
                      : transparentOnHome
                        ? 'rgba(255,255,255,0.85)'
                        : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = active
                    ? 'var(--gold)'
                    : transparentOnHome
                      ? 'rgba(255,255,255,0.85)'
                      : 'var(--text-secondary)'}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* ── Right section ── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <ThemeToggle />

            {isAuthenticated && user ? (
              /* User dropdown */
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{ background: dropdownOpen ? 'var(--bg-elevated)' : 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <img
                    src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=d4a842&color=0a0a0f`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2"
                    style={{ ringColor: 'var(--gold-border)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: transparentOnHome ? '#fff' : 'var(--text-primary)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <FiChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{
                      color: 'var(--text-muted)',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-[var(--shadow-hover)] z-50"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                    >
                      {/* Profile header */}
                      <div className="p-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>

                      {/* Links */}
                      <div className="p-1.5">
                        {user.role === 'admin' && (
                          <DropdownItem icon={FiGrid} label="Admin Panel" to="/admin" gold />
                        )}
                        <DropdownItem icon={FiBookOpen} label="My Bookings"  to="/dashboard" />
                        <DropdownItem icon={FiHeart}    label="Wishlist"      to="/dashboard/wishlist" />
                        <DropdownItem icon={FiSettings} label="Settings"      to="/dashboard/profile" />
                      </div>

                      {/* Logout */}
                      <div className="p-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                          style={{ color: '#f87171' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <FiLogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Guest buttons */
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4"
                      style={{ color: transparentOnHome ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
              </div>
            )}
          </div>

          {/* ── Mobile: theme toggle + hamburger ── */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="p-2 rounded-xl transition-all duration-150"
              style={{ color: transparentOnHome ? '#fff' : 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="page-container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 8 }}>
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <MobileLink icon={FiGrid} label="Admin Panel" to="/admin" gold />
                    )}
                    <MobileLink icon={FiBookOpen} label="My Bookings"  to="/dashboard" />
                    <MobileLink icon={FiHeart}    label="Wishlist"      to="/dashboard/wishlist" />
                    <MobileLink icon={FiUser}     label="Profile"       to="/dashboard/profile" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{ color: '#f87171' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiLogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-2 pt-1">
                    <Link to="/login"    className="flex-1 btn-secondary text-center text-sm py-2.5">Sign In</Link>
                    <Link to="/register" className="flex-1 btn-primary  text-center text-sm py-2.5">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ── Helpers ── */
function DropdownItem({ icon: Icon, label, to, gold }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
      style={{ color: gold ? 'var(--gold)' : 'var(--text-secondary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = gold ? 'var(--gold-bg)' : 'var(--bg-elevated)'
        e.currentTarget.style.color = gold ? 'var(--gold)' : 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = gold ? 'var(--gold)' : 'var(--text-secondary)'
      }}
    >
      <Icon className="w-4 h-4 shrink-0" /> {label}
    </Link>
  )
}

function MobileLink({ icon: Icon, label, to, gold }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
      style={{ color: gold ? 'var(--gold)' : 'var(--text-secondary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = gold ? 'var(--gold)' : 'var(--text-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = gold ? 'var(--gold)' : 'var(--text-secondary)' }}
    >
      <Icon className="w-4 h-4" /> {label}
    </Link>
  )
}
