import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'; import 'swiper/css/navigation'; import 'swiper/css/pagination'
import { FiArrowLeft, FiStar, FiUsers, FiMaximize2, FiEye, FiCheckCircle, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import { fetchRoom } from '../store/slices/hotelSlice'
import { setSelectedRoom, setPricing, setSearchData } from '../store/slices/bookingSlice'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function RoomDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedRoom: room, loading } = useSelector((s) => s.hotels)
  const { isAuthenticated } = useSelector((s) => s.auth)
  const { searchData } = useSelector((s) => s.booking)

  const [bookingDates, setBookingDates] = useState({ checkIn: searchData.checkIn || '', checkOut: searchData.checkOut || '', rooms: searchData.rooms || 1, adults: searchData.adults || 2 })
  const [availability, setAvailability] = useState(null)
  const [checkingAvail, setCheckingAvail] = useState(false)

  useEffect(() => { dispatch(fetchRoom(id)) }, [id, dispatch])

  const checkAvailability = async () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) { toast.error('Please select check-in and check-out dates'); return }
    setCheckingAvail(true)
    try {
      const res = await api.post(`/rooms/${id}/check-availability`, {
        checkIn: bookingDates.checkIn, checkOut: bookingDates.checkOut, roomsNeeded: bookingDates.rooms
      })
      setAvailability(res.data)
      if (res.data.isAvailable) {
        dispatch(setPricing(res.data.pricing))
        dispatch(setSearchData({ ...bookingDates }))
      }
    } catch (err) {
      toast.error('Failed to check availability')
    } finally {
      setCheckingAvail(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return }
    if (!availability?.isAvailable) { toast.error('Please check availability first'); return }
    dispatch(setSelectedRoom(room))
    dispatch(setSearchData(bookingDates))
    navigate('/booking')
  }

  if (loading || !room) {
    return (
      <div className="min-h-screen pt-20">
        <div className="page-container mt-6">
          <div className="skeleton h-[400px] rounded-2xl mb-6" />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
            <div className="skeleton h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const effectivePrice = room.pricePerNight * (1 - room.discountPercent / 100)
  const nights = bookingDates.checkIn && bookingDates.checkOut
    ? Math.ceil((new Date(bookingDates.checkOut) - new Date(bookingDates.checkIn)) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="page-container mt-6">
        {/* Back */}
        <Link to={room.hotel?._id ? `/hotels/${room.hotel._id}` : '/hotels'} className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 group">
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Hotel
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Info */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} className="rounded-2xl overflow-hidden h-[400px] mb-6">
              {room.images?.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img.url} alt={`Room ${i + 1}`} className="w-full h-full object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Room Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="badge bg-primary-500/10 border border-primary-500/20 text-primary-400 capitalize">{room.type}</span>
                {room.discountPercent > 0 && <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">{room.discountPercent}% OFF</span>}
              </div>
              <h1 className="font-display text-3xl text-white mb-2">{room.name}</h1>
              <p className="text-dark-400 text-sm">{room.hotel?.name} · {room.hotel?.location?.city}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {[
                  { icon: FiUsers, label: `${room.maxOccupancy?.adults} Adults, ${room.maxOccupancy?.children} Children`, title: 'Occupancy' },
                  { icon: FiMaximize2, label: `${room.size?.value} ${room.size?.unit}`, title: 'Room Size' },
                  { icon: FiEye, label: room.view?.charAt(0).toUpperCase() + room.view?.slice(1) + ' View', title: 'View' },
                  { icon: FiStar, label: `${room.bedCount} ${room.bedConfiguration?.charAt(0).toUpperCase() + room.bedConfiguration?.slice(1)} Bed${room.bedCount > 1 ? 's' : ''}`, title: 'Bed' },
                ].map((item) => (
                  <div key={item.title} className="glass p-4 text-center">
                    <item.icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                    <p className="text-xs text-dark-500 mb-0.5">{item.title}</p>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-display text-xl text-white mb-3">About This Room</h2>
              <p className="text-dark-300 leading-relaxed">{room.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h2 className="font-display text-xl text-white mb-4">Room Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {room.amenities?.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 p-3 bg-dark-900 rounded-xl border border-dark-700">
                    <FiCheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                    <span className="text-dark-300 text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="glass p-5">
              <h2 className="font-display text-xl text-white mb-4">Policies</h2>
              <div className="space-y-3">
                {[
                  { icon: '🕑', label: 'Check-in', val: room.hotel?.policies?.checkIn || '2:00 PM' },
                  { icon: '🕐', label: 'Check-out', val: room.hotel?.policies?.checkOut || '12:00 PM' },
                  { icon: '📋', label: 'Cancellation', val: room.hotel?.policies?.cancellation || 'Free cancellation 24h before' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-4 text-sm">
                    <span className="text-xl w-8">{p.icon}</span>
                    <span className="text-dark-400 w-24">{p.label}:</span>
                    <span className="text-dark-200">{p.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass p-6">
              {/* Price */}
              <div className="mb-5 pb-5 border-b border-dark-700">
                {room.discountPercent > 0 && (
                  <p className="text-dark-500 text-sm line-through">₹{room.pricePerNight?.toLocaleString('en-IN')}/night</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl text-white">₹{Math.round(effectivePrice)?.toLocaleString('en-IN')}</span>
                  <span className="text-dark-500 text-sm">/night</span>
                </div>
                {room.ratings?.count > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <FiStar className="w-3.5 h-3.5 text-primary-400 fill-current" />
                    <span className="text-sm text-white">{room.ratings.average?.toFixed(1)}</span>
                    <span className="text-dark-500 text-xs">({room.ratings.count} reviews)</span>
                  </div>
                )}
              </div>

              {/* Date Inputs */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="label text-xs">Check-in Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                    <input type="date" className="input-field pl-10 text-sm" min={new Date().toISOString().split('T')[0]} value={bookingDates.checkIn} onChange={(e) => { setBookingDates((p) => ({ ...p, checkIn: e.target.value })); setAvailability(null) }} />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Check-out Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                    <input type="date" className="input-field pl-10 text-sm" min={bookingDates.checkIn || new Date().toISOString().split('T')[0]} value={bookingDates.checkOut} onChange={(e) => { setBookingDates((p) => ({ ...p, checkOut: e.target.value })); setAvailability(null) }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">Rooms</label>
                    <select className="input-field text-sm" value={bookingDates.rooms} onChange={(e) => { setBookingDates((p) => ({ ...p, rooms: e.target.value })); setAvailability(null) }}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Guests</label>
                    <select className="input-field text-sm" value={bookingDates.adults} onChange={(e) => setBookingDates((p) => ({ ...p, adults: e.target.value }))}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability Result */}
              {availability && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${availability.isAvailable ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <FiAlertCircle className={`w-5 h-5 mt-0.5 ${availability.isAvailable ? 'text-green-400' : 'text-red-400'}`} />
                  <div>
                    <p className={`font-medium text-sm ${availability.isAvailable ? 'text-green-300' : 'text-red-300'}`}>
                      {availability.isAvailable ? '✓ Available for selected dates!' : '✗ Not available for selected dates'}
                    </p>
                    {availability.isAvailable && availability.pricing && (
                      <div className="mt-2 space-y-1 text-xs text-dark-300">
                        <p>{nights} nights × ₹{Math.round(availability.pricing.pricePerNight)?.toLocaleString('en-IN')} = ₹{availability.pricing.basePrice?.toLocaleString('en-IN')}</p>
                        <p>GST (18%): ₹{availability.pricing.taxAmount?.toLocaleString('en-IN')}</p>
                        <p>Service fee: ₹{availability.pricing.serviceFee?.toLocaleString('en-IN')}</p>
                        <p className="font-semibold text-white border-t border-dark-600 pt-1.5 mt-1.5">Total: ₹{availability.pricing.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              {!availability ? (
                <button onClick={checkAvailability} disabled={checkingAvail || !bookingDates.checkIn || !bookingDates.checkOut} className="btn-secondary w-full py-3 text-sm">
                  {checkingAvail ? 'Checking...' : 'Check Availability'}
                </button>
              ) : availability.isAvailable ? (
                <button onClick={handleBookNow} className="btn-primary w-full py-3">Book Now</button>
              ) : (
                <button onClick={() => { setAvailability(null); setBookingDates((p) => ({ ...p, checkIn: '', checkOut: '' })) }} className="btn-ghost w-full py-3 text-sm border border-dark-600">Try Different Dates</button>
              )}

              <p className="text-center text-xs text-dark-500 mt-4 flex items-center justify-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5 text-green-500" /> No charge until confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
