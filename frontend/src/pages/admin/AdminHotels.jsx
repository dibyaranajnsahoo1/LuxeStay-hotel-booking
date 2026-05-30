import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiStar, FiMapPin, FiSave } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Spinner } from '../../components/common/ProtectedRoute'

const EMPTY_HOTEL = {
  name: '', description: '', shortDescription: '', starRating: 5, category: 'luxury',
  location: { address: '', city: '', state: '', country: 'India', pincode: '' },
  amenities: [], policies: { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Free cancellation up to 24 hours before check-in' },
  contact: { phone: '', email: '' }, isFeatured: false, isActive: true,
  images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', caption: 'Main view' }]
}

const AMENITY_OPTIONS = ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Parking', 'Airport Transfer', 'Business Center', 'Kids Club', 'Concierge', 'Laundry', 'Pet Friendly']

function HotelModal({ hotel, onClose, onSave }) {
  const [form, setForm] = useState(hotel || EMPTY_HOTEL)
  const [saving, setSaving] = useState(false)
  const [amenityInput, setAmenityInput] = useState('')

  const handleSave = async () => {
    if (!form.name || !form.description || !form.location.city) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (hotel?._id) {
        const res = await api.put(`/hotels/${hotel._id}`, form)
        onSave(res.data.hotel, 'update')
        toast.success('Hotel updated successfully')
      } else {
        const res = await api.post('/hotels', form)
        onSave(res.data.hotel, 'create')
        toast.success('Hotel created successfully')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save hotel')
    } finally {
      setSaving(false)
    }
  }

  const addAmenity = (a) => {
    if (!form.amenities.includes(a)) setForm((p) => ({ ...p, amenities: [...p.amenities, a] }))
  }
  const removeAmenity = (a) => setForm((p) => ({ ...p, amenities: p.amenities.filter((x) => x !== a) }))

  const set = (path, value) => {
    const keys = path.split('.')
    if (keys.length === 1) { setForm((p) => ({ ...p, [path]: value })); return }
    setForm((p) => ({ ...p, [keys[0]]: { ...p[keys[0]], [keys[1]]: value } }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto bg-dark-950/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl bg-dark-900 border border-dark-700 rounded-2xl shadow-card-hover mb-8">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="font-display text-xl text-white">{hotel?._id ? 'Edit Hotel' : 'Add New Hotel'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-800 text-dark-400"><FiX /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Hotel Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" placeholder="e.g. The Grand Palace Hotel" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
                {['luxury', 'boutique', 'business', 'resort', 'heritage', 'budget'].map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Star Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => set('starRating', s)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${form.starRating >= s ? 'text-primary-400' : 'text-dark-600 bg-dark-800 border border-dark-700'}`}>
                    <FiStar className={`w-4 h-4 ${form.starRating >= s ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Short Description</label>
            <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className="input-field" placeholder="Brief tagline (max 300 chars)" />
          </div>
          <div>
            <label className="label">Full Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className="input-field resize-none" placeholder="Detailed hotel description..." />
          </div>

          {/* Location */}
          <div>
            <label className="label text-sm font-semibold text-dark-300 mb-3 block">📍 Location</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className="label text-xs">Street Address *</label><input value={form.location.address} onChange={(e) => set('location.address', e.target.value)} className="input-field text-sm" placeholder="123 Hotel Street" /></div>
              <div><label className="label text-xs">City *</label><input value={form.location.city} onChange={(e) => set('location.city', e.target.value)} className="input-field text-sm" placeholder="Mumbai" /></div>
              <div><label className="label text-xs">State *</label><input value={form.location.state} onChange={(e) => set('location.state', e.target.value)} className="input-field text-sm" placeholder="Maharashtra" /></div>
              <div><label className="label text-xs">Pincode</label><input value={form.location.pincode} onChange={(e) => set('location.pincode', e.target.value)} className="input-field text-sm" placeholder="400001" /></div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="label text-sm font-semibold text-dark-300 mb-3 block">🏊 Amenities</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {AMENITY_OPTIONS.map((a) => (
                <button key={a} type="button" onClick={() => form.amenities.includes(a) ? removeAmenity(a) : addAmenity(a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.amenities.includes(a) ? 'border-primary-500 bg-primary-500/20 text-primary-300' : 'border-dark-600 text-dark-400 hover:border-dark-500'}`}>{a}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} className="input-field text-sm flex-1" placeholder="Custom amenity..." onKeyDown={(e) => { if (e.key === 'Enter' && amenityInput.trim()) { addAmenity(amenityInput.trim()); setAmenityInput('') } }} />
              <button type="button" onClick={() => { if (amenityInput.trim()) { addAmenity(amenityInput.trim()); setAmenityInput('') } }} className="btn-secondary text-sm py-2 px-4">Add</button>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Contact Phone</label><input value={form.contact.phone} onChange={(e) => set('contact.phone', e.target.value)} className="input-field" placeholder="+91-22-1234-5678" /></div>
            <div><label className="label">Contact Email</label><input value={form.contact.email} onChange={(e) => set('contact.email', e.target.value)} className="input-field" placeholder="info@hotel.com" /></div>
          </div>

          {/* Image URL */}
          <div>
            <label className="label">Main Image URL</label>
            <input value={form.images?.[0]?.url || ''} onChange={(e) => setForm((p) => ({ ...p, images: [{ url: e.target.value, caption: 'Main view' }, ...(p.images?.slice(1) || [])] }))} className="input-field" placeholder="https://images.unsplash.com/..." />
            {form.images?.[0]?.url && <img src={form.images[0].url} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-xl" onError={(e) => e.target.style.display = 'none'} />}
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-primary-500' : 'bg-dark-700'} relative`} onClick={() => set('isFeatured', !form.isFeatured)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-dark-300">Featured Hotel</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-dark-700'} relative`} onClick={() => set('isActive', !form.isActive)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-dark-300">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-dark-700">
          <button onClick={onClose} className="btn-ghost border border-dark-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Spinner size="sm" />Saving...</> : <><FiSave className="w-4 h-4" />{hotel?._id ? 'Update Hotel' : 'Create Hotel'}</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminHotels() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalHotel, setModalHotel] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get(`/hotels?search=${search}&limit=50`).then((r) => setHotels(r.data.hotels)).finally(() => setLoading(false))
  }, [search])

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this hotel?')) return
    setDeleting(id)
    try {
      await api.delete(`/hotels/${id}`)
      setHotels((prev) => prev.filter((h) => h._id !== id))
      toast.success('Hotel deactivated')
    } catch { toast.error('Failed to deactivate') } finally { setDeleting(null) }
  }

  const handleSave = (hotel, action) => {
    if (action === 'create') setHotels((prev) => [hotel, ...prev])
    else setHotels((prev) => prev.map((h) => h._id === hotel._id ? hotel : h))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-white">Hotels</h1>
          <p className="text-dark-400 text-sm mt-1">{hotels.length} properties</p>
        </div>
        <button onClick={() => { setModalHotel(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Hotel
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hotels..." className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel) => (
            <motion.div key={hotel._id} layout className="glass p-4 flex items-center gap-4">
              <img src={hotel.images?.[0]?.url} alt={hotel.name} className="w-16 h-14 rounded-xl object-cover shrink-0" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white">{hotel.name}</h3>
                  {hotel.isFeatured && <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs">Featured</span>}
                  {!hotel.isActive && <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-xs">Inactive</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                  <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{hotel.location?.city}, {hotel.location?.state}</span>
                  <span className="flex items-center gap-1"><FiStar className="w-3 h-3 text-primary-400" />{hotel.ratings?.average?.toFixed(1)} ({hotel.ratings?.count})</span>
                  <span className="capitalize bg-dark-800 px-2 py-0.5 rounded">{hotel.category}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setModalHotel(hotel); setShowModal(true) }} className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition-all">
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(hotel._id)} disabled={deleting === hotel._id} className="p-2 rounded-xl bg-dark-800 hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-all">
                  {deleting === hotel._id ? <Spinner size="sm" /> : <FiTrash2 className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <HotelModal hotel={modalHotel} onClose={() => setShowModal(false)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  )
}
