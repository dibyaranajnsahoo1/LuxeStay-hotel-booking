import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'; import 'swiper/css/navigation'; import 'swiper/css/pagination'
import { FiMapPin, FiStar, FiWifi, FiDroplet, FiCheckCircle, FiPhone, FiMail, FiHeart, FiShare2, FiArrowLeft, FiUsers, FiInfo } from 'react-icons/fi'
import { fetchHotel } from '../store/slices/hotelSlice'
import { toggleWishlist } from '../store/slices/authSlice'
import { setSearchData } from '../store/slices/bookingSlice'
import api from '../services/api'
import { SkeletonCard } from '../components/common/ProtectedRoute'
import toast from 'react-hot-toast'

const POLICY_ICONS = { checkIn: '🕑', checkOut: '🕐', cancellation: '📋', pets: '🐾', smoking: '🚭' }

export default function HotelDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedHotel: hotel, loading } = useSelector((s) => s.hotels)
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const { searchData } = useSelector((s) => s.booking)
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('rooms')

  useEffect(() => {
    dispatch(fetchHotel(id))
    api.get(`/reviews?hotelId=${id}&limit=5`).then((r) => setReviews(r.data.reviews || [])).catch(() => {})
  }, [id, dispatch])

  const isWishlisted = user?.wishlist?.includes(hotel?._id)

  const handleBookRoom = (room) => {
    if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return }
    dispatch(setSearchData({ selectedHotelId: hotel._id }))
    navigate(`/rooms/${room._id}`)
  }

  if (loading && !hotel) {
    return (
      <div className="min-h-screen pt-20">
        <div className="page-container mt-6">
          <div className="skeleton h-[450px] rounded-2xl mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!hotel) return null

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="page-container mt-6">
        {/* Back */}
        <Link to="/hotels" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm mb-6 group">
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Hotels
        </Link>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[480px] mb-8 rounded-3xl overflow-hidden">
          <div className="col-span-2 row-span-2 relative group">
            <img src={hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          {hotel.images?.slice(1, 5).map((img, i) => (
            <div key={i} className="relative overflow-hidden group">
              <img src={img.url} alt={`View ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {i === 3 && hotel.images?.length > 5 && (
                <div className="absolute inset-0 bg-dark-950/70 flex items-center justify-center text-white font-medium">
                  +{hotel.images.length - 5} more
                </div>
              )}
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 4 - (hotel.images?.length - 1 || 0)) }, (_, i) => (
            <div key={`empty-${i}`} className="bg-dark-800" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-primary-500/10 border border-primary-500/20 text-primary-400 capitalize">{hotel.category}</span>
                  <div className="flex">{Array.from({ length: hotel.starRating }, (_, i) => <FiStar key={i} className="w-3.5 h-3.5 text-primary-400 fill-current" />)}</div>
                </div>
                <h1 className="font-display text-4xl text-white mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-2 text-dark-400">
                  <FiMapPin className="w-4 h-4 text-primary-500" />
                  <span>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.state}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => isAuthenticated ? dispatch(toggleWishlist(hotel._id)) : navigate('/login')} className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center hover:border-red-500/40 hover:text-red-400 transition-all">
                    <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-400' : 'text-dark-400'}`} />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }} className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
                    <FiShare2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl">
                  <FiStar className="w-4 h-4 text-primary-400 fill-current" />
                  <span className="font-bold text-white">{hotel.ratings?.average?.toFixed(1)}</span>
                  <span className="text-dark-400 text-sm">({hotel.ratings?.count} reviews)</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700 mb-6">
              {['rooms', 'overview', 'amenities', 'policies', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-dark-200'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-dark-300 leading-relaxed mb-6">{hotel.description}</p>
                {hotel.contact && (
                  <div className="glass p-5 space-y-3">
                    <h3 className="font-display text-lg text-white mb-4">Contact</h3>
                    {hotel.contact.phone && <div className="flex items-center gap-3 text-dark-300 text-sm"><FiPhone className="text-primary-400" />{hotel.contact.phone}</div>}
                    {hotel.contact.email && <div className="flex items-center gap-3 text-dark-300 text-sm"><FiMail className="text-primary-400" />{hotel.contact.email}</div>}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'rooms' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {hotel.rooms?.length === 0 ? (
                  <div className="text-center py-10 text-dark-400">No rooms available</div>
                ) : (
                  hotel.rooms?.map((room) => (
                    <div key={room._id} className="card p-5 flex flex-col sm:flex-row gap-4">
                      <img src={room.images?.[0]?.url} alt={room.name} className="w-full sm:w-40 h-32 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display text-lg text-white">{room.name}</h3>
                            <p className="text-dark-400 text-sm capitalize">{room.type} · {room.bedConfiguration} bed · {room.size?.value} {room.size?.unit}</p>
                          </div>
                          {room.discountPercent > 0 && <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">{room.discountPercent}% OFF</span>}
                        </div>
                        <p className="text-dark-400 text-sm mt-2 line-clamp-2">{room.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.amenities?.slice(0, 4).map((a) => <span key={a} className="text-xs px-2 py-1 bg-dark-800 text-dark-400 rounded-lg">{a}</span>)}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            {room.discountPercent > 0 && <p className="text-dark-500 text-xs line-through">₹{room.pricePerNight?.toLocaleString('en-IN')}</p>}
                            <p className="text-xl font-bold text-white">₹{Math.round(room.pricePerNight * (1 - room.discountPercent / 100))?.toLocaleString('en-IN')} <span className="text-xs text-dark-500 font-normal">/night</span></p>
                          </div>
                          <button onClick={() => handleBookRoom(room)} className="btn-primary text-sm py-2 px-5">Book Now</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'amenities' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities?.map((a) => (
                    <div key={a} className="flex items-center gap-3 p-3 bg-dark-900 rounded-xl border border-dark-700">
                      <FiCheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                      <span className="text-dark-300 text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'policies' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-3">
                  {hotel.policies && Object.entries(hotel.policies).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-4 p-4 bg-dark-900 rounded-xl border border-dark-700">
                      <span className="text-xl">{POLICY_ICONS[key] || 'ℹ️'}</span>
                      <div>
                        <p className="font-medium text-white capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-dark-400 text-sm mt-0.5">{typeof val === 'boolean' ? (val ? 'Allowed' : 'Not allowed') : val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-dark-400">No reviews yet. Be the first to review!</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="glass p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <img src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.name}&background=d4a842&color=0a0a0f`} className="w-10 h-10 rounded-full object-cover" alt="" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-white text-sm">{review.user?.name}</p>
                              <div className="flex items-center gap-1">
                                <FiStar className="w-3.5 h-3.5 text-primary-400 fill-current" />
                                <span className="text-sm font-medium text-white">{review.rating?.overall}</span>
                              </div>
                            </div>
                            <p className="text-xs text-dark-500">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <h4 className="font-medium text-white text-sm mb-1">{review.title}</h4>
                        <p className="text-dark-400 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass p-6">
              <h3 className="font-display text-xl text-white mb-1">Reserve Your Stay</h3>
              <p className="text-dark-400 text-sm mb-5">Starting from <span className="text-primary-400 font-semibold">₹{hotel.priceRange?.min?.toLocaleString('en-IN')}/night</span></p>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="label text-xs">Check-in</label>
                  <input type="date" className="input-field text-sm" min={new Date().toISOString().split('T')[0]} defaultValue={searchData.checkIn} onChange={(e) => dispatch(setSearchData({ checkIn: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Check-out</label>
                  <input type="date" className="input-field text-sm" defaultValue={searchData.checkOut} onChange={(e) => dispatch(setSearchData({ checkOut: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Guests</label>
                  <select className="input-field text-sm" defaultValue={searchData.adults} onChange={(e) => dispatch(setSearchData({ adults: e.target.value }))}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => setActiveTab('rooms')} className="btn-primary w-full py-3">View Available Rooms</button>
              <div className="flex items-center gap-2 mt-4 text-dark-500 text-xs justify-center">
                <FiInfo className="w-3.5 h-3.5" />
                Free cancellation on most rooms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
