// Payment is handled inline within the booking flow (StepSummary).
// This page acts as a standalone payment page for direct access via /payment/:bookingId
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShield, FiArrowLeft } from 'react-icons/fi'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Spinner } from '../components/common/ProtectedRoute'

export default function PaymentPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then((r) => setBooking(r.data.booking))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [bookingId, navigate])

  const handlePay = async () => {
    setProcessing(true)

    if (!window.Razorpay) {
      toast.error('Payment gateway is not loaded yet. Please refresh the page and try again.')
      setProcessing(false)
      return
    }

    try {
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
        amount: booking.pricing.totalAmount,
      })
      const { order, keyId } = orderRes.data

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'LuxeStay',
        description: `Booking #${booking.bookingId}`,
        order_id: order.id,
        prefill: {
          name: `${booking.guestDetails?.firstName} ${booking.guestDetails?.lastName}`,
          email: booking.guestDetails?.email,
          contact: booking.guestDetails?.phone,
        },
        theme: { color: '#d4a842' },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success('Booking successful! Your booking has been confirmed.')
            setProcessing(false)
            const confirmationId = verifyRes.data.booking.bookingId || verifyRes.data.booking._id
            navigate(`/booking/confirmation/${confirmationId}`)
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed')
            setProcessing(false)
          }
        },
        modal: { ondismiss: () => setProcessing(false) }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', async (resp) => {
        await api.post('/payments/failed', { razorpay_order_id: order.id, error: resp.error })
        toast.error(`Payment failed: ${resp.error.description}`)
        setProcessing(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!booking) return null

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 group">
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <h1 className="font-display text-3xl text-white mb-2">Complete Payment</h1>
        <p className="text-dark-400 text-sm mb-6">Booking <span className="font-mono text-primary-400">{booking.bookingId}</span></p>

        <div className="space-y-3 mb-6 pb-6 border-b border-dark-700">
          <div className="flex justify-between text-sm"><span className="text-dark-400">Hotel</span><span className="text-white font-medium">{booking.hotel?.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-dark-400">Room</span><span className="text-white">{booking.room?.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-dark-400">Check-in</span><span className="text-white">{new Date(booking.checkIn).toLocaleDateString('en-IN')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-dark-400">Check-out</span><span className="text-white">{new Date(booking.checkOut).toLocaleDateString('en-IN')}</span></div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <span className="font-semibold text-white">Total Amount</span>
          <span className="text-2xl font-bold text-gradient">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
        </div>

        <button onClick={handlePay} disabled={processing || booking.paymentStatus === 'paid'} className="btn-primary w-full py-4 text-base">
          {booking.paymentStatus === 'paid' ? '✓ Already Paid' : processing ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" />Processing...</span> : <span className="flex items-center justify-center gap-2"><FiShield className="w-4 h-4" />Pay Securely</span>}
        </button>

        <p className="text-center text-xs text-dark-500 mt-4">Secured by Razorpay · 256-bit SSL encryption</p>
      </motion.div>
    </div>
  )
}
