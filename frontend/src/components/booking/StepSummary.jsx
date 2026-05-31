import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { FiArrowLeft, FiTag, FiShield, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { prevStep, setCoupon, setCurrentBooking } from '../../store/slices/bookingSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function StepSummary() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedRoom, searchData, guestDetails, addOns, coupon } = useSelector((s) => s.booking)

  const [couponCode, setCouponCode] = useState(coupon?.code || '')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(coupon || null)
  const [processing, setProcessing] = useState(false)

  const nights = searchData.checkIn && searchData.checkOut
    ? Math.ceil((new Date(searchData.checkOut) - new Date(searchData.checkIn)) / (1000 * 60 * 60 * 24))
    : 1

  const effectivePrice = selectedRoom?.pricePerNight * (1 - selectedRoom?.discountPercent / 100)
  const basePrice = Math.round(effectivePrice * nights * (searchData.rooms || 1))
  const discountAmount = Math.round(selectedRoom?.pricePerNight * (selectedRoom?.discountPercent / 100) * nights * (searchData.rooms || 1))
  const addOnsTotal = addOns?.reduce((sum, a) => sum + a.price * (a.quantity || 1), 0) || 0
  const couponDiscount = appliedCoupon?.discount || 0
  const subtotal = basePrice + addOnsTotal - couponDiscount
  const taxAmount = Math.round(subtotal * 0.18)
  const serviceFee = Math.round(subtotal * 0.05)
  const totalAmount = subtotal + taxAmount + serviceFee

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, amount: basePrice + addOnsTotal })
      setAppliedCoupon(res.data)
      dispatch(setCoupon(res.data))
      toast.success(`Coupon applied! Saved ₹${res.data.discount?.toLocaleString('en-IN')}`)
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    dispatch(setCoupon(null))
  }

  const handleProceedToPayment = async () => {
    setProcessing(true)
    try {
      // Create booking
      const bookingRes = await api.post('/bookings', {
        roomId: selectedRoom._id,
        hotelId: selectedRoom.hotel?._id || searchData.selectedHotelId,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: { adults: Number(searchData.adults) || 2, children: Number(searchData.children) || 0 },
        roomsBooked: Number(searchData.rooms) || 1,
        guestDetails,
        addOns: addOns?.map((a) => ({ name: a.name, price: a.price, quantity: a.quantity || 1 })),
        couponCode: appliedCoupon?.coupon?.code || null,
      })
      const booking = bookingRes.data.booking
      dispatch(setCurrentBooking(booking))

      // Create Razorpay order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
        amount: totalAmount,
      })

      const { order, keyId } = orderRes.data

      // Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'LuxeStay',
        description: `Booking #${booking.bookingId}`,
        image: 'https://ui-avatars.com/api/?name=LuxeStay&background=d4a842&color=0a0a0f',
        order_id: order.id,
        prefill: {
          name: `${guestDetails.firstName} ${guestDetails.lastName}`,
          email: guestDetails.email,
          contact: guestDetails.phone,
        },
        theme: { color: '#d4a842' },
        modal: {
          ondismiss: () => { toast.error('Payment cancelled'); setProcessing(false) }
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success('Booking successful! Your booking has been confirmed.')
            const confirmationId = verifyRes.data.booking.bookingId || verifyRes.data.booking._id
            navigate(`/booking/confirmation/${confirmationId}`)
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.')
            setProcessing(false)
          }
        },
      }

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh.')
        setProcessing(false)
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', async (resp) => {
        await api.post('/payments/failed', { razorpay_order_id: order.id, error: resp.error })
        toast.error(`Payment failed: ${resp.error.description}`)
        setProcessing(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-display text-3xl text-white mb-2">Review & Pay</h2>
      <p className="text-dark-400 mb-8">Confirm your booking details and complete payment</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Summary */}
        <div className="lg:col-span-3 space-y-5">
          {/* Room Info */}
          <div className="glass p-5">
            <h3 className="font-medium text-white mb-4 text-sm uppercase tracking-wider text-dark-400">Room Details</h3>
            <div className="flex gap-4">
              <img src={selectedRoom?.images?.[0]?.url} alt="" className="w-24 h-20 rounded-xl object-cover shrink-0" />
              <div>
                <p className="font-display text-lg text-white">{selectedRoom?.name}</p>
                <p className="text-dark-400 text-sm capitalize">{selectedRoom?.type} · {nights} nights</p>
                <div className="flex gap-2 mt-2 text-xs text-dark-400">
                  <span>📅 {searchData.checkIn} → {searchData.checkOut}</span>
                </div>
                <div className="flex gap-2 mt-1 text-xs text-dark-400">
                  <span>👥 {searchData.adults || 2} Adults · {searchData.rooms || 1} Room(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="glass p-5">
            <h3 className="font-medium text-sm uppercase tracking-wider text-dark-400 mb-4">Guest Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-dark-500 text-xs">Name</p><p className="text-white">{guestDetails?.firstName} {guestDetails?.lastName}</p></div>
              <div><p className="text-dark-500 text-xs">Email</p><p className="text-white truncate">{guestDetails?.email}</p></div>
              <div><p className="text-dark-500 text-xs">Phone</p><p className="text-white">{guestDetails?.phone}</p></div>
              {guestDetails?.arrivalTime && <div><p className="text-dark-500 text-xs">Arrival</p><p className="text-white">{guestDetails.arrivalTime}</p></div>}
            </div>
            {guestDetails?.specialRequests && (
              <div className="mt-3 pt-3 border-t border-dark-700">
                <p className="text-dark-500 text-xs mb-1">Special Requests</p>
                <p className="text-dark-300 text-sm">{guestDetails.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Add-ons */}
          {addOns?.length > 0 && (
            <div className="glass p-5">
              <h3 className="font-medium text-sm uppercase tracking-wider text-dark-400 mb-4">Add-ons</h3>
              <div className="space-y-2">
                {addOns.map((a) => (
                  <div key={a.id} className="flex justify-between items-center text-sm">
                    <span className="text-dark-300">{a.icon} {a.name}</span>
                    <span className="text-white font-medium">₹{a.price?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon */}
          <div className="glass p-5">
            <h3 className="font-medium text-sm uppercase tracking-wider text-dark-400 mb-4">Promo Code</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-400 w-4 h-4" />
                  <span className="text-green-300 text-sm font-medium">{appliedCoupon.coupon?.code} applied</span>
                  <span className="text-xs text-dark-400">— Saved ₹{appliedCoupon.discount?.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                    className="input-field pl-10 text-sm uppercase"
                  />
                </div>
                <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode} className="btn-secondary text-sm py-2 px-5 whitespace-nowrap">
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{couponError}</p>}
            <p className="text-dark-500 text-xs mt-3">Try: WELCOME20, LUXE500, SUMMER15</p>
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 glass p-6">
            <h3 className="font-display text-lg text-white mb-5">Price Summary</h3>
            <div className="space-y-3 mb-5">
              <PriceLine label={`₹${Math.round(effectivePrice)?.toLocaleString('en-IN')} × ${nights} nights × ${searchData.rooms || 1} room`} value={basePrice} />
              {discountAmount > 0 && <PriceLine label={`Room Discount (${selectedRoom?.discountPercent}%)`} value={-discountAmount} highlight="green" />}
              {addOnsTotal > 0 && <PriceLine label="Add-ons" value={addOnsTotal} />}
              {couponDiscount > 0 && <PriceLine label={`Coupon (${appliedCoupon?.coupon?.code})`} value={-couponDiscount} highlight="green" />}
              <div className="border-t border-dark-700 pt-3">
                <PriceLine label="Subtotal" value={subtotal} />
                <PriceLine label="GST (18%)" value={taxAmount} small />
                <PriceLine label="Service Fee (5%)" value={serviceFee} small />
              </div>
              <div className="border-t border-dark-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-gradient">₹{totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button onClick={handleProceedToPayment} disabled={processing} className="btn-primary w-full py-4 text-base">
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiShield className="w-4 h-4" /> Pay ₹{totalAmount?.toLocaleString('en-IN')}
                </span>
              )}
            </button>

            <div className="mt-4 space-y-2">
              <p className="text-center text-xs text-dark-500 flex items-center justify-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-green-500" /> 100% Secure Payment via Razorpay
              </p>
              <div className="flex justify-center gap-3 opacity-60">
                {['Visa', 'Mastercard', 'UPI', 'NetBanking'].map((m) => (
                  <span key={m} className="text-xs px-2 py-0.5 bg-dark-800 rounded text-dark-400">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <button onClick={() => dispatch(prevStep())} className="btn-ghost border border-dark-600 flex items-center gap-2 text-sm">
          <FiArrowLeft /> Back to Add-ons
        </button>
      </div>
    </div>
  )
}

function PriceLine({ label, value, highlight, small }) {
  return (
    <div className={`flex justify-between items-center ${small ? 'text-sm' : ''}`}>
      <span className={small ? 'text-dark-500' : 'text-dark-300'}>{label}</span>
      <span className={`font-medium ${highlight === 'green' ? 'text-green-400' : small ? 'text-dark-400' : 'text-white'}`}>
        {value < 0 ? '-' : ''}₹{Math.abs(value)?.toLocaleString('en-IN')}
      </span>
    </div>
  )
}
