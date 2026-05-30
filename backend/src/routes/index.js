// ==================== AUTH ROUTES ====================
const express = require('express');
const authRouter = express.Router();
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, toggleWishlist, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', protect, logout);
authRouter.get('/me', protect, getMe);
authRouter.put('/update-profile', protect, updateProfile);
authRouter.put('/change-password', protect, changePassword);
authRouter.post('/forgot-password', forgotPassword);
authRouter.put('/reset-password/:token', resetPassword);
authRouter.post('/wishlist/:hotelId', protect, toggleWishlist);

// ==================== HOTEL ROUTES ====================
const hotelRouter = express.Router();
const { getHotels, getHotel, createHotel, updateHotel, deleteHotel, getFeaturedHotels, getCities } = require('../controllers/hotelController');
const { adminOnly } = require('../middleware/auth');

hotelRouter.get('/featured', getFeaturedHotels);
hotelRouter.get('/cities', getCities);
hotelRouter.get('/', getHotels);
hotelRouter.get('/:id', getHotel);
hotelRouter.post('/', protect, adminOnly, createHotel);
hotelRouter.put('/:id', protect, adminOnly, updateHotel);
hotelRouter.delete('/:id', protect, adminOnly, deleteHotel);

// ==================== ROOM ROUTES ====================
const roomRouter = express.Router();
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom, checkAvailability } = require('../controllers/roomController');

roomRouter.get('/', getRooms);
roomRouter.get('/:id', getRoom);
roomRouter.post('/:id/check-availability', checkAvailability);
roomRouter.post('/', protect, adminOnly, createRoom);
roomRouter.put('/:id', protect, adminOnly, updateRoom);
roomRouter.delete('/:id', protect, adminOnly, deleteRoom);

// ==================== BOOKING ROUTES ====================
const bookingRouter = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, updateBookingStatus, getAllBookings } = require('../controllers/bookingController');

bookingRouter.use(protect);
bookingRouter.post('/', createBooking);
bookingRouter.get('/my-bookings', getMyBookings);
bookingRouter.get('/:id', getBooking);
bookingRouter.put('/:id/cancel', cancelBooking);
bookingRouter.put('/:id/status', adminOnly, updateBookingStatus);
bookingRouter.get('/', adminOnly, getAllBookings);

// ==================== PAYMENT ROUTES ====================
const paymentRouter = express.Router();
const { createOrder, verifyPayment, paymentFailed, processRefund, getMyPayments } = require('../controllers/paymentController');

paymentRouter.use(protect);
paymentRouter.post('/create-order', createOrder);
paymentRouter.post('/verify', verifyPayment);
paymentRouter.post('/failed', paymentFailed);
paymentRouter.post('/:paymentId/refund', adminOnly, processRefund);
paymentRouter.get('/my-payments', getMyPayments);

// ==================== REVIEW ROUTES ====================
const reviewRouter = express.Router();
const { createReview, getReviews, moderateReview, deleteReview } = require('../controllers/reviewCouponController');

reviewRouter.get('/', getReviews);
reviewRouter.post('/', protect, createReview);
reviewRouter.put('/:id/moderate', protect, adminOnly, moderateReview);
reviewRouter.delete('/:id', protect, deleteReview);

// ==================== COUPON ROUTES ====================
const couponRouter = express.Router();
const { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon } = require('../controllers/reviewCouponController');

couponRouter.post('/validate', protect, validateCoupon);
couponRouter.get('/', protect, adminOnly, getCoupons);
couponRouter.post('/', protect, adminOnly, createCoupon);
couponRouter.put('/:id', protect, adminOnly, updateCoupon);
couponRouter.delete('/:id', protect, adminOnly, deleteCoupon);

// ==================== ADMIN ROUTES ====================
const adminRouter = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, getRevenueAnalytics, getPendingReviews } = require('../controllers/adminController');

adminRouter.use(protect, adminOnly);
adminRouter.get('/dashboard', getDashboardStats);
adminRouter.get('/users', getAllUsers);
adminRouter.put('/users/:id/toggle', toggleUserStatus);
adminRouter.get('/revenue', getRevenueAnalytics);
adminRouter.get('/reviews', getPendingReviews);

// ==================== UPLOAD ROUTES ====================
const uploadRouter = express.Router();
const { upload } = require('../config/cloudinary');

uploadRouter.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.status(200).json({ success: true, url: req.file.path, public_id: req.file.filename });
});

uploadRouter.post('/images', protect, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
  const images = req.files.map(f => ({ url: f.path, public_id: f.filename }));
  res.status(200).json({ success: true, images });
});

module.exports = { authRouter, hotelRouter, roomRouter, bookingRouter, paymentRouter, reviewRouter, couponRouter, adminRouter, uploadRouter };
