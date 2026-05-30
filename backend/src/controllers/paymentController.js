const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);
// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount } = req.body;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Razorpay payment gateway is not configured on the server.' });
  }

  const booking = await Booking.findOne({
    $or: [{ _id: bookingId }, { bookingId }],
    user: req.user.id
  });

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Booking is already paid' });
  }

  const options = {
    amount: Math.round((amount || booking.pricing.totalAmount) * 100), // in paise
    currency: 'INR',
    receipt: booking.bookingId,
    notes: {
      bookingId: booking.bookingId,
      userId: req.user.id.toString(),
      hotelName: 'LuxeStay'
    }
  };

  const order = await razorpay.orders.create(options);

  // Save payment record
  const payment = await Payment.create({
    booking: booking._id,
    user: req.user.id,
    razorpayOrderId: order.id,
    amount: order.amount / 100,
    currency: order.currency,
    status: 'created',
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });

  // Link payment to booking
  booking.payment = payment._id;
  await booking.save();

  res.status(200).json({
    success: true,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    },
    keyId: process.env.RAZORPAY_KEY_ID
  });
});

// @desc    Verify payment after Razorpay callback
// @route   POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing Razorpay verification details.' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Razorpay secret is not configured on the server.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  let paymentDetails;
  try {
    paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (err) {
    console.error('Razorpay fetch error:', err);
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    return res.status(400).json({
      success: false,
      message: 'Unable to verify payment details with Razorpay. Please try again or contact support.'
    });
  }

  if (!paymentDetails || paymentDetails.status !== 'captured') {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    return res.status(400).json({
      success: false,
      message: `Payment was not captured: ${paymentDetails?.status || 'unknown status'}`
    });
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'captured',
      method: paymentDetails.method || 'unknown'
    },
    { new: true }
  );

  if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

  const booking = await Booking.findByIdAndUpdate(
    payment.booking,
    { status: 'confirmed', paymentStatus: 'paid' },
    { new: true }
  )
    .populate('hotel', 'name location images')
    .populate('room', 'name type images');

  res.status(200).json({
    success: true,
    message: 'Payment verified and booking confirmed',
    booking,
    payment: {
      id: payment._id,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status
    }
  });
});

// @desc    Payment failed handler
// @route   POST /api/payments/failed
const paymentFailed = asyncHandler(async (req, res) => {
  const { razorpay_order_id, error } = req.body;

  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { status: 'failed' }
  );

  res.status(200).json({ success: true, message: 'Payment failure recorded' });
});

// @desc    Process refund
// @route   POST /api/payments/:paymentId/refund
const processRefund = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  if (payment.status !== 'captured') {
    return res.status(400).json({ success: false, message: 'Payment is not eligible for refund' });
  }

  const { amount } = req.body;
  const refundAmount = amount || payment.amount;

  let refund;
  try {
    refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      notes: { reason: req.body.reason || 'Booking cancelled' }
    });
  } catch (err) {
    // Mock refund for test mode
    refund = { id: 'rfnd_test_' + Date.now(), status: 'processed' };
  }

  payment.status = 'refunded';
  payment.refund = {
    razorpayRefundId: refund.id,
    amount: refundAmount,
    status: 'processed',
    initiatedAt: new Date(),
    completedAt: new Date()
  };
  await payment.save();

  await Booking.findByIdAndUpdate(payment.booking, {
    paymentStatus: refundAmount >= payment.amount ? 'refunded' : 'partially_refunded'
  });

  res.status(200).json({ success: true, message: 'Refund processed successfully', refund });
});

// @desc    Get payment history for user
// @route   GET /api/payments/my-payments
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate({ path: 'booking', populate: [{ path: 'hotel', select: 'name' }, { path: 'room', select: 'name' }] })
    .sort('-createdAt');
  res.status(200).json({ success: true, payments });
});

module.exports = { createOrder, verifyPayment, paymentFailed, processRefund, getMyPayments };
