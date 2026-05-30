import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProfile } from './store/slices/authSlice'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import PageLoader from './components/common/PageLoader'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'
import ScrollToTop from './components/common/ScrollToTop'

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'))
const HotelListing = lazy(() => import('./pages/HotelListing'))
const HotelDetails = lazy(() => import('./pages/HotelDetails'))
const RoomDetails = lazy(() => import('./pages/RoomDetails'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((s) => s.auth)
  const { isDarkMode } = useSelector((s) => s.ui)
  const location = useLocation()

  // Apply dark/light class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (token) dispatch(getProfile())
  }, [token, dispatch])

  const isAdminPath = location.pathname.startsWith('/admin')
  const isAuthPath = ['/login', '/register', '/forgot-password'].includes(location.pathname)

  return (
    <>
      <ScrollToTop />
      {!isAdminPath && !isAuthPath && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<HotelListing />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected User Routes */}
          <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/booking/confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminPath && !isAuthPath && <Footer />}
    </>
  )
}
