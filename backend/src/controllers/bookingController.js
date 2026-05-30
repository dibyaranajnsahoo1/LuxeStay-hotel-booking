const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { Coupon } = require('../models/ReviewCoupon');
const { asyncHandler } = require('../middleware/auth');

// @desc    Create booking (after payment verification)
// @route   POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { roomId, hotelId, checkIn, checkOut, guests, roomsBooked = 1, guestDetails, addOns = [], couponCode } = req.body;

  // Validate dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (checkInDate >= checkOutDate) {
    return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
  }
  if (checkInDate < new Date()) {
    return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
  }

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  // Check availability
  const isAvailable = await room.checkAvailability(checkInDate, checkOutDate, roomsBooked);
  if (!isAvailable) {
    return res.status(400).json({ success: false, message: 'Room is not available for selected dates' });
  }

  // Calculate pricing
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const discountAmount = room.pricePerNight * (room.discountPercent / 100) * nights * roomsBooked;
  const basePrice = (room.pricePerNight - room.pricePerNight * room.discountPercent / 100) * nights * roomsBooked;
  const addOnsTotal = addOns.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0);

  let couponDiscount = 0;
  let couponData = {};
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.validateCoupon(basePrice + addOnsTotal);
      if (validation.valid) {
        couponDiscount = validation.discount;
        couponData = { code: coupon.code, discount: couponDiscount };
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const subtotal = basePrice + addOnsTotal - couponDiscount;
  const taxAmount = Math.round(subtotal * 0.18);
  const serviceFee = Math.round(subtotal * 0.05);
  const totalAmount = Math.round(subtotal + taxAmount + serviceFee);

  const booking = await Booking.create({
    user: req.user.id,
    hotel: hotelId,
    room: roomId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights,
    guests,
    roomsBooked,
    guestDetails,
    addOns,
    pricing: {
      basePrice: Math.round(basePrice),
      discountAmount: Math.round(discountAmount),
      addOnsTotal: Math.round(addOnsTotal),
      couponDiscount: Math.round(couponDiscount),
      taxRate: 18,
      taxAmount,
      serviceFee,
      totalAmount
    },
    coupon: couponData,
    status: 'pending',
    paymentStatus: 'pending'
  });

  await booking.populate([
    { path: 'hotel', select: 'name location images policies' },
    { path: 'room', select: 'name type images pricePerNight' }
  ]);

  res.status(201).json({ success: true, booking });
});

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { user: req.user.id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('hotel', 'name location images')
      .populate('room', 'name type images pricePerNight')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(query)
  ]);

  res.status(200).json({ success: true, bookings, total, pages: Math.ceil(total / Number(limit)) });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
const getBooking = asyncHandler(async (req, res) => {
  const query = [{ bookingId: req.params.id }]
  if (mongoose.isValidObjectId(req.params.id)) {
    query.unshift({ _id: req.params.id })
  }

  const booking = await Booking.findOne({ $or: query })
    .populate('hotel', 'name location images contact policies')
    .populate('room', 'name type images amenities bedConfiguration')
    .populate('user', 'name email phone')
    .populate('payment');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  // Only allow owner or admin
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, booking });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (['cancelled', 'checked_out'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
  }

  // Calculate refund (free cancellation 24h before check-in)
  const hoursUntilCheckIn = (booking.checkIn - new Date()) / (1000 * 60 * 60);
  let refundAmount = 0;
  if (hoursUntilCheckIn >= 24) {
    refundAmount = booking.pricing.totalAmount;
  } else if (hoursUntilCheckIn >= 0) {
    refundAmount = booking.pricing.totalAmount * 0.5;
  }

  booking.status = 'cancelled';
  booking.paymentStatus = refundAmount > 0 ? 'refunded' : booking.paymentStatus;
  booking.cancellation = {
    cancelledAt: new Date(),
    reason: req.body.reason || 'Cancelled by user',
    refundAmount,
    refundStatus: refundAmount > 0 ? 'pending' : undefined
  };
  await booking.save();

  res.status(200).json({ success: true, booking, refundAmount });
});

// @desc    Update booking status (admin)
// @route   PUT /api/bookings/:id/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('hotel room user');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.status(200).json({ success: true, booking });
});

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('user', 'name email phone')
      .populate('hotel', 'name location')
      .populate('room', 'name type')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(query)
  ]);

  res.status(200).json({ success: true, bookings, total, pages: Math.ceil(total / Number(limit)) });
});

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking, updateBookingStatus, getAllBookings };
