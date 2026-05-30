import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiPhone } from 'react-icons/fi'
import { login, register, clearError } from '../store/slices/authSlice'

function AuthLayout({ children, title, subtitle, image }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={image} alt="Luxury Hotel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <Link to="/" className="flex items-center gap-2 mb-auto mt-8">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="font-display font-bold text-dark-950 text-sm">L</span>
            </div>
            <span className="font-display text-2xl font-semibold text-white">Luxe<span className="text-gradient">Stay</span></span>
          </Link>
          <blockquote className="mb-12">
            <p className="font-display text-3xl text-white font-light italic mb-4">"Where every stay becomes an unforgettable story."</p>
            <footer className="text-dark-400 text-sm">— LuxeStay Promise</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <span className="font-display font-bold text-dark-950 text-sm">L</span>
              </div>
              <span className="font-display text-2xl font-semibold text-white">Luxe<span className="text-gradient">Stay</span></span>
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-4xl text-white mb-2">{title}</h1>
            <p className="text-dark-400 mb-8">{subtitle}</p>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const from = location.state?.from?.pathname || '/'

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }) }, [isAuthenticated, navigate, from])
  useEffect(() => { dispatch(clearError()) }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(form))
  }

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@luxestay.com', password: 'Admin@123456' })
    else setForm({ email: 'customer@luxestay.com', password: 'Customer@123' })
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your LuxeStay account"
      image="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200"
    >
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm mb-5">{error}</div>
      )}

      {/* Demo Credentials */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => fillDemo('customer')} className="flex-1 py-2 px-3 bg-dark-800 border border-dark-700 rounded-xl text-xs text-dark-400 hover:border-primary-500/40 hover:text-primary-400 transition-all text-center">
          👤 Demo Customer
        </button>
        <button onClick={() => fillDemo('admin')} className="flex-1 py-2 px-3 bg-dark-800 border border-dark-700 rounded-xl text-xs text-dark-400 hover:border-primary-500/40 hover:text-primary-400 transition-all text-center">
          🔧 Demo Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="input-field pl-10"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password || ''}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
              required
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
              {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
          {loading ? 'Signing in...' : <><span>Sign In</span><FiArrowRight /></>}
        </button>
      </form>
      <p className="text-center text-dark-400 text-sm mt-6">
        Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create account</Link>
      </p>
    </AuthLayout>
  )
}

const Field = ({ name, label, type = 'text', placeholder, icon: Icon, form, setForm, errors, setErrors }) => {
  const handleChange = (e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
        <input
          type={type}
          value={form[name] || ''}
          onChange={handleChange}
          className={`input-field pl-10 ${errors[name] ? 'border-red-500' : ''}`}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  )
}

export function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => { if (isAuthenticated) navigate('/', { replace: true }) }, [isAuthenticated, navigate])
  useEffect(() => { dispatch(clearError()) }, [dispatch])

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email required'
    if (form.phone && !form.phone.match(/^[6-9]\d{9}$/)) errs.phone = 'Valid 10-digit phone required'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    dispatch(register({ name: form.name, email: form.email, phone: form.phone, password: form.password }))
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join LuxeStay for exclusive deals and benefits"
      image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200"
    >
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field name="name" label="Full Name" placeholder="John Doe" icon={FiUser} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
        <Field name="email" label="Email Address" type="email" placeholder="john@example.com" icon={FiMail} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
        <Field name="phone" label="Phone Number (Optional)" placeholder="9876543210" icon={FiPhone} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password || ''}
              onChange={(e) => {
                setForm(prev => ({ ...prev, password: e.target.value }))
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
              }}
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Min. 8 characters"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="password"
              value={form.confirmPassword || ''}
              onChange={(e) => {
                setForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
              }}
              className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Repeat password"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Creating account...' : <><span>Create Account</span><FiArrowRight /></>}
        </button>
      </form>
      <p className="text-center text-dark-400 text-sm mt-6">
        Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default Login
