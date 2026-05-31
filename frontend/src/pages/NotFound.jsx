import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="relative mb-8">
          <div className="font-display text-[180px] leading-none font-bold text-dark-900 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gold-gradient flex items-center justify-center shadow-glow">
              <span className="font-display text-4xl text-[#0a0a0f]">?</span>
            </div>
          </div>
        </div>
        <h1 className="font-display text-3xl text-white mb-3">Page Not Found</h1>
        <p className="text-dark-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to the comfort of LuxeStay.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-ghost border border-dark-600 flex items-center gap-2">
            <FiArrowLeft /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <FiHome className="w-4 h-4" /> Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
