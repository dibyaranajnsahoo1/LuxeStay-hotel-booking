const { Review, Coupon } = require('../models/ReviewCoupon');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/auth');

// ==================== REVIEW CONTROLLER ====================

// @desc    Create review
// @route   POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { hotelId, bookingId, rating, title, comment } = req.body;

  // Verify the user stayed at the hotel
  let isVerified = false;
  if (bookingId) {
    const booking = await Booking.findOne({
      _id: bookingId, user: req.user.id, hotel: hotelId, status: 'checked_out'
    });
    isVerified = !!booking;
  }

  const existing = await Review.findOne({ user: req.user.id, hotel: hotelId });
  if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this hotel' });

  const review = await Review.create({
    user: req.user.id,
    hotel: hotelId,
    booking: bookingId,
    rating,
    title,
    comment,
    isVerifiedStay: isVerified,
    isApproved: isVerified // Auto-approve verified stays
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
});

// @desc    Get reviews for hotel
// @route   GET /api/reviews?hotelId=xxx
const getReviews = asyncHandler(async (req, res) => {
  const { hotelId, page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const query = { hotel: hotelId, isApproved: true };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name avatar')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Review.countDocuments(query)
  ]);

  // Rating summary
  const allReviews = await Review.find({ hotel: hotelId, isApproved: true });
  const summary = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach(r => summary[Math.floor(r.rating.overall)]++);

  res.status(200).json({ success: true, reviews, total, pages: Math.ceil(total / Number(limit)), summary });
});

// @desc    Approve/reject review (admin)
// @route   PUT /api/reviews/:id/moderate
const moderateReview = asyncHandler(async (req, res) => {
  const { isApproved, adminResponse } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved, adminResponse: adminResponse ? { message: adminResponse, respondedAt: new Date() } : undefined },
    { new: true }
  );
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  res.status(200).json({ success: true, review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

// ==================== COUPON CONTROLLER ====================

// @desc    Validate coupon
// @route   POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

  const result = coupon.validateCoupon(amount);
  if (!result.valid) return res.status(400).json({ success: false, message: result.message });

  res.status(200).json({ success: true, discount: result.discount, coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue } });
});

// @desc    Create coupon (admin)
// @route   POST /api/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, coupons });
});

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.status(200).json({ success: true, coupon });
});

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

module.exports = { createReview, getReviews, moderateReview, deleteReview, validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon };
