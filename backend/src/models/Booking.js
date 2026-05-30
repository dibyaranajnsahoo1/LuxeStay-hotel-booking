const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => 'LXS-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now().toString(36).toUpperCase()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  nights: {
    type: Number,
    required: true
  },
  guests: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 }
  },
  roomsBooked: { type: Number, default: 1 },
  guestDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequests: String,
    arrivalTime: String
  },
  addOns: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  pricing: {
    basePrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    addOnsTotal: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  coupon: {
    code: String,
    discount: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  cancellation: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] }
  },
  invoice: {
    generatedAt: Date,
    url: String
  }
}, { timestamps: true });

// Validate check-in before check-out
bookingSchema.pre('save', function (next) {
  if (this.checkIn >= this.checkOut) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  const diffTime = Math.abs(this.checkOut - this.checkIn);
  this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
