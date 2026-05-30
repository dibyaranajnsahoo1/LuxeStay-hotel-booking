const mongoose = require('mongoose');
const slugify = require('slugify');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },

    description: {
      type: String,
      required: [true, 'Hotel description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },

    starRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    category: {
      type: String,
      enum: [
        'luxury',
        'boutique',
        'business',
        'resort',
        'heritage',
        'budget',
      ],
      default: 'luxury',
    },

    location: {
      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        default: 'India',
      },

      pincode: String,

      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    images: [
      {
        public_id: String,

        url: {
          type: String,
          required: true,
        },

        caption: String,
      },
    ],

    amenities: [{ type: String }],

    policies: {
      checkIn: {
        type: String,
        default: '2:00 PM',
      },

      checkOut: {
        type: String,
        default: '12:00 PM',
      },

      cancellation: {
        type: String,
        default: 'Free cancellation up to 24 hours before check-in',
      },

      pets: {
        type: Boolean,
        default: false,
      },

      smoking: {
        type: Boolean,
        default: false,
      },

      extraBed: String,
      children: String,
    },

    contact: {
      phone: String,
      email: String,
      website: String,
    },

    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
      },
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: [String],

    priceRange: {
      min: Number,
      max: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug automatically
hotelSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug =
      slugify(this.name, {
        lower: true,
        strict: true,
      }) +
      '-' +
      Date.now();
  }

  next();
});

// Virtual for rooms
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
});

hotelSchema.set('toJSON', { virtuals: true });
hotelSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hotel', hotelSchema);