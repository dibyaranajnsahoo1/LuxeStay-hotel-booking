const mongoose = require('mongoose');

// ==================== REVIEW MODEL ====================
const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: 1000
  },
  images: [{
    public_id: String,
    url: String
  }],
  isApproved: { type: Boolean, default: false },
  isVerifiedStay: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  adminResponse: {
    message: String,
    respondedAt: Date
  }
}, { timestamps: true });

// One review per user per hotel
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

// Update hotel ratings after save
reviewSchema.post('save', async function () {
  const Hotel = mongoose.model('Hotel');
  const reviews = await mongoose.model('Review').find({ hotel: this.hotel, isApproved: true });
  const avgRating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating.overall, 0) / reviews.length : 0;
  await Hotel.findByIdAndUpdate(this.hotel, {
    'ratings.average': Math.round(avgRating * 10) / 10,
    'ratings.count': reviews.length
  });
});

const Review = mongoose.model('Review', reviewSchema);

// ==================== COUPON MODEL ====================
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: { type: String, required: true },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0
  },
  maxDiscount: { type: Number }, // For percentage coupons
  minOrderAmount: {
    type: Number,
    default: 0
  },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  applicableHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }], // empty = all hotels
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

couponSchema.methods.validateCoupon = function (orderAmount) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  const now = new Date();
  if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet active' };
  if (now > this.validUntil) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.discountValue;
  }
  return { valid: true, discount: Math.min(discount, orderAmount) };
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Review, Coupon };
