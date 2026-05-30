import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  FiGrid, FiBookOpen, FiUsers, FiTag, FiLogOut,
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiStar,
  FiMenu, FiX, FiChevronRight, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'
import api from '../../services/api'
import { Spinner } from '../../components/common/ProtectedRoute'
import ThemeToggle from '../../components/common/ThemeToggle'
import AdminRooms from './AdminRooms'
import AdminBookings from './AdminBookings'
import AdminUsers from './AdminUsers'
import AdminCoupons from './AdminCoupons'
import AdminHotels from "./AdminHotels";

const CHART_COLORS = ['#d4a842', '#f0c866', '#e4a333', '#be6a13', '#9b4e13']

const NAV_ITEMS = [
  { path: '/admin', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/hotels', icon: FiGrid, label: 'Hotels' },
  { path: '/admin/rooms', icon: FiBookOpen, label: 'Rooms' },
  { path: '/admin/bookings', icon: FiBookOpen, label: 'Bookings' },
  { path: '/admin/users', icon: FiUsers, label: 'Users' },
  { path: '/admin/coupons', icon: FiTag, label: 'Coupons' },
]

function StatCard({ label, value, sub, icon: Icon, trend, loading }) {
  return (
    <div className="glass p-6 hover:border-primary-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-8 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
        </div>
      ) : (
        <>
          <p className="font-display text-3xl text-white mb-1">{value}</p>
          <p className="text-dark-400 text-sm">{label}</p>
          {sub && <p className="text-dark-500 text-xs mt-1">{sub}</p>}
        </>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 shadow-card">
      <p className="text-dark-400 text-xs mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue')
            ? `₹${entry.value.toLocaleString('en-IN')}`
            : entry.value}
        </p>
      ))}
    </div>
  )
}

function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const handleRefresh = () => { setRefreshing(true); fetchStats() }

  const statusPieData = stats?.bookingStatusDist?.map((s) => ({
    name: s._id?.replace('_', ' '),
    value: s.count
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Welcome back, Admin</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-ghost border border-dark-600 text-sm flex items-center gap-2 py-2 px-4">
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Revenue" value={`₹${(stats?.stats?.totalRevenue / 100000)?.toFixed(1) || '0'}L`} sub="All time" icon={FiDollarSign} trend={12} loading={loading} />
        <StatCard label="Total Bookings" value={stats?.stats?.totalBookings?.toLocaleString() || '—'} sub={`${stats?.stats?.thisMonthBookings || 0} this month`} icon={FiBookOpen} trend={stats?.stats?.bookingGrowth} loading={loading} />
        <StatCard label="Active Customers" value={stats?.stats?.totalUsers?.toLocaleString() || '—'} sub="Registered users" icon={FiUsers} loading={loading} />
        <StatCard label="Pending Reviews" value={stats?.stats?.pendingReviews || 0} sub="Awaiting moderation" icon={FiStar} loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass p-6">
          <h3 className="font-display text-lg text-white mb-5">Monthly Revenue</h3>
          {loading ? (
            <div className="skeleton h-56 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a842" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4a842" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a50" />
                <XAxis dataKey="month" stroke="#5a5a72" tick={{ fontSize: 12 }} />
                <YAxis stroke="#5a5a72" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#d4a842" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Booking Status Pie */}
        <div className="glass p-6">
          <h3 className="font-display text-lg text-white mb-5">Booking Status</h3>
          {loading ? (
            <div className="skeleton h-56 rounded-xl" />
          ) : statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n?.charAt(0).toUpperCase() + n?.slice(1)]} contentStyle={{ background: '#17171f', border: '1px solid #3a3a50', borderRadius: '12px' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#a8a8b8', fontSize: 12, textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-dark-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Bookings + Top Hotels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg text-white">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <FiChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentBookings || []).slice(0, 6).map((b) => (
                <div key={b._id} className="flex items-center justify-between py-2.5 border-b border-dark-800 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center shrink-0">
                      <FiBookOpen className="w-3.5 h-3.5 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{b.user?.name || 'Guest'}</p>
                      <p className="text-xs text-dark-500 truncate">{b.hotel?.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-medium text-white">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      b.status === 'confirmed' ? 'text-green-400 bg-green-500/10' :
                      b.status === 'pending' ? 'text-yellow-400 bg-yellow-500/10' :
                      'text-red-400 bg-red-500/10'
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Hotels */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg text-white">Top Hotels</h3>
            <Link to="/admin/hotels" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              Manage <FiChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {(stats?.topHotels || []).map((h, i) => (
                <div key={h._id} className="flex items-center justify-between py-2.5 border-b border-dark-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">{i + 1}</span>
                    <div>
                      <p className="text-sm text-white">{h.hotel?.name}</p>
                      <p className="text-xs text-dark-500">{h.hotel?.['location.city']} · {h.bookings} bookings</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-primary-300">₹{(h.revenue / 1000)?.toFixed(0)}K</p>
                </div>
              ))}
              {!(stats?.topHotels?.length) && (
                <div className="text-center py-8 text-dark-500 text-sm">No booking data yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((s) => s.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path)

  return (
    <div className="h-screen bg-dark-950 flex overflow-hidden">
      {/* Sidebar - Always Visible on Desktop, Hidden on Mobile */}
      <aside className={`w-64 bg-dark-900 border-r border-dark-800 flex flex-col h-screen fixed lg:static z-50 lg:z-auto transform lg:transform-none transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-dark-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <span className="font-display font-bold text-dark-950 text-sm">L</span>
              </div>
              <div>
                <span className="font-display text-lg font-semibold text-white">LuxeStay</span>
                <span className="block text-xs text-primary-400">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Admin Profile */}
          <div className="p-4 border-b border-dark-800">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=d4a842&color=0a0a0f`}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-500/30"
                alt={user?.name}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar only on mobile (less than lg breakpoint)
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-dark-800 space-y-1">
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <span className="text-xs text-dark-500 font-medium">Theme</span>
              <ThemeToggle size="sm" />
            </div>
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-400 hover:bg-dark-800 hover:text-white transition-all">
              <FiChevronRight className="w-4 h-4" /> View Site
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
              <FiLogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-dark-950/70 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content - Remaining Space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-dark-800 text-dark-400">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex-1 lg:flex-none">
            <p className="text-dark-400 text-sm hidden lg:block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
