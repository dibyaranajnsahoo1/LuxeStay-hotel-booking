const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Hotel = require('../src/models/Hotel');
const Room = require('../src/models/Room');
const { Coupon } = require('../src/models/ReviewCoupon');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding');
};

const hotelImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
];

const roomImages = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
];

const hotelsData = [
  {
    name: 'The Grand Leela Palace',
    description: 'Experience unparalleled luxury at The Grand Leela Palace. A masterpiece of Mughal architecture blended with contemporary design, offering world-class amenities and impeccable service. Nestled in the heart of Mumbai, this iconic property stands as a testament to India\'s rich cultural heritage and modern sophistication.',
    shortDescription: 'Iconic luxury palace hotel with Mughal architecture and world-class amenities',
    starRating: 5, category: 'luxury',
    location: { address: 'Sahar Airport Road, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400059', coordinates: { lat: 19.0990, lng: 72.8777 } },
    images: hotelImages.map((url, i) => ({ url, caption: `Hotel view ${i + 1}` })),
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Valet Parking', 'Concierge', 'Airport Transfer', 'Business Center', 'Kids Club'],
    policies: { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Free cancellation up to 48 hours before check-in', pets: false, smoking: false },
    contact: { phone: '+91-22-6811-1234', email: 'reservations@grandleela.com' },
    isFeatured: true, isActive: true,
    ratings: { average: 4.8, count: 342 },
    priceRange: { min: 8999, max: 45000 },
    tags: ['luxury', 'business', 'spa', 'pool', 'mumbai']
  },
  {
    name: 'Ritz Carlton Bangalore',
    description: 'The Ritz-Carlton, Bangalore is an urban sanctuary that offers the perfect blend of luxury, comfort, and impeccable service. Located in the heart of Silicon Valley of India, this magnificent property features stunning architecture, world-class dining, and a legendary spa that will rejuvenate your senses.',
    shortDescription: 'Urban luxury sanctuary in the heart of Bangalore\'s business district',
    starRating: 5, category: 'luxury',
    location: { address: '99, Residency Road', city: 'Bangalore', state: 'Karnataka', pincode: '560025', coordinates: { lat: 12.9716, lng: 77.5946 } },
    images: [hotelImages[1], hotelImages[2], hotelImages[0], hotelImages[3]].map((url, i) => ({ url, caption: `View ${i + 1}` })),
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Room Service', 'Valet Parking', 'Butler Service', 'Executive Lounge'],
    policies: { checkIn: '3:00 PM', checkOut: '12:00 PM', cancellation: 'Free cancellation up to 24 hours before check-in', pets: false, smoking: false },
    contact: { phone: '+91-80-4914-8000', email: 'bangalore@ritzcarlton.com' },
    isFeatured: true, isActive: true,
    ratings: { average: 4.9, count: 512 },
    priceRange: { min: 12000, max: 65000 },
    tags: ['luxury', 'business', 'spa', 'dining', 'bangalore']
  },
  {
    name: 'Taj Lake Palace Udaipur',
    description: 'Rising ethereally from the shimmering waters of Lake Pichola, the Taj Lake Palace is a vision of white marble that has captivated visitors for over 250 years. This architectural marvel, formerly the summer palace of the Mewar royal family, offers an unparalleled experience of royal opulence surrounded by the Aravalli Hills.',
    shortDescription: 'Iconic floating palace hotel on Lake Pichola with royal heritage',
    starRating: 5, category: 'heritage',
    location: { address: 'Lake Pichola', city: 'Udaipur', state: 'Rajasthan', pincode: '313001', coordinates: { lat: 24.5763, lng: 73.6802 } },
    images: [hotelImages[2], hotelImages[4], hotelImages[1], hotelImages[0]].map((url, i) => ({ url, caption: `Palace view ${i + 1}` })),
    amenities: ['Free WiFi', 'Infinity Pool', 'Spa', 'Heritage Dining', 'Boat Transfer', 'Yoga', 'Cultural Performances', 'Heritage Walks'],
    policies: { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Free cancellation up to 72 hours before check-in', pets: false, smoking: false },
    contact: { phone: '+91-294-242-8800', email: 'lakepalace.udaipur@tajhotels.com' },
    isFeatured: true, isActive: true,
    ratings: { average: 4.9, count: 891 },
    priceRange: { min: 18000, max: 120000 },
    tags: ['heritage', 'royal', 'lake', 'romantic', 'udaipur', 'rajasthan']
  },
  {
    name: 'ITC Maurya New Delhi',
    description: 'ITC Maurya is an iconic luxury hotel in New Delhi, named after the great Maurya dynasty. Home to the legendary Bukhara restaurant, this hotel seamlessly blends modern luxury with the cultural richness of India. Located in the diplomatic enclave of Chanakyapuri, it is the preferred choice of heads of state and discerning travellers.',
    shortDescription: 'Legendary luxury hotel home to Bukhara, India\'s most celebrated restaurant',
    starRating: 5, category: 'luxury',
    location: { address: 'Sardar Patel Marg, Diplomatic Enclave', city: 'New Delhi', state: 'Delhi', pincode: '110021', coordinates: { lat: 28.5974, lng: 77.1720 } },
    images: [hotelImages[3], hotelImages[0], hotelImages[2], hotelImages[4]].map((url, i) => ({ url, caption: `View ${i + 1}` })),
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Multiple Restaurants', 'Bar', 'Gym', 'Business Center', 'Concierge', 'Valet Parking'],
    policies: { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Free cancellation up to 48 hours before check-in', pets: false, smoking: false },
    contact: { phone: '+91-11-2611-2233', email: 'itcmaurya@itchotels.in' },
    isFeatured: true, isActive: true,
    ratings: { average: 4.7, count: 624 },
    priceRange: { min: 9500, max: 55000 },
    tags: ['luxury', 'diplomatic', 'restaurant', 'delhi', 'business']
  },
  {
    name: 'The Oberoi Amarvilas',
    description: 'Every room at The Oberoi Amarvilas offers a view of the Taj Mahal, making it one of the most extraordinary hotels in the world. The opulent interiors draw inspiration from Mughal and Moorish architecture, with stunning fountains, terraced lawns, and a palatial swimming pool. Staying here is a spiritual experience, waking up to the first light of dawn illuminating the Taj.',
    shortDescription: 'Uninterrupted views of the Taj Mahal from every room and suite',
    starRating: 5, category: 'luxury',
    location: { address: 'Taj East Gate Road', city: 'Agra', state: 'Uttar Pradesh', pincode: '282001', coordinates: { lat: 27.1751, lng: 78.0421 } },
    images: [hotelImages[4], hotelImages[1], hotelImages[3], hotelImages[0]].map((url, i) => ({ url, caption: `Taj view ${i + 1}` })),
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Taj View Rooms', 'Fine Dining', 'Terrace', 'Yoga', 'Heritage Tours'],
    policies: { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Free cancellation up to 48 hours before check-in', pets: false, smoking: false },
    contact: { phone: '+91-562-223-1515', email: 'reservations@oberoihotels.com' },
    isFeatured: true, isActive: true,
    ratings: { average: 4.9, count: 1247 },
    priceRange: { min: 25000, max: 180000 },
    tags: ['luxury', 'taj-mahal', 'heritage', 'romantic', 'agra']
  },
  {
    name: 'Marriott Goa Resort & Spa',
    description: 'Nestled on a pristine stretch of Miramar Beach, the Goa Marriott Resort & Spa offers a perfect tropical getaway. With lush gardens, a stunning pool, and direct beach access, this resort captures the essence of Goan paradise. The vibrant dining scene, world-class spa, and extensive water sports make it a complete beach holiday destination.',
    shortDescription: 'Tropical beachfront resort on Miramar Beach with world-class spa',
    starRating: 5, category: 'resort',
    location: { address: 'Miramar Beach, Panaji', city: 'Goa', state: 'Goa', pincode: '403001', coordinates: { lat: 15.4909, lng: 73.8278 } },
    images: [hotelImages[0], hotelImages[4], hotelImages[2], hotelImages[1]].map((url, i) => ({ url, caption: `Resort view ${i + 1}` })),
    amenities: ['Free WiFi', 'Beachfront Pool', 'Spa', 'Water Sports', 'Beach Bar', 'Multiple Restaurants', 'Kids Club', 'Gym', 'Yoga'],
    policies: { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 24 hours before check-in', pets: false, smoking: false },
    contact: { phone: '+91-832-246-3333', email: 'goa@marriott.com' },
    isFeatured: false, isActive: true,
    ratings: { average: 4.6, count: 785 },
    priceRange: { min: 7500, max: 35000 },
    tags: ['resort', 'beach', 'goa', 'spa', 'water-sports']
  }
];

const generateRoomsForHotel = (hotelId, hotelName) => [
  {
    hotel: hotelId, name: `${hotelName} - Deluxe Room`,
    type: 'deluxe', description: 'Our spacious Deluxe Room offers a sanctuary of comfort with elegant furnishings, a marble bathroom with a soaking tub, and stunning views. Featuring a plush king-size bed, premium linens, and a 55-inch smart TV.',
    images: roomImages.slice(0, 3).map((url, i) => ({ url, caption: `Room ${i + 1}` })),
    pricePerNight: 8999, discountPercent: 10,
    maxOccupancy: { adults: 2, children: 1 },
    bedConfiguration: 'king', bedCount: 1,
    size: { value: 450, unit: 'sqft' }, view: 'city',
    amenities: ['King Bed', 'Air Conditioning', 'Free WiFi', 'Smart TV', 'Mini Bar', 'Safe', 'Hair Dryer', 'Bathrobe', 'Soaking Tub', 'Work Desk'],
    totalRooms: 15, isActive: true
  },
  {
    hotel: hotelId, name: `${hotelName} - Premium Suite`,
    type: 'suite', description: 'The Premium Suite redefines luxury with a separate living area, private dining for four, and panoramic views. Featuring a master bedroom with a four-poster bed, marble bathroom, private terrace, and exclusive butler service.',
    images: [roomImages[1], roomImages[3], roomImages[0]].map((url, i) => ({ url, caption: `Suite ${i + 1}` })),
    pricePerNight: 22999, discountPercent: 5,
    maxOccupancy: { adults: 3, children: 2 },
    bedConfiguration: 'king', bedCount: 1,
    size: { value: 900, unit: 'sqft' }, view: 'garden',
    amenities: ['King Bed', 'Living Room', 'Dining Area', 'Butler Service', 'Private Terrace', 'Jacuzzi', 'Free WiFi', 'Smart TV', 'Mini Bar', 'Premium Toiletries'],
    totalRooms: 6, isActive: true
  },
  {
    hotel: hotelId, name: `${hotelName} - Superior Twin`,
    type: 'standard', description: 'Perfect for friends or colleagues, our Superior Twin Room features two single beds, modern amenities, and a well-appointed bathroom. Enjoy comfortable stays with all the essentials for a productive or leisure visit.',
    images: [roomImages[4], roomImages[2], roomImages[1]].map((url, i) => ({ url, caption: `Twin ${i + 1}` })),
    pricePerNight: 6499, discountPercent: 15,
    maxOccupancy: { adults: 2, children: 1 },
    bedConfiguration: 'twin', bedCount: 2,
    size: { value: 380, unit: 'sqft' }, view: 'city',
    amenities: ['Twin Beds', 'Air Conditioning', 'Free WiFi', 'Smart TV', 'Safe', 'Work Desk', 'Hair Dryer'],
    totalRooms: 20, isActive: true
  },
  {
    hotel: hotelId, name: `${hotelName} - Presidential Suite`,
    type: 'presidential', description: 'The pinnacle of luxury, the Presidential Suite offers an entire floor of opulence. Two master bedrooms, a grand living room, private dining, home theatre, Jacuzzi, and dedicated butler team ensure an unmatched stay experience.',
    images: [roomImages[3], roomImages[0], roomImages[4]].map((url, i) => ({ url, caption: `Presidential ${i + 1}` })),
    pricePerNight: 55000, discountPercent: 0,
    maxOccupancy: { adults: 4, children: 2 },
    bedConfiguration: 'king', bedCount: 2,
    size: { value: 2200, unit: 'sqft' }, view: 'city',
    amenities: ['2 Master Bedrooms', 'Grand Living Room', 'Private Dining', 'Home Theatre', 'Jacuzzi', 'Butler Service', 'Private Terrace', 'Premium Bar', 'Gym Equipment'],
    totalRooms: 2, isActive: true
  }
];

const couponsData = [
  { code: 'WELCOME20', description: 'Welcome offer - 20% off on first booking', discountType: 'percentage', discountValue: 20, maxDiscount: 5000, minOrderAmount: 5000, usageLimit: 1000, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'LUXE500', description: 'Flat ₹500 off on bookings above ₹10,000', discountType: 'flat', discountValue: 500, minOrderAmount: 10000, usageLimit: null, validFrom: new Date(), validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'SUMMER15', description: 'Summer special - 15% off all bookings', discountType: 'percentage', discountValue: 15, maxDiscount: 3000, minOrderAmount: 3000, usageLimit: 500, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'HONEYMOON', description: 'Honeymoon special - ₹2000 off', discountType: 'flat', discountValue: 2000, minOrderAmount: 15000, usageLimit: 200, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([User.deleteMany(), Hotel.deleteMany(), Room.deleteMany(), Coupon.deleteMany()]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@luxestay.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isEmailVerified: true,
      phone: '9876543210'
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample customer
    const customer = await User.create({
      name: 'Rajesh Kumar',
      email: 'customer@luxestay.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '9876543211',
      isEmailVerified: true
    });
    console.log(`✅ Sample customer created: ${customer.email}`);

    // Create hotels
    console.log('🏨 Creating hotels...');
    const slugify = require('slugify');

const hotelsWithSlugs = hotelsData.map((hotel) => ({
  ...hotel,
  slug:
    slugify(hotel.name, {
      lower: true,
      strict: true,
    }) +
    '-' +
    Date.now() +
    '-' +
    Math.floor(Math.random() * 1000),
}));

const hotels = await Hotel.insertMany(hotelsWithSlugs);
    console.log(`✅ Created ${hotels.length} hotels`);

    // Create rooms for each hotel
    console.log('🛏️  Creating rooms...');
    let totalRooms = 0;
    for (const hotel of hotels) {
      const rooms = generateRoomsForHotel(hotel._id, hotel.name);
      await Room.insertMany(rooms);
      totalRooms += rooms.length;
    }
    console.log(`✅ Created ${totalRooms} rooms`);

    // Create coupons
    console.log('🎟️  Creating coupons...');
    await Coupon.insertMany(couponsData);
    console.log(`✅ Created ${couponsData.length} coupons`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('🔑 CREDENTIALS:');
    console.log(`   Admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log(`   Customer: customer@luxestay.com / Customer@123`);
    console.log('═══════════════════════════════════════════');
    console.log('🎟️  COUPON CODES: WELCOME20, LUXE500, SUMMER15, HONEYMOON');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
