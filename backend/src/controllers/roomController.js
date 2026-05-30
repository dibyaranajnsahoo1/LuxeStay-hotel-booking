const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/auth');

// @desc    Get rooms for a hotel
// @route   GET /api/rooms?hotelId=xxx&checkIn=&checkOut=&guests=
const getRooms = asyncHandler(async (req, res) => {
  const { hotelId, checkIn, checkOut, guests, adults, type, minPrice, maxPrice, sort = 'pricePerNight' } = req.query;

  const query = { isActive: true };
  if (hotelId) query.hotel = hotelId;
  if (type) query.type = type;
  if (minPrice || maxPrice) {
    query.pricePerNight = {};
    if (minPrice) query.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
  }
  if (adults) query['maxOccupancy.adults'] = { $gte: Number(adults) };

  const rooms = await Room.find(query).sort(sort).populate('hotel', 'name location policies');

  // Check availability if dates provided
  let roomsWithAvailability = rooms;
  if (checkIn && checkOut) {
    roomsWithAvailability = await Promise.all(rooms.map(async (room) => {
      const available = await room.checkAvailability(new Date(checkIn), new Date(checkOut));
      return { ...room.toObject(), isAvailable: available };
    }));
  }

  res.status(200).json({ success: true, rooms: roomsWithAvailability });
});

// @desc    Get single room
// @route   GET /api/rooms/:id
const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel', 'name location policies amenities ratings images contact');
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  // Get similar rooms
  const similarRooms = await Room.find({
    hotel: room.hotel._id,
    _id: { $ne: room._id },
    isActive: true
  }).limit(3);

  res.status(200).json({ success: true, room, similarRooms });
});

// @desc    Create room (admin)
// @route   POST /api/rooms
const createRoom = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.body.hotel);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

  const room = await Room.create(req.body);

  // Update hotel price range
  const allRooms = await Room.find({ hotel: hotel._id, isActive: true });
  const prices = allRooms.map(r => r.pricePerNight);
  await Hotel.findByIdAndUpdate(hotel._id, {
    'priceRange.min': Math.min(...prices),
    'priceRange.max': Math.max(...prices)
  });

  res.status(201).json({ success: true, room });
});

// @desc    Update room (admin)
// @route   PUT /api/rooms/:id
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  res.status(200).json({ success: true, room });
});

// @desc    Delete room (admin)
// @route   DELETE /api/rooms/:id
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  res.status(200).json({ success: true, message: 'Room deactivated successfully' });
});

// @desc    Check room availability
// @route   POST /api/rooms/:id/check-availability
const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, roomsNeeded = 1 } = req.body;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'Please provide check-in and check-out dates' });
  }

  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  const isAvailable = await room.checkAvailability(new Date(checkIn), new Date(checkOut), Number(roomsNeeded));
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  const effectivePrice = room.pricePerNight - (room.pricePerNight * room.discountPercent / 100);
  const basePrice = effectivePrice * nights * Number(roomsNeeded);
  const taxAmount = basePrice * 0.18;
  const serviceFee = basePrice * 0.05;
  const totalAmount = basePrice + taxAmount + serviceFee;

  res.status(200).json({
    success: true,
    isAvailable,
    pricing: {
      pricePerNight: effectivePrice,
      nights,
      roomsNeeded: Number(roomsNeeded),
      basePrice: Math.round(basePrice),
      discountAmount: Math.round(room.pricePerNight * room.discountPercent / 100 * nights * Number(roomsNeeded)),
      taxAmount: Math.round(taxAmount),
      serviceFee: Math.round(serviceFee),
      totalAmount: Math.round(totalAmount)
    }
  });
});

module.exports = { getRooms, getRoom, createRoom, updateRoom, deleteRoom, checkAvailability };
