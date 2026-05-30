const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'unknown'],
    default: 'unknown'
  },
  refund: {
    razorpayRefundId: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'processed', 'failed'] },
    initiatedAt: Date,
    completedAt: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
