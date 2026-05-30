import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleDarkMode } from '../../store/slices/uiSlice'

/**
 * Animated dark / light mode toggle.
 * Uses SVG sun & moon icons with smooth morph transition.
 * Props:
 *   size   — 'sm' | 'md' (default 'md')
 *   className — extra classes for the wrapper button
 */
export default function ThemeToggle({ size = 'md', className = '' }) {
  const dispatch = useDispatch()
  const isDarkMode = useSelector((s) => s.ui.isDarkMode)

  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const iconSize = size === 'sm' ? 14 : 18

  return (
    <motion.button
      onClick={() => dispatch(toggleDarkMode())}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative ${dim} rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200 ${className}`}
      style={{
        background: isDarkMode
          ? 'rgba(212,168,66,0.12)'
          : 'rgba(30,30,50,0.08)',
        border: isDarkMode
          ? '1px solid rgba(212,168,66,0.3)'
          : '1px solid rgba(30,30,50,0.15)',
      }}
    >
      {/* Track — slides behind the icon */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: isDarkMode
            ? 'radial-gradient(circle at 60% 40%, rgba(212,168,66,0.18), transparent 70%)'
            : 'radial-gradient(circle at 40% 60%, rgba(255,200,50,0.22), transparent 70%)',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Icon switcher */}
      <AnimatePresence mode="wait" initial={false}>
        {isDarkMode ? (
          <motion.svg
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d4a842"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative z-10"
          >
            {/* Moon */}
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b8860b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative z-10"
          >
            {/* Sun */}
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
