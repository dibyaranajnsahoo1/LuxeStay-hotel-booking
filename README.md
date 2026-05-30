# 🏨 LuxeStay — Premium Hotel Booking Platform

A production-ready, full-stack hotel booking web application built with React.js, Node.js, MongoDB, and Razorpay payment integration.

![LuxeStay Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop)

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Razorpay Test Setup](#razorpay-test-setup)
- [Deployment Guide](#deployment-guide)
- [Admin Credentials](#admin-credentials)
- [Feature Checklist](#feature-checklist)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Framer Motion |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **State** | Redux Toolkit |
| **Payment** | Razorpay (Test Mode) |
| **Images** | Cloudinary |
| **Charts** | Recharts |
| **Carousel** | Swiper.js |

---

## ✨ Features

### 🔐 Authentication
- [x] User Registration & Login
- [x] JWT Authentication with persistence
- [x] Forgot/Reset Password flow
- [x] Role-based access (Customer/Admin)
- [x] Protected routes

### 🏨 Hotel Discovery
- [x] Advanced search (city, category, price, rating, amenities)
- [x] Sorting & Filtering
- [x] Pagination
- [x] Featured hotels
- [x] Wishlist / Save hotels
- [x] Hotel details with gallery, policies, reviews

### 🛏 Booking Flow (6 Steps)
- [x] Step 1: Room Selection with availability check
- [x] Step 2: Guest Details form with validation
- [x] Step 3: Add-ons (breakfast, spa, airport transfer, etc.)
- [x] Step 4: Review, coupon application & payment
- [x] Dynamic pricing (base + GST 18% + service fee 5%)
- [x] Real-time availability checking
- [x] Double-booking prevention

### 💳 Razorpay Integration
- [x] Create order via backend
- [x] Razorpay checkout modal
- [x] Signature verification
- [x] Payment success/failure handling
- [x] Refund support
- [x] Payment status tracking

### 📊 Admin Dashboard
- [x] Revenue analytics with charts
- [x] Monthly booking trends
- [x] Booking status distribution (pie chart)
- [x] Top hotels by revenue
- [x] Recent bookings feed
- [x] Hotel CRUD management
- [x] Room CRUD management
- [x] Booking status management
- [x] User management & toggle
- [x] Coupon management
- [x] Review moderation

### 👤 User Dashboard
- [x] View & manage bookings
- [x] Cancel bookings with refund logic
- [x] Wishlist management
- [x] Profile settings

### 🎟 Coupons
- [x] Percentage & flat discount types
- [x] Min order validation
- [x] Expiry checking
- [x] Usage limits

---

## 📁 Project Structure

```
hotel-booking/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── cloudinary.js        # Cloudinary + Multer
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile
│   │   │   ├── hotelController.js   # Hotel CRUD + search
│   │   │   ├── roomController.js    # Room CRUD + availability
│   │   │   ├── bookingController.js # Booking lifecycle
│   │   │   ├── paymentController.js # Razorpay integration
│   │   │   ├── reviewCouponController.js
│   │   │   └── adminController.js   # Analytics + admin ops
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Hotel.js
│   │   │   ├── Room.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   └── ReviewCoupon.js
│   │   ├── routes/
│   │   │   └── index.js             # All routes defined here
│   │   └── middleware/
│   │       └── auth.js              # protect, adminOnly, asyncHandler, errorHandler
│   ├── scripts/
│   │   └── seedData.js              # Database seeder
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── HotelListing.jsx
│   │   │   ├── HotelDetails.jsx
│   │   │   ├── RoomDetails.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminHotels.jsx
│   │   │       ├── AdminRooms.jsx
│   │   │       ├── AdminBookings.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminCoupons.jsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── hotels/
│   │   │   │   └── HotelCard.jsx
│   │   │   └── booking/
│   │   │       ├── BookingSteps.jsx   # Steps 1-3
│   │   │       └── StepSummary.jsx    # Step 4 + payment
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── hotelSlice.js
│   │   │       ├── bookingSlice.js
│   │   │       └── uiSlice.js
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay Test Account
- Cloudinary Account

### 1. Clone & Install

```bash
# Backend
cd hotel-booking/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd frontend
cp .env.example .env
# Add VITE_API_URL and VITE_RAZORPAY_KEY_ID
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server starts at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App starts at http://localhost:5173
```

---

## ⚙️ Environment Setup

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hotel-booking
JWT_SECRET=your_minimum_32_char_secret_key_here
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay TEST Mode
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password

CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@luxestay.com
ADMIN_PASSWORD=Admin@123456
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
VITE_APP_NAME=LuxeStay
```

---

## 🔌 API Routes

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| PUT | `/api/auth/update-profile` | Update profile | Protected |
| PUT | `/api/auth/change-password` | Change password | Protected |
| POST | `/api/auth/forgot-password` | Send reset email | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password | Public |
| POST | `/api/auth/wishlist/:hotelId` | Toggle wishlist | Protected |

### Hotels
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/hotels` | Get all hotels (search/filter/sort/paginate) | Public |
| GET | `/api/hotels/featured` | Get featured hotels | Public |
| GET | `/api/hotels/cities` | Get city list | Public |
| GET | `/api/hotels/:id` | Get hotel details | Public |
| POST | `/api/hotels` | Create hotel | Admin |
| PUT | `/api/hotels/:id` | Update hotel | Admin |
| DELETE | `/api/hotels/:id` | Deactivate hotel | Admin |

### Rooms
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms` | Get rooms (filter by hotel/price/type) | Public |
| GET | `/api/rooms/:id` | Get room details | Public |
| POST | `/api/rooms/:id/check-availability` | Check availability + pricing | Public |
| POST | `/api/rooms` | Create room | Admin |
| PUT | `/api/rooms/:id` | Update room | Admin |
| DELETE | `/api/rooms/:id` | Deactivate room | Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | Protected |
| GET | `/api/bookings/my-bookings` | User's bookings | Protected |
| GET | `/api/bookings/:id` | Get booking details | Protected |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Protected |
| PUT | `/api/bookings/:id/status` | Update status | Admin |
| GET | `/api/bookings` | All bookings | Admin |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create Razorpay order | Protected |
| POST | `/api/payments/verify` | Verify payment signature | Protected |
| POST | `/api/payments/failed` | Log failed payment | Protected |
| POST | `/api/payments/:id/refund` | Process refund | Admin |
| GET | `/api/payments/my-payments` | Payment history | Protected |

### Reviews & Coupons
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews` | Get reviews for hotel | Public |
| POST | `/api/reviews` | Create review | Protected |
| PUT | `/api/reviews/:id/moderate` | Approve/reject | Admin |
| POST | `/api/coupons/validate` | Validate coupon | Protected |
| GET | `/api/coupons` | All coupons | Admin |
| POST | `/api/coupons` | Create coupon | Admin |
| PUT | `/api/coupons/:id` | Update coupon | Admin |
| DELETE | `/api/coupons/:id` | Delete coupon | Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard analytics | Admin |
| GET | `/api/admin/users` | All users | Admin |
| PUT | `/api/admin/users/:id/toggle` | Toggle user status | Admin |
| GET | `/api/admin/revenue` | Revenue analytics | Admin |
| GET | `/api/admin/reviews` | Pending reviews | Admin |

---

## 🗃 Database Schema Overview

### User
```
_id, name, email, phone, password (hashed), role (customer/admin),
avatar, address, wishlist [hotelIds], recentSearches, isActive,
resetPasswordToken, resetPasswordExpire, lastLogin, timestamps
```

### Hotel
```
_id, name, slug, description, shortDescription, starRating (1-5),
category, location {address, city, state, country, pincode, coordinates},
images [], amenities [], policies {checkIn, checkOut, cancellation, pets, smoking},
contact {phone, email}, ratings {average, count}, isFeatured, isActive,
tags [], priceRange {min, max}, timestamps
```

### Room
```
_id, hotel (ref), name, type, description, images [],
pricePerNight, discountPercent, maxOccupancy {adults, children},
bedConfiguration, bedCount, size {value, unit}, floor, view,
amenities [], totalRooms, isActive, ratings {average, count}, timestamps
```

### Booking
```
_id, bookingId (LXS-XXXX-XXX), user (ref), hotel (ref), room (ref),
checkIn, checkOut, nights, guests {adults, children}, roomsBooked,
guestDetails {firstName, lastName, email, phone, specialRequests, arrivalTime},
addOns [], pricing {basePrice, discountAmount, addOnsTotal, couponDiscount,
taxRate, taxAmount, serviceFee, totalAmount}, coupon {code, discount},
status, paymentStatus, payment (ref), cancellation {}, timestamps
```

### Payment
```
_id, booking (ref), user (ref), razorpayOrderId, razorpayPaymentId,
razorpaySignature, amount, currency, status, method, refund {}, metadata, timestamps
```

### Review
```
_id, user (ref), hotel (ref), booking (ref), rating {overall, cleanliness,
service, location, value}, title, comment, images [], isApproved,
isVerifiedStay, helpfulCount, adminResponse, timestamps
```

### Coupon
```
_id, code (unique uppercase), description, discountType (percentage/flat),
discountValue, maxDiscount, minOrderAmount, usageLimit, usedCount,
validFrom, validUntil, applicableHotels [], isActive, timestamps
```

---

## 💳 Razorpay Test Setup

### 1. Get Test Credentials
1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Create account → Switch to **Test Mode**
3. Go to Settings → API Keys → Generate Test Key
4. Copy `Key ID` and `Key Secret`

### 2. Add to Environment

```env
# Backend .env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend .env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
```

### 3. Test Card Details

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| Mastercard | `5267 3181 8797 5449` | Any | Any |
| Rupay | `6070 1010 0000 0001` | Any | Any |

### 4. Test UPI
- UPI ID: `success@razorpay`
- For failure: `failure@razorpay`

### 5. Test Netbanking
- Select any bank → Use test credentials provided in the bank's form

---

## 🚀 Deployment Guide

### Backend → Render

1. Push backend to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`
7. Set `NODE_ENV=production`

### Frontend → Vercel

1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, set root to `frontend`
4. Framework: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = your test key

### Database → MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster → Connect → Get connection string
3. Replace `MONGO_URI` in Render env vars
4. Whitelist IP: `0.0.0.0/0` (Allow all for Render)

### Post-deployment
```bash
# Run seeder against production DB (update .env MONGO_URI first)
cd backend
npm run seed
```

---

## 🔑 Admin Credentials

After running the seeder:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@luxestay.com` | `Admin@123456` |
| **Customer** | `customer@luxestay.com` | `Customer@123` |

> ⚠️ Change these credentials immediately in production!

---

## 🎟 Available Coupon Codes

| Code | Type | Discount | Min Order |
|------|------|----------|-----------|
| `WELCOME20` | 20% off | Max ₹5,000 | ₹5,000 |
| `LUXE500` | ₹500 flat | — | ₹10,000 |
| `SUMMER15` | 15% off | Max ₹3,000 | ₹3,000 |
| `HONEYMOON` | ₹2,000 flat | — | ₹15,000 |

---

## ✅ Feature Checklist

### Core Features
- [x] JWT Authentication (Register/Login/Logout)
- [x] Role-based access control (Customer/Admin)
- [x] Hotel search with filters (city, category, price, star rating, amenities)
- [x] Hotel details page with gallery, rooms, reviews, policies
- [x] Room details with availability checker
- [x] Multi-step booking flow (4 steps)
- [x] Guest details form with validation
- [x] Add-ons selection
- [x] Dynamic pricing (Base + Discount + Add-ons - Coupon + GST + Service Fee)
- [x] Coupon code system
- [x] Razorpay payment integration (Test Mode)
- [x] Payment signature verification
- [x] Booking confirmation page with invoice
- [x] Cancel booking with refund calculation
- [x] User dashboard (bookings, wishlist, profile)
- [x] Admin dashboard with analytics & charts
- [x] Hotel/Room/Booking/User/Coupon management
- [x] Responsive design (mobile/tablet/desktop)
- [x] Dark mode UI
- [x] Framer Motion animations
- [x] Toast notifications
- [x] Skeleton loaders
- [x] Error handling (global + per-component)
- [x] Rate limiting & security headers
- [x] Database seeder with realistic data

### Security
- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] Protected routes (frontend + backend)
- [x] Rate limiting (express-rate-limit)
- [x] CORS configuration
- [x] Helmet security headers
- [x] MongoDB sanitization
- [x] Input validation
- [x] Razorpay signature verification

---

## 🔮 Future Improvements

- [ ] Google OAuth login
- [ ] Email notifications (booking confirmation, cancellation)
- [ ] AI chatbot support widget
- [ ] Room availability calendar view
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Loyalty points system
- [ ] Corporate/group booking
- [ ] Dynamic room pricing (surge pricing)
- [ ] Review photos upload
- [ ] Hotel manager role (between customer and super admin)
- [ ] PDF invoice generation (pdfmake or puppeteer)
- [ ] Real-time room availability via WebSockets
- [ ] A/B testing for pricing display

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Home | Hero with search, featured hotels, destinations |
| Hotel Listing | Grid view with filters and sorting |
| Hotel Details | Gallery, rooms, reviews, booking widget |
| Room Details | Image carousel, amenities, availability checker |
| Booking Flow | 4-step process with progress indicator |
| Payment | Razorpay checkout modal |
| Confirmation | Booking summary with invoice |
| User Dashboard | Bookings, wishlist, profile |
| Admin Dashboard | Charts, stats, management tables |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License — Free to use for educational and commercial projects.

---

<div align="center">
  <strong>Built with ❤️ using React, Node.js, MongoDB & Razorpay</strong><br/>
  <em>LuxeStay — Where every stay becomes an unforgettable story.</em>
</div>
