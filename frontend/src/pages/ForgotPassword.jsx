import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-8 group">
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <FiCheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">Check your email</h1>
            <p className="text-dark-400 mb-6">We've sent a password reset link to <strong className="text-white">{email}</strong></p>
            <Link to="/login" className="btn-primary">Return to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl text-white mb-2">Forgot Password?</h1>
            <p className="text-dark-400 mb-8">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="your@email.com" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
