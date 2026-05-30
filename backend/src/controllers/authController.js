const User = require('../models/User');
const { asyncHandler } = require('../middleware/auth');
const crypto = require('crypto');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  user.password = undefined;
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, phone });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account has been deactivated' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images location ratings');
  res.status(200).json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/update-profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No user found with that email' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // In production, send email with reset link
  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
    resetToken // Remove in production
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Toggle wishlist
// @route   POST /api/auth/wishlist/:hotelId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const hotelId = req.params.hotelId;

  const idx = user.wishlist.indexOf(hotelId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(hotelId);
  }
  await user.save();
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// @desc    Logout
// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, toggleWishlist, logout };
