import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiMapPin, FiStar, FiHeart, FiWifi, FiDroplet, FiUsers } from 'react-icons/fi'
import { toggleWishlist } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const AMENITY_ICONS = { 'Free WiFi': FiWifi, 'Swimming Pool': FiDroplet, 'Gym': FiUsers }

export default function HotelCard({ hotel, className = '' }) {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [imgError, setImgError] = useState(false)
  const [wishlisting, setWishlisting] = useState(false)

  const isWishlisted = user?.wishlist?.includes(hotel._id)
  const mainImage = hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
  const displayAmenities = hotel.amenities?.slice(0, 3) || []

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login to save hotels'); return }
    setWishlisting(true)
    await dispatch(toggleWishlist(hotel._id))
    setWishlisting(false)
  }

  const discountedPrice = hotel.priceRange?.min
  const categoryColors = {
    luxury: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    heritage: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resort: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    boutique: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    business: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    budget: 'bg-green-500/10 text-green-400 border-green-500/20',
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={`card group ${className}`}>
      <Link to={`/hotels/${hotel._id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden h-56">
          <img
            src={imgError ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' : mainImage}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-card-gradient" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`badge border ${categoryColors[hotel.category] || categoryColors.luxury} capitalize`}>
              {hotel.category}
            </span>
            {hotel.isFeatured && (
              <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">Featured</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlisting}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted ? 'bg-red-500 text-white shadow-lg' : 'bg-dark-950/70 text-dark-300 hover:bg-dark-800 hover:text-red-400'
            }`}
          >
            <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Star Rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            {Array.from({ length: hotel.starRating || 5 }, (_, i) => (
              <FiStar key={i} className="w-3 h-3 text-primary-400 fill-current" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-lg text-white font-medium leading-tight group-hover:text-primary-300 transition-colors line-clamp-1">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <FiStar className="w-3.5 h-3.5 text-primary-400 fill-current" />
              <span className="text-sm font-semibold text-white">{hotel.ratings?.average?.toFixed(1) || '4.8'}</span>
              <span className="text-xs text-dark-500">({hotel.ratings?.count || 0})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-dark-400 text-sm mb-3">
            <FiMapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
            <span className="truncate">{hotel.location?.city}, {hotel.location?.state}</span>
          </div>

          {/* Amenities */}
          {displayAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {displayAmenities.map((a) => (
                <span key={a} className="text-xs px-2 py-1 rounded-lg bg-dark-800 text-dark-400 border border-dark-700">
                  {a}
                </span>
              ))}
              {(hotel.amenities?.length || 0) > 3 && (
                <span className="text-xs px-2 py-1 rounded-lg bg-dark-800 text-primary-500 border border-dark-700">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between border-t border-dark-700 pt-4">
            <div>
              <span className="text-xs text-dark-500">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  ₹{discountedPrice?.toLocaleString('en-IN') || '8,999'}
                </span>
                <span className="text-dark-500 text-xs">/night</span>
              </div>
            </div>
            <span className="btn-primary text-sm py-2 px-4">Book Now</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
