import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiDownload, FiHome, FiCalendar, FiUsers, FiMapPin, FiPhone, FiMail, FiPrinter } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Spinner } from '../components/common/ProtectedRoute'

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const invoiceRef = useRef(null)

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then((r) => setBooking(r.data.booking))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load booking details.'))
      .finally(() => setLoading(false))
  }, [bookingId])

  const downloadPdf = async () => {
    if (!invoiceRef.current || !booking) return
    setPdfLoading(true)
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`LuxeStay-booking-${booking.bookingId || booking._id}.pdf`)
      toast.success('Invoice PDF downloaded successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate invoice PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen pt-20 flex items-center justify-center text-center px-4">
      <div>
        <h2 className="font-display text-2xl text-white mb-2">Booking not found</h2>
        {error ? <p className="text-dark-400 mb-4">{error}</p> : <p className="text-dark-400 mb-4">Please verify the booking confirmation link or contact support.</p>}
        <p className="text-dark-400 text-sm mb-4">Booking reference: <span className="font-mono text-primary-300">{bookingId || 'N/A'}</span></p>
        <Link to="/dashboard" className="btn-primary mt-4">Go to Dashboard</Link>
      </div>
    </div>
  )

  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="page-container mt-8 max-w-3xl mx-auto">
        {/* Success Banner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-display text-4xl text-white mb-2">Booking Confirmed!</h1>
          <p className="text-dark-400">Your booking has been successfully confirmed. A confirmation has been sent to your email.</p>
          <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <span className="text-dark-400 text-sm">Booking ID:</span>
            <span className="font-mono font-bold text-primary-300 text-sm">{booking.bookingId}</span>
          </div>
        </motion.div>

        {/* Booking Card */}
        <motion.div
          ref={invoiceRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-0 overflow-hidden mb-6"
          id="invoice"
        >
          <div className="bg-white text-slate-950">
            {/* Hotel Header */}
            <div className="relative h-36 overflow-hidden">
            <img
              src={booking.hotel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'}
              alt={booking.hotel?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-dark-950/70" />
            <div className="absolute bottom-4 left-6">
              <h2 className="font-display text-2xl text-white">{booking.hotel?.name}</h2>
              <div className="flex items-center gap-2 text-dark-300 text-sm mt-1">
                <FiMapPin className="w-3.5 h-3.5 text-primary-400" />
                {booking.hotel?.location?.city}, {booking.hotel?.location?.state}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <span className={`badge px-3 py-1.5 text-sm font-semibold ${
                booking.paymentStatus === 'paid' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
                'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                {booking.paymentStatus?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Stay Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-dark-700">
              {[
                { icon: FiCalendar, label: 'Check-in', val: new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { icon: FiCalendar, label: 'Check-out', val: new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { icon: FiUsers, label: 'Guests', val: `${booking.guests?.adults} Adults${booking.guests?.children ? `, ${booking.guests.children} Children` : ''}` },
                { icon: FiHome, label: 'Nights', val: `${nights} Night${nights > 1 ? 's' : ''}` },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                  <p className="text-xs text-dark-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.val}</p>
                </div>
              ))}
            </div>

            {/* Room + Guest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-dark-700">
              <div>
                <p className="text-xs text-dark-500 uppercase tracking-wider mb-3">Room Details</p>
                <p className="font-medium text-white">{booking.room?.name}</p>
                <p className="text-dark-400 text-sm capitalize">{booking.room?.type} Room</p>
                <p className="text-dark-400 text-sm">{booking.roomsBooked} Room(s)</p>
              </div>
              <div>
                <p className="text-xs text-dark-500 uppercase tracking-wider mb-3">Guest Information</p>
                <p className="font-medium text-white">{booking.guestDetails?.firstName} {booking.guestDetails?.lastName}</p>
                <div className="flex items-center gap-2 text-dark-400 text-sm mt-1"><FiMail className="w-3.5 h-3.5" />{booking.guestDetails?.email}</div>
                <div className="flex items-center gap-2 text-dark-400 text-sm mt-1"><FiPhone className="w-3.5 h-3.5" />{booking.guestDetails?.phone}</div>
              </div>
            </div>

            {/* Add-ons */}
            {booking.addOns?.length > 0 && (
              <div className="mb-6 pb-6 border-b border-dark-700">
                <p className="text-xs text-dark-500 uppercase tracking-wider mb-3">Add-ons</p>
                <div className="space-y-2">
                  {booking.addOns.map((a, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-dark-300">{a.name}</span>
                      <span className="text-white">₹{a.price?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider mb-4">Payment Summary</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Base Price', val: booking.pricing?.basePrice },
                  booking.pricing?.discountAmount > 0 && { label: 'Room Discount', val: -booking.pricing.discountAmount, green: true },
                  booking.pricing?.addOnsTotal > 0 && { label: 'Add-ons', val: booking.pricing.addOnsTotal },
                  booking.pricing?.couponDiscount > 0 && { label: `Coupon (${booking.coupon?.code})`, val: -booking.pricing.couponDiscount, green: true },
                  { label: `GST (${booking.pricing?.taxRate}%)`, val: booking.pricing?.taxAmount, light: true },
                  { label: 'Service Fee', val: booking.pricing?.serviceFee, light: true },
                ].filter(Boolean).map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className={item.light ? 'text-dark-500' : 'text-dark-300'}>{item.label}</span>
                    <span className={item.green ? 'text-green-400' : item.light ? 'text-dark-400' : 'text-white'}>
                      {item.val < 0 ? '-' : ''}₹{Math.abs(item.val)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center border-t border-dark-700 pt-3 mt-3">
                  <span className="font-bold text-white">Total Paid</span>
                  <span className="text-xl font-bold text-gradient">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
          >
            <FiPrinter className="w-4 h-4" /> Print Invoice
          </button>
          <button
            onClick={downloadPdf}
            disabled={pdfLoading}
            className="btn-ghost border border-dark-600 flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiDownload className="w-4 h-4" /> {pdfLoading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
          <Link to="/dashboard" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            <FiHome className="w-4 h-4" /> My Bookings
          </Link>
        </motion.div>

        {/* Hotel Contact */}
        {booking.hotel?.contact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 glass p-5">
            <p className="text-sm font-medium text-white mb-3">Need help with your booking?</p>
            <div className="flex flex-wrap gap-4 text-sm text-dark-400">
              {booking.hotel.contact.phone && <a href={`tel:${booking.hotel.contact.phone}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors"><FiPhone className="w-4 h-4" />{booking.hotel.contact.phone}</a>}
              {booking.hotel.contact.email && <a href={`mailto:${booking.hotel.contact.email}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors"><FiMail className="w-4 h-4" />{booking.hotel.contact.email}</a>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
