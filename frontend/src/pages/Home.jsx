import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiStar, FiArrowRight, FiShield, FiAward, FiClock, FiHeart } from 'react-icons/fi'
import { setSearchData } from '../store/slices/bookingSlice'
import { fetchFeaturedHotels } from '../store/slices/hotelSlice'
import HotelCard from '../components/hotels/HotelCard'
import { SkeletonCard } from '../components/common/ProtectedRoute'

const POPULAR_DESTINATIONS = [
  { city: 'Mumbai', hotels: '120+', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400' },
  { city: 'Goa', hotels: '85+', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400' },
  { city: 'Udaipur', hotels: '45+', image: 'https://images.unsplash.com/photo-1590104048440-56a5c0c37e5f?w=400' },
  { city: 'Bangalore', hotels: '98+', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400' },
  { city: 'Delhi', hotels: '150+', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400' },
  { city: 'Jaipur', hotels: '60+', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400' },
]

const STATS = [
  { value: '500+', label: 'Premium Hotels', icon: FiAward },
  { value: '50K+', label: 'Happy Guests', icon: FiHeart },
  { value: '4.9', label: 'Average Rating', icon: FiStar },
  { value: '24/7', label: 'Support', icon: FiClock },
]

const FEATURES = [
  { icon: FiShield, title: 'Secure Booking', desc: 'All payments are encrypted and 100% safe with Razorpay' },
  { icon: FiAward, title: 'Best Price Guarantee', desc: 'Find a lower price? We\'ll match it or refund the difference' },
  { icon: FiClock, title: 'Instant Confirmation', desc: 'Receive instant booking confirmation and e-voucher' },
  { icon: FiHeart, title: 'Handpicked Hotels', desc: 'Every hotel is personally vetted for quality and service' },
]

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { featuredHotels, loading } = useSelector((s) => s.hotels)

  const [searchForm, setSearchForm] = useState({
    location: '', checkIn: '', checkOut: '', adults: 2, children: 0, rooms: 1
  })

  useEffect(() => { dispatch(fetchFeaturedHotels()) }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setSearchData(searchForm))
    const params = new URLSearchParams()
    if (searchForm.location) params.set('city', searchForm.location)
    if (searchForm.checkIn) params.set('checkIn', searchForm.checkIn)
    if (searchForm.checkOut) params.set('checkOut', searchForm.checkOut)
    navigate(`/hotels?${params.toString()}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.4)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-transparent to-dark-950" />

        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-600/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 page-container text-center pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              India's Premier Luxury Hotel Booking Platform
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white leading-none mb-6">
              Stay in <span className="text-gradient italic">Luxury</span>
              <br />Across India
            </h1>

            <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-body font-light leading-relaxed">
              Discover handpicked luxury hotels, heritage palaces, and boutique resorts.
              Book seamlessly, pay securely, experience extraordinarily.
            </p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass max-w-4xl mx-auto p-4 md:p-6"
            >
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="lg:col-span-2">
                    <label className="label text-left text-xs">Destination</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="City, hotel name..."
                        value={searchForm.location}
                        onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label text-left text-xs">Check-in</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                      <input
                        type="date"
                        value={searchForm.checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSearchForm({ ...searchForm, checkIn: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label text-left text-xs">Check-out</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                      <input
                        type="date"
                        value={searchForm.checkOut}
                        min={searchForm.checkIn || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSearchForm({ ...searchForm, checkOut: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <label className="label text-xs text-left">Adults</label>
                      <div className="relative">
                        <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                        <select
                          value={searchForm.adults}
                          onChange={(e) => setSearchForm({ ...searchForm, adults: e.target.value })}
                          className="input-field pl-10 appearance-none"
                        >
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="label text-xs text-left">Rooms</label>
                      <select
                        value={searchForm.rooms}
                        onChange={(e) => setSearchForm({ ...searchForm, rooms: e.target.value })}
                        className="input-field appearance-none"
                      >
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full sm:w-auto px-8 py-3 mt-4 sm:mt-5">
                    <FiSearch className="w-4 h-4" />
                    Search Hotels
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-dark-900 border-y border-dark-800">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary-400" />
                  </div>
                </div>
                <div className="font-display text-3xl font-semibold text-gradient mb-1">{stat.value}</div>
                <div className="text-dark-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED HOTELS */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-primary-400 text-sm font-medium tracking-widest uppercase mb-2">Handpicked For You</p>
              <h2 className="section-title">Featured <em>Hotels</em></h2>
              <p className="section-subtitle">Extraordinary experiences await at India's most iconic properties</p>
            </div>
            <a href="/hotels" className="btn-secondary hidden md:flex items-center gap-2 text-sm">
              View All <FiArrowRight />
            </a>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : featuredHotels.slice(0, 6).map((hotel) => (
                <motion.div key={hotel._id} variants={itemVariants}>
                  <HotelCard hotel={hotel} />
                </motion.div>
              ))
            }
          </motion.div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="py-20 bg-dark-900/50">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-primary-400 text-sm font-medium tracking-widest uppercase mb-2">Explore India</p>
            <h2 className="section-title">Popular <em>Destinations</em></h2>
            <p className="section-subtitle">From coastal getaways to royal palaces, find your perfect stay</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <motion.a
                key={dest.city}
                href={`/hotels?city=${dest.city}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <img src={dest.image} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-white font-medium text-lg leading-none">{dest.city}</p>
                  <p className="text-primary-300 text-xs mt-1">{dest.hotels} hotels</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary-400 text-sm font-medium tracking-widest uppercase mb-2">Why LuxeStay</p>
            <h2 className="section-title">The <em>LuxeStay</em> Promise</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-7 group hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-5 group-hover:bg-primary-500/20 transition-all">
                  <f.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="font-display text-lg text-white mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-dark-900 to-dark-800 border border-dark-700 p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,66,0.1),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl text-white mb-4">Ready for Your <em className="text-gradient">Dream</em> Vacation?</h2>
              <p className="text-dark-400 mb-8 max-w-xl mx-auto">Join 50,000+ travelers who trust LuxeStay for their premium stays. Use code <span className="text-primary-400 font-semibold">WELCOME20</span> for 20% off your first booking.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/hotels" className="btn-primary px-8 py-4 text-base">Explore Hotels</a>
                <a href="/register" className="btn-secondary px-8 py-4 text-base">Sign Up Free</a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
