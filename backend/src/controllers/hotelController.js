const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { asyncHandler } = require('../middleware/auth');

// @desc    Get all hotels with filtering, sorting, pagination
// @route   GET /api/hotels
const getHotels = asyncHandler(async (req, res) => {
  const {
    city, state, category, starRating, minPrice, maxPrice,
    amenities, checkIn, checkOut, guests, rooms,
    sort = '-createdAt', page = 1, limit = 12, featured, search
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { 'location.state': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (state) query['location.state'] = { $regex: state, $options: 'i' };
  if (category) query.category = category;
  if (starRating) query.starRating = { $gte: Number(starRating) };
  if (featured === 'true') query.isFeatured = true;
  if (amenities) query.amenities = { $all: amenities.split(',') };

  // Price range filter via rooms
  if (minPrice || maxPrice) {
    const priceQuery = {};
    if (minPrice) priceQuery.$gte = Number(minPrice);
    if (maxPrice) priceQuery.$lte = Number(maxPrice);
    query['priceRange.min'] = priceQuery;
  }

  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [hotels, total] = await Promise.all([
    Hotel.find(query).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
    Hotel.countDocuments(query)
  ]);

  // Attach room count and availability for each hotel
  const hotelsWithRooms = await Promise.all(hotels.map(async (hotel) => {
    const roomCount = await Room.countDocuments({ hotel: hotel._id, isActive: true });
    return { ...hotel, roomCount };
  }));

  res.status(200).json({
    success: true,
    total,
    pages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    hotels: hotelsWithRooms
  });
});

// @desc    Get single hotel with rooms
// @route   GET /api/hotels/:id
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true
  });

  if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

  const rooms = await Room.find({ hotel: hotel._id, isActive: true });

  res.status(200).json({ success: true, hotel, rooms });
});

// @desc    Create hotel (admin)
// @route   POST /api/hotels
const createHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({ success: true, hotel });
});

// @desc    Update hotel (admin)
// @route   PUT /api/hotels/:id
const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
  res.status(200).json({ success: true, hotel });
});

// @desc    Delete hotel (admin)
// @route   DELETE /api/hotels/:id
const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
  res.status(200).json({ success: true, message: 'Hotel deactivated successfully' });
});

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
const getFeaturedHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ isFeatured: true, isActive: true }).limit(6).lean();
  res.status(200).json({ success: true, hotels });
});

// @desc    Get hotels by city/location
// @route   GET /api/hotels/cities
const getCities = asyncHandler(async (req, res) => {
  const cities = await Hotel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$location.city', count: { $sum: 1 }, state: { $first: '$location.state' } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
  res.status(200).json({ success: true, cities });
});

module.exports = { getHotels, getHotel, createHotel, updateHotel, deleteHotel, getFeaturedHotels, getCities };
