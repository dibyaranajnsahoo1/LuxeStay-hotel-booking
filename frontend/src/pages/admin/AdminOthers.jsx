// ==================== ADMIN ROOMS ====================
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Spinner } from '../../components/common/ProtectedRoute'

const EMPTY_ROOM = {
  hotel: '', name: '', type: 'deluxe', description: '', pricePerNight: 5000, discountPercent: 0,
  maxOccupancy: { adults: 2, children: 1 }, bedConfiguration: 'king', bedCount: 1,
  size: { value: 400, unit: 'sqft' }, view: 'city', totalRooms: 5, isActive: true,
  images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', caption: 'Room view' }],
  amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar']
}

function RoomModal({ room, hotels, onClose, onSave }) {
  const [form, setForm] = useState(room || { ...EMPTY_ROOM })
  const [saving, setSaving] = useState(false)

  const set = (path, value) => {
    const keys = path.split('.')
    if (keys.length === 1) { setForm((p) => ({ ...p, [path]: value })); return }
    setForm((p) => ({ ...p, [keys[0]]: { ...p[keys[0]], [keys[1]]: value } }))
  }

  const handleSave = async () => {
    if (!form.hotel || !form.name || !form.pricePerNight) { toast.error('Please fill required fields'); return }
    setSaving(true)
    try {
      if (room?._id) {
        const res = await api.put(`/rooms/${room._id}`, form)
        onSave(res.data.room, 'update')
        toast.success('Room updated')
      } else {
        const res = await api.post('/rooms', form)
        onSave(res.data.room, 'create')
        toast.success('Room created')
      }
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto bg-dark-950/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-dark-900 border border-dark-700 rounded-2xl shadow-card-hover mb-8">
        <div className="flex items-center justify-between p-5 border-b border-dark-700">
          <h2 className="font-display text-lg text-white">{room?._id ? 'Edit Room' : 'Add New Room'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-800 text-dark-400"><FiX /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="label">Hotel *</label>
            <select value={form.hotel} onChange={(e) => set('hotel', e.target.value)} className="input-field">
              <option value="">Select Hotel</option>
              {hotels.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Room Name *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" placeholder="Deluxe King Room" /></div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className="input-field">
                {['standard', 'deluxe', 'suite', 'presidential', 'villa', 'penthouse', 'studio'].map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Description *</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="input-field resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Price/Night (₹) *</label><input type="number" value={form.pricePerNight} onChange={(e) => set('pricePerNight', e.target.value)} className="input-field" /></div>
            <div><label className="label">Discount (%)</label><input type="number" value={form.discountPercent} onChange={(e) => set('discountPercent', e.target.value)} min="0" max="100" className="input-field" /></div>
            <div><label className="label">Max Adults</label><input type="number" value={form.maxOccupancy.adults} onChange={(e) => set('maxOccupancy.adults', e.target.value)} min="1" className="input-field" /></div>
            <div><label className="label">Total Rooms</label><input type="number" value={form.totalRooms} onChange={(e) => set('totalRooms', e.target.value)} min="1" className="input-field" /></div>
            <div>
              <label className="label">Bed Config</label>
              <select value={form.bedConfiguration} onChange={(e) => set('bedConfiguration', e.target.value)} className="input-field">
                {['single', 'double', 'twin', 'king', 'queen', 'bunk'].map((b) => <option key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">View</label>
              <select value={form.view} onChange={(e) => set('view', e.target.value)} className="input-field">
                {['city', 'garden', 'pool', 'sea', 'mountain', 'courtyard', 'none'].map((v) => <option key={v} value={v} className="capitalize">{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Room Size (sq ft)</label><input type="number" value={form.size.value} onChange={(e) => set('size.value', e.target.value)} className="input-field" /></div>
          <div><label className="label">Image URL</label><input value={form.images?.[0]?.url || ''} onChange={(e) => setForm((p) => ({ ...p, images: [{ url: e.target.value, caption: 'Room' }] }))} className="input-field" placeholder="https://images.unsplash.com/..." /></div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-dark-700">
          <button onClick={onClose} className="btn-ghost border border-dark-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Spinner size="sm" />Saving...</> : <><FiSave className="w-4 h-4" />{room?._id ? 'Update' : 'Create'}</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalRoom, setModalRoom] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([api.get('/rooms'), api.get('/hotels?limit=100')]).then(([r, h]) => {
      setRooms(r.data.rooms)
      setHotels(h.data.hotels)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = rooms.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()) || r.hotel?.name?.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this room?')) return
    await api.delete(`/rooms/${id}`)
    setRooms((p) => p.filter((r) => r._id !== id))
    toast.success('Room deactivated')
  }

  const handleSave = (room, action) => {
    if (action === 'create') setRooms((p) => [room, ...p])
    else setRooms((p) => p.map((r) => r._id === room._id ? room : r))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl text-white">Rooms</h1><p className="text-dark-400 text-sm mt-1">{rooms.length} rooms</p></div>
        <button onClick={() => { setModalRoom(null); setShowModal(true) }} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" />Add Room</button>
      </div>
      <div className="relative mb-5"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms..." className="input-field pl-10" /></div>
      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="space-y-3">
          {filtered.map((room) => (
            <div key={room._id} className="glass p-4 flex items-center gap-4">
              <img src={room.images?.[0]?.url} alt={room.name} className="w-16 h-14 rounded-xl object-cover shrink-0" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{room.name}</p>
                <div className="flex flex-wrap gap-3 text-xs text-dark-400 mt-1">
                  <span>{room.hotel?.name || 'Unknown Hotel'}</span>
                  <span className="capitalize">{room.type}</span>
                  <span>₹{room.pricePerNight?.toLocaleString('en-IN')}/night</span>
                  {room.discountPercent > 0 && <span className="text-green-400">{room.discountPercent}% off</span>}
                  <span>{room.totalRooms} units</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setModalRoom(room); setShowModal(true) }} className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition-all"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(room._id)} className="p-2 rounded-xl bg-dark-800 hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-all"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>{showModal && <RoomModal room={modalRoom} hotels={hotels} onClose={() => setShowModal(false)} onSave={handleSave} />}</AnimatePresence>
    </div>
  )
}

// ==================== ADMIN BOOKINGS ====================
export function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.get(`/bookings?status=${statusFilter}&page=${page}&limit=20`).then((r) => { setBookings(r.data.bookings); setTotal(r.data.total) }).finally(() => setLoading(false))
  }, [statusFilter, page])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      setBookings((p) => p.map((b) => b._id === id ? { ...b, status } : b))
      toast.success('Status updated')
    } catch { toast.error('Failed to update status') }
  }

  const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
  const STATUS_COLORS = { confirmed: 'text-green-400', pending: 'text-yellow-400', cancelled: 'text-red-400', checked_in: 'text-blue-400', checked_out: 'text-dark-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl text-white">Bookings</h1><p className="text-dark-400 text-sm mt-1">{total} total bookings</p></div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-48 text-sm">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ') : 'All Status'}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="glass p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg">{b.bookingId}</span>
                    <span className={`text-xs font-medium capitalize ${STATUS_COLORS[b.status] || 'text-dark-400'}`}>{b.status?.replace('_', ' ')}</span>
                    <span className={`text-xs capitalize ${b.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>Payment: {b.paymentStatus}</span>
                  </div>
                  <p className="font-medium text-white mt-1">{b.hotel?.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-dark-400 mt-1">
                    <span>👤 {b.user?.name} ({b.user?.email})</span>
                    <span>🛏️ {b.room?.name}</span>
                    <span>📅 {new Date(b.checkIn).toLocaleDateString('en-IN')} → {new Date(b.checkOut).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-bold text-white">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                  <select value={b.status} onChange={(e) => updateStatus(b._id, e.target.value)} className="text-xs bg-dark-800 border border-dark-600 rounded-lg px-2 py-1.5 text-dark-300 cursor-pointer">
                    {STATUS_OPTIONS.slice(1).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== ADMIN USERS ====================
export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get(`/admin/users?search=${search}&limit=50`).then((r) => setUsers(r.data.users)).finally(() => setLoading(false))
  }, [search])

  const toggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`)
      setUsers((p) => p.map((u) => u._id === id ? { ...u, isActive: res.data.user.isActive } : u))
      toast.success(res.data.message)
    } catch { toast.error('Failed to update') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl text-white">Users</h1><p className="text-dark-400 text-sm mt-1">{users.length} users</p></div>
      </div>
      <div className="relative mb-5"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-10" /></div>
      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="glass p-4 flex items-center gap-4">
              <img src={u.avatar?.url || `https://ui-avatars.com/api/?name=${u.name}&background=d4a842&color=0a0a0f`} className="w-10 h-10 rounded-xl object-cover shrink-0" alt={u.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white">{u.name}</p>
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-dark-800 text-dark-400 border border-dark-700'}`}>{u.role}</span>
                  {!u.isActive && <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-xs">Inactive</span>}
                </div>
                <p className="text-dark-400 text-sm">{u.email}</p>
                <p className="text-dark-500 text-xs">Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              {u.role !== 'admin' && (
                <button onClick={() => toggleStatus(u._id)} className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== ADMIN COUPONS ====================
const EMPTY_COUPON = { code: '', description: '', discountType: 'percentage', discountValue: 10, maxDiscount: 2000, minOrderAmount: 1000, usageLimit: 100, validFrom: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isActive: true }

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState(coupon ? { ...coupon, validFrom: coupon.validFrom?.split('T')[0], validUntil: coupon.validUntil?.split('T')[0] } : EMPTY_COUPON)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      if (coupon?._id) {
        const res = await api.put(`/coupons/${coupon._id}`, form)
        onSave(res.data.coupon, 'update'); toast.success('Coupon updated')
      } else {
        const res = await api.post('/coupons', form)
        onSave(res.data.coupon, 'create'); toast.success('Coupon created')
      }
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-700">
          <h2 className="font-display text-lg text-white">{coupon?._id ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-800 text-dark-400"><FiX /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Coupon Code *</label><input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="input-field font-mono uppercase" placeholder="SAVE20" /></div>
            <div>
              <label className="label">Discount Type</label>
              <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))} className="input-field">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
          </div>
          <div><label className="label">Description *</label><input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">{form.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'}</label><input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} className="input-field" /></div>
            {form.discountType === 'percentage' && <div><label className="label">Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))} className="input-field" /></div>}
            <div><label className="label">Min Order (₹)</label><input type="number" value={form.minOrderAmount} onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Usage Limit</label><input type="number" value={form.usageLimit || ''} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value || null }))} className="input-field" placeholder="Unlimited" /></div>
            <div><label className="label">Valid From</label><input type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Valid Until</label><input type="date" value={form.validUntil} onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))} className="input-field" /></div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-dark-700'} relative`} onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-dark-300">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-dark-700">
          <button onClick={onClose} className="btn-ghost border border-dark-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Spinner size="sm" />Saving...</> : <><FiSave className="w-4 h-4" />{coupon?._id ? 'Update' : 'Create'}</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCoupon, setModalCoupon] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { api.get('/coupons').then((r) => setCoupons(r.data.coupons)).finally(() => setLoading(false)) }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    await api.delete(`/coupons/${id}`)
    setCoupons((p) => p.filter((c) => c._id !== id))
    toast.success('Coupon deleted')
  }

  const handleSave = (coupon, action) => {
    if (action === 'create') setCoupons((p) => [coupon, ...p])
    else setCoupons((p) => p.map((c) => c._id === coupon._id ? coupon : c))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl text-white">Coupons</h1><p className="text-dark-400 text-sm mt-1">{coupons.length} coupons</p></div>
        <button onClick={() => { setModalCoupon(null); setShowModal(true) }} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" />Create Coupon</button>
      </div>
      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c._id} className="glass p-5 hover:border-primary-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono font-bold text-lg text-primary-300">{c.code}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setModalCoupon(c); setShowModal(true) }} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white"><FiEdit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400"><FiTrash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-dark-300 text-sm mb-3">{c.description}</p>
              <div className="space-y-1.5 text-xs text-dark-400">
                <div className="flex justify-between"><span>Discount:</span><span className="text-primary-400 font-medium">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue?.toLocaleString('en-IN')}`}{c.maxDiscount ? ` (max ₹${c.maxDiscount?.toLocaleString('en-IN')})` : ''}</span></div>
                <div className="flex justify-between"><span>Min Order:</span><span>₹{c.minOrderAmount?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Used:</span><span>{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ' (unlimited)'}</span></div>
                <div className="flex justify-between"><span>Expires:</span><span>{new Date(c.validUntil).toLocaleDateString('en-IN')}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-dark-700">
                <span className={`badge text-xs ${c.isActive && new Date(c.validUntil) > new Date() ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-dark-800 text-dark-500 border border-dark-700'}`}>
                  {c.isActive && new Date(c.validUntil) > new Date() ? 'Active' : 'Inactive / Expired'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>{showModal && <CouponModal coupon={modalCoupon} onClose={() => setShowModal(false)} onSave={handleSave} />}</AnimatePresence>
    </div>
  )
}

export default AdminRooms
