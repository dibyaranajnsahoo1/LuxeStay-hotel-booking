import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiGrid, FiList, FiSearch, FiX, FiChevronDown, FiStar } from 'react-icons/fi'
import { fetchHotels } from '../store/slices/hotelSlice'
import HotelCard from '../components/hotels/HotelCard'
import { SkeletonCard } from '../components/common/ProtectedRoute'

const CATEGORIES = ['luxury', 'boutique', 'business', 'resort', 'heritage', 'budget']
const SORT_OPTIONS = [
  { value: '-ratings.average', label: 'Top Rated' },
  { value: 'priceRange.min', label: 'Price: Low to High' },
  { value: '-priceRange.min', label: 'Price: High to Low' },
  { value: '-createdAt', label: 'Newest First' },
]
const STAR_RATINGS = [5, 4, 3]
const AMENITIES = ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Parking']

export default function HotelListing() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hotels, loading, total, pages } = useSelector((s) => s.hotels)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    starRating: searchParams.get('starRating') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenities: [],
    sort: searchParams.get('sort') || '-ratings.average',
    page: 1,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const fetchData = useCallback(() => {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.starRating) params.starRating = filters.starRating
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.sort) params.sort = filters.sort
    params.page = filters.page
    params.limit = 12
    dispatch(fetchHotels(params))
  }, [filters, dispatch])

  useEffect(() => { fetchData() }, [fetchData])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', starRating: '', minPrice: '', maxPrice: '', amenities: [], sort: '-ratings.average', page: 1 })
    setSearchParams({})
  }

  const hasActiveFilters = filters.category || filters.starRating || filters.minPrice || filters.maxPrice || filters.amenities.length > 0

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-800 py-8">
        <div className="page-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-white mb-1">
                {filters.search ? `Hotels in "${filters.search}"` : 'All Hotels'}
              </h1>
              <p className="text-dark-400 text-sm">{total} properties found</p>
            </div>
            {/* Search Bar */}
            <div className="flex gap-3 max-w-lg w-full">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by city or hotel..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10 py-2.5 text-sm"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'}`}>
                <FiFilter className="w-4 h-4" /> Filters
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container mt-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-[280px] bg-dark-900 border border-dark-700 rounded-2xl p-5 sticky top-24">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg text-white">Filters</h3>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                        <FiX className="w-3 h-3" /> Clear all
                      </button>
                    )}
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-dark-200 mb-3">Category</h4>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                            filters.category === cat ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-dark-200 mb-3">Star Rating</h4>
                    {STAR_RATINGS.map((star) => (
                      <button
                        key={star}
                        onClick={() => handleFilterChange('starRating', filters.starRating == star ? '' : star)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1.5 text-sm transition-all ${
                          filters.starRating == star ? 'bg-primary-500/10 text-primary-300' : 'text-dark-300 hover:bg-dark-800'
                        }`}
                      >
                        <div className="flex">{Array.from({length: star}, (_, i) => <FiStar key={i} className="w-3 h-3 text-primary-400 fill-current" />)}</div>
                        <span>{star}+ Stars</span>
                      </button>
                    ))}
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-dark-200 mb-3">Price Range (per night)</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min ₹"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="input-field py-2 text-sm flex-1 min-w-0"
                      />
                      <input
                        type="number"
                        placeholder="Max ₹"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="input-field py-2 text-sm flex-1 min-w-0"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="text-sm font-semibold text-dark-200 mb-3">Amenities</h4>
                    {AMENITIES.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...filters.amenities, amenity]
                              : filters.amenities.filter((a) => a !== amenity)
                            handleFilterChange('amenities', updated)
                          }}
                          className="w-4 h-4 rounded border-dark-600 accent-primary-500"
                        />
                        <span className="text-sm text-dark-400 group-hover:text-dark-300 transition-colors">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-dark-400 text-sm">{loading ? 'Searching...' : `${total} properties`}</p>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="input-field py-2 text-sm pr-8 appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
                </div>
                {/* View Toggle */}
                <div className="flex gap-1 bg-dark-800 rounded-xl p-1 border border-dark-700">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-white'}`}>
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-white'}`}>
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hotel Grid */}
            {loading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="font-display text-2xl text-white mb-2">No hotels found</h3>
                <p className="text-dark-400 mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <motion.div
                layout
                className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
              >
                {hotels.map((hotel, i) => (
                  <motion.div key={hotel._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <HotelCard hotel={hotel} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      filters.page === p ? 'bg-primary-500 text-dark-950' : 'bg-dark-800 border border-dark-700 text-dark-400 hover:border-dark-500 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
