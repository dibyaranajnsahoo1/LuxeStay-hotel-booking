import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiMapPin, FiCalendar, FiUsers, FiStar } from 'react-icons/fi'
import { nextStep, prevStep, setGuestDetails, setAddOns } from '../../store/slices/bookingSlice'

// ===================== STEP 1: ROOM SELECT =====================
export function StepRoomSelect() {
  const dispatch = useDispatch()
  const { selectedRoom, searchData, pricing } = useSelector((s) => s.booking)
  if (!selectedRoom) return null
  const effectivePrice = selectedRoom.pricePerNight * (1 - selectedRoom.discountPercent / 100)
  const nights = searchData.checkIn && searchData.checkOut
    ? Math.ceil((new Date(searchData.checkOut) - new Date(searchData.checkIn)) / (1000 * 60 * 60 * 24))
    : 1

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-display text-3xl text-white mb-2">Your Selected Room</h2>
      <p className="text-dark-400 mb-8">Review your selection before proceeding</p>

      <div className="card p-0 overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <img src={selectedRoom.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'} alt={selectedRoom.name} className="h-60 md:h-full w-full object-cover" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-primary-500/10 border border-primary-500/20 text-primary-400 capitalize">{selectedRoom.type}</span>
              {selectedRoom.discountPercent > 0 && <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">{selectedRoom.discountPercent}% OFF</span>}
            </div>
            <h3 className="font-display text-2xl text-white mb-1">{selectedRoom.name}</h3>
            <p className="text-dark-400 text-sm mb-4 line-clamp-3">{selectedRoom.description}</p>
            <div className="space-y-2 mb-5">
              {[
                { icon: FiCalendar, label: `${searchData.checkIn || 'N/A'} → ${searchData.checkOut || 'N/A'}` },
                { icon: FiUsers, label: `${searchData.adults || 2} Adults · ${nights} Night${nights !== 1 ? 's' : ''}` },
                { icon: FiMapPin, label: `${searchData.rooms || 1} Room(s)` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-dark-300">
                  <item.icon className="w-4 h-4 text-primary-400" />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="border-t border-dark-700 pt-4">
              {selectedRoom.discountPercent > 0 && <p className="text-dark-500 text-xs line-through">₹{selectedRoom.pricePerNight?.toLocaleString('en-IN')}/night</p>}
              <p className="text-2xl font-bold text-white">₹{Math.round(effectivePrice)?.toLocaleString('en-IN')} <span className="text-sm text-dark-500 font-normal">/night</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Preview */}
      <div className="glass p-5 mb-8">
        <h4 className="text-white font-medium mb-3">What's included</h4>
        <div className="flex flex-wrap gap-2">
          {selectedRoom.amenities?.slice(0, 8).map((a) => (
            <span key={a} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-dark-800 text-dark-300 rounded-lg border border-dark-700">
              <FiCheckCircle className="w-3.5 h-3.5 text-primary-400" />{a}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => dispatch(nextStep())} className="btn-primary px-8 py-3">
          Continue to Guest Details <FiArrowRight />
        </button>
      </div>
    </div>
  )
}

// ===================== STEP 2: GUEST DETAILS =====================
export function StepGuestDetails() {
  const dispatch = useDispatch()
  const { guestDetails } = useSelector((s) => s.booking)
  const [form, setForm] = useState({
    firstName: guestDetails.firstName || '',
    lastName: guestDetails.lastName || '',
    email: guestDetails.email || '',
    phone: guestDetails.phone || '',
    specialRequests: guestDetails.specialRequests || '',
    arrivalTime: guestDetails.arrivalTime || '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email is required'
    if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = 'Valid 10-digit phone number required'
    return errs
  }

  const handleNext = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    dispatch(setGuestDetails(form))
    dispatch(nextStep())
  }

  const Field = ({ name, label, type = 'text', placeholder, half }) => (
    <div className={half ? 'flex-1 min-w-0' : 'w-full'}>
      <label className="label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => { setForm((p) => ({ ...p, [name]: e.target.value })); setErrors((p) => ({ ...p, [name]: '' })) }}
        className={`input-field ${errors[name] ? 'border-red-500' : ''}`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-white mb-2">Guest Details</h2>
      <p className="text-dark-400 mb-8">Please enter the primary guest's information</p>

      <div className="glass p-6 space-y-4 mb-6">
        <div className="flex gap-4">
          <Field name="firstName" label="First Name" placeholder="John" half />
          <Field name="lastName" label="Last Name" placeholder="Doe" half />
        </div>
        <Field name="email" label="Email Address" type="email" placeholder="john@example.com" />
        <Field name="phone" label="Phone Number" type="tel" placeholder="9876543210" />
        <div>
          <label className="label">Expected Arrival Time (Optional)</label>
          <select value={form.arrivalTime} onChange={(e) => setForm((p) => ({ ...p, arrivalTime: e.target.value }))} className="input-field">
            <option value="">Select arrival time</option>
            {['12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM', 'Late Night (after 12 AM)'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Special Requests (Optional)</label>
          <textarea
            value={form.specialRequests}
            onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
            placeholder="Dietary restrictions, accessibility needs, room preferences..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="glass p-4 flex items-start gap-3 mb-8 border border-primary-500/20">
        <FiCheckCircle className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
        <p className="text-dark-400 text-sm">Your personal data will be used to process your booking and for other purposes described in our <span className="text-primary-400 underline cursor-pointer">Privacy Policy</span>.</p>
      </div>

      <div className="flex justify-between">
        <button onClick={() => dispatch(prevStep())} className="btn-ghost border border-dark-600 flex items-center gap-2">
          <FiArrowLeft /> Back
        </button>
        <button onClick={handleNext} className="btn-primary px-8 py-3">
          Continue to Add-ons <FiArrowRight />
        </button>
      </div>
    </div>
  )
}

// ===================== STEP 3: ADD-ONS =====================
const ADDONS_LIST = [
  { id: 'breakfast', name: 'Breakfast for 2', description: 'Continental breakfast served in room', price: 799, icon: '🍳', category: 'Dining' },
  { id: 'airport', name: 'Airport Transfer', description: 'One-way airport pickup', price: 1299, icon: '🚗', category: 'Transport' },
  { id: 'spa', name: 'Spa Session', description: '60-min couple spa session', price: 2499, icon: '💆', category: 'Wellness' },
  { id: 'flowers', name: 'Room Decoration', description: 'Flowers, candles & turndown', price: 999, icon: '🌸', category: 'Special' },
  { id: 'dinner', name: 'Candlelight Dinner', description: 'Private dinner at the terrace', price: 3499, icon: '🕯️', category: 'Dining' },
  { id: 'champagne', name: 'Welcome Champagne', description: 'Chilled bottle on arrival', price: 1499, icon: '🥂', category: 'Special' },
]

export function StepAddOns() {
  const dispatch = useDispatch()
  const { addOns } = useSelector((s) => s.booking)
  const [selected, setSelected] = useState(addOns || [])

  const toggleAddOn = (addon) => {
    setSelected((prev) => {
      const exists = prev.find((a) => a.id === addon.id)
      return exists ? prev.filter((a) => a.id !== addon.id) : [...prev, { ...addon, quantity: 1 }]
    })
  }

  const handleNext = () => {
    dispatch(setAddOns(selected))
    dispatch(nextStep())
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-display text-3xl text-white mb-2">Enhance Your Stay</h2>
      <p className="text-dark-400 mb-8">Add special services to make your experience memorable</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ADDONS_LIST.map((addon) => {
          const isSelected = selected.some((a) => a.id === addon.id)
          return (
            <motion.button
              key={addon.id}
              onClick={() => toggleAddOn(addon)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 relative ${
                isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-900 hover:border-dark-500'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <FiCheckCircle className="w-3.5 h-3.5 text-dark-950" />
                </div>
              )}
              <span className="text-3xl mb-3 block">{addon.icon}</span>
              <span className="badge bg-dark-800 text-dark-400 border border-dark-700 text-xs mb-2">{addon.category}</span>
              <h3 className="font-medium text-white mb-1">{addon.name}</h3>
              <p className="text-dark-400 text-xs mb-3">{addon.description}</p>
              <p className={`font-bold text-lg ${isSelected ? 'text-primary-400' : 'text-white'}`}>+₹{addon.price?.toLocaleString('en-IN')}</p>
            </motion.button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 mb-6 border border-primary-500/20">
          <p className="text-sm text-dark-300 mb-2">Selected add-ons:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((a) => (
              <span key={a.id} className="flex items-center gap-2 text-xs px-3 py-1.5 bg-primary-500/10 text-primary-300 rounded-lg border border-primary-500/20">
                {a.icon} {a.name} — ₹{a.price?.toLocaleString('en-IN')}
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold text-white mt-3">
            Add-ons total: ₹{selected.reduce((sum, a) => sum + a.price, 0)?.toLocaleString('en-IN')}
          </p>
        </motion.div>
      )}

      <div className="flex justify-between">
        <button onClick={() => dispatch(prevStep())} className="btn-ghost border border-dark-600 flex items-center gap-2">
          <FiArrowLeft /> Back
        </button>
        <button onClick={handleNext} className="btn-primary px-8 py-3">
          Review & Pay <FiArrowRight />
        </button>
      </div>
    </div>
  )
}

export default { StepRoomSelect, StepGuestDetails, StepAddOns }
