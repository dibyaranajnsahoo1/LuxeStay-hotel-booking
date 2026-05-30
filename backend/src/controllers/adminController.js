const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { Review } = require('../models/ReviewCoupon');
const { asyncHandler } = require('../middleware/auth');

// @desc    Admin dashboard analytics
// @route   GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers, totalHotels, totalRooms, totalBookings,
    thisMonthBookings, lastMonthBookings,
    revenueData, pendingReviews,
    activeBookings, recentBookings,
    monthlyRevenue
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Hotel.countDocuments({ isActive: true }),
    Room.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Booking.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Review.countDocuments({ isApproved: false }),
    Booking.countDocuments({ status: { $in: ['confirmed', 'checked_in'] } }),
    Booking.find().sort('-createdAt').limit(10).populate('user', 'name email').populate('hotel', 'name').populate('room', 'name'),
    Payment.aggregate([
      { $match: { status: 'captured' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ])
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const bookingGrowth = lastMonthBookings > 0
    ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
    : 100;

  // Booking status distribution
  const bookingStatusDist = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Top hotels by bookings
  const topHotels = await Booking.aggregate([
    { $group: { _id: '$hotel', bookings: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'hotels', localField: '_id', foreignField: '_id', as: 'hotel' } },
    { $unwind: '$hotel' },
    { $project: { 'hotel.name': 1, 'hotel.location.city': 1, bookings: 1, revenue: 1 } }
  ]);

  const formattedMonthlyRevenue = monthlyRevenue.map(m => ({
    month: new Date(m._id.year, m._id.month - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    revenue: m.revenue,
    bookings: m.count
  }));

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalHotels,
      totalRooms,
      totalBookings,
      thisMonthBookings,
      bookingGrowth: Number(bookingGrowth),
      totalRevenue: Math.round(totalRevenue),
      pendingReviews,
      activeBookings
    },
    recentBookings,
    monthlyRevenue: formattedMonthlyRevenue,
    bookingStatusDist,
    topHotels
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(query)
  ]);

  res.status(200).json({ success: true, users, total, pages: Math.ceil(total / Number(limit)) });
});

// @desc    Toggle user status (admin)
// @route   PUT /api/admin/users/:id/toggle
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// @desc    Revenue analytics
// @route   GET /api/admin/revenue
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = '12months' } = req.query;

  const monthlyData = await Payment.aggregate([
    { $match: { status: 'captured' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: period === '12months' ? 12 : 6 }
  ]);

  const roomTypeRevenue = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'roomData' } },
    { $unwind: '$roomData' },
    { $group: { _id: '$roomData.type', revenue: { $sum: '$pricing.totalAmount' }, bookings: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    monthly: monthlyData.map(m => ({
      label: new Date(m._id.year, m._id.month - 1).toLocaleDateString('en-IN', { month: 'short' }),
      revenue: Math.round(m.revenue),
      transactions: m.transactions
    })),
    byRoomType: roomTypeRevenue
  });
});

// @desc    Get all pending reviews
// @route   GET /api/admin/reviews
const getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isApproved: false })
    .populate('user', 'name email avatar')
    .populate('hotel', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, reviews });
});

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, getRevenueAnalytics, getPendingReviews };
