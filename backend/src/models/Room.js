const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'presidential', 'villa', 'penthouse', 'studio'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  images: [{
    public_id: String,
    url: { type: String, required: true },
    caption: String
  }],
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxOccupancy: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 }
  },
  bedConfiguration: {
    type: String,
    enum: ['single', 'double', 'twin', 'king', 'queen', 'bunk'],
    required: true
  },
  bedCount: { type: Number, default: 1 },
  size: {
    value: Number,
    unit: { type: String, default: 'sqft' }
  },
  floor: Number,
  view: {
    type: String,
    enum: ['city', 'garden', 'pool', 'sea', 'mountain', 'courtyard', 'none'],
    default: 'city'
  },
  amenities: [{ type: String }],
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Virtual for effective price
roomSchema.virtual('effectivePrice').get(function () {
  return this.pricePerNight - (this.pricePerNight * this.discountPercent / 100);
});

// Method to check availability
roomSchema.methods.checkAvailability = async function (checkIn, checkOut, roomsNeeded = 1) {
  const Booking = mongoose.model('Booking');
  const bookedRooms = await Booking.countDocuments({
    room: this._id,
    status: { $in: ['confirmed', 'checked_in'] },
    $or: [
      { checkIn: { $lt: checkOut, $gte: checkIn } },
      { checkOut: { $gt: checkIn, $lte: checkOut } },
      { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
    ]
  });
  return (this.totalRooms - bookedRooms) >= roomsNeeded;
};

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
