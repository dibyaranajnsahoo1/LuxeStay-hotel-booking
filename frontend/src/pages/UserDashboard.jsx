import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { FiBookOpen, FiHeart, FiUser, FiLogOut, FiCalendar, FiMapPin, FiChevronRight, FiEdit3, FiSave, FiX } from 'react-icons/fi'
import { logout, updateProfile } from '../store/slices/authSlice'
import api from '../services/api'
import { Spinner } from '../components/common/ProtectedRoute'
import HotelCard from '../components/hotels/HotelCard'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  checked_in: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checked_out: 'bg-dark-700 text-dark-400 border-dark-600',
}

function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    api.get('/bookings/my-bookings').then((r) => setBookings(r.data.bookings)).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(id)
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelled by guest' })
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b))
      toast.success('Booking cancelled successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div>
      <h2 className="font-display text-2xl text-white mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏨</div>
          <h3 className="font-display text-xl text-white mb-2">No bookings yet</h3>
          <p className="text-dark-400 mb-6">Your booking history will appear here</p>
          <Link to="/hotels" className="btn-primary">Explore Hotels</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="glass p-5 hover:border-dark-600 transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={booking.hotel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                  alt={booking.hotel?.name}
                  className="w-full sm:w-32 h-28 sm:h-24 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-display text-lg text-white">{booking.hotel?.name}</h3>
                      <p className="text-dark-400 text-sm">{booking.room?.name} · {booking.roomsBooked} Room{booking.roomsBooked > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`badge border ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending} capitalize`}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-dark-400">
                    <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5 text-primary-400" />{new Date(booking.checkIn).toLocaleDateString('en-IN')} → {new Date(booking.checkOut).toLocaleDateString('en-IN')}</span>
                    <span className="flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5 text-primary-400" />{booking.hotel?.location?.city}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <p className="font-semibold text-white">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                    <div className="flex gap-2">
                      <Link to={`/booking/confirmation/${booking._id}`} className="text-sm px-4 py-1.5 rounded-lg border border-dark-600 text-dark-300 hover:border-primary-500/40 hover:text-primary-300 transition-all">
                        View Details
                      </Link>
                      {['confirmed', 'pending'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="text-sm px-4 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Wishlist() {
  const { user } = useSelector((s) => s.auth)
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.wishlist?.length) {
      api.get('/auth/me').then((r) => setHotels(r.data.user.wishlist || [])).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user?.wishlist?.length])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div>
      <h2 className="font-display text-2xl text-white mb-6">My Wishlist</h2>
      {hotels.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="font-display text-xl text-white mb-2">No saved hotels</h3>
          <p className="text-dark-400 mb-6">Save your favourite hotels for quick access</p>
          <Link to="/hotels" className="btn-primary">Browse Hotels</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotels.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}
        </div>
      )}
    </div>
  )
}

function Profile() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((s) => s.auth)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })

  const handleSave = () => {
    dispatch(updateProfile(form))
    setEditing(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl text-white mb-6">Profile Settings</h2>
      <div className="glass p-6 mb-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-dark-700">
          <div className="relative">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=d4a842&color=0a0a0f&size=80`}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary-500/30"
            />
          </div>
          <div>
            <h3 className="font-display text-xl text-white">{user?.name}</h3>
            <p className="text-dark-400 text-sm">{user?.email}</p>
            <span className="badge bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs capitalize mt-1">{user?.role}</span>
          </div>
        </div>

        <div className="space-y-4">
          {[{ label: 'Full Name', key: 'name', val: form.name }, { label: 'Phone', key: 'phone', val: form.phone }].map((field) => (
            <div key={field.key}>
              <label className="label">{field.label}</label>
              {editing ? (
                <input
                  value={field.val}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-white bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm">
                  {field.val || '—'}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="label">Email Address</label>
            <p className="text-dark-400 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm">{user?.email} <span className="text-xs text-dark-500 ml-2">(cannot change)</span></p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2"><FiSave className="w-4 h-4" />{loading ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => setEditing(false)} className="btn-ghost border border-dark-600 flex items-center gap-2"><FiX className="w-4 h-4" />Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2"><FiEdit3 className="w-4 h-4" />Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((s) => s.auth)

  const navItems = [
    { path: '/dashboard', icon: FiBookOpen, label: 'My Bookings' },
    { path: '/dashboard/wishlist', icon: FiHeart, label: 'Wishlist' },
    { path: '/dashboard/profile', icon: FiUser, label: 'Profile' },
  ]

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="page-container mt-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="glass p-5 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-dark-700">
                <img
                  src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=d4a842&color=0a0a0f`}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-500/30"
                  alt={user?.name}
                />
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path
                  return (
                    <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20' : 'text-dark-400 hover:bg-dark-800 hover:text-white'}`}>
                      <item.icon className="w-4 h-4" />{item.label}
                    </Link>
                  )
                })}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:bg-dark-800 hover:text-primary-400 transition-all">
                    <FiChevronRight className="w-4 h-4" />Admin Panel
                  </Link>
                )}
              </nav>
              <div className="border-t border-dark-700 mt-4 pt-4">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
                  <FiLogOut className="w-4 h-4" />Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <Routes>
              <Route index element={<Bookings />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}
