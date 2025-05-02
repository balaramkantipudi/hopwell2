// models/Trip.js - Expanded model
import mongoose from 'mongoose';

const dayItinerarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  activities: [{
    time: String,
    title: String,
    description: String,
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      address: String
    },
    duration: Number, // in minutes
    type: {
      type: String,
      enum: ['sightseeing', 'food', 'accommodation', 'transportation', 'activity', 'other']
    },
    cost: Number,
    image: String,
    bookingLink: String
  }]
});

const accommodationSchema = new mongoose.Schema({
  name: String,
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String
  },
  checkIn: Date,
  checkOut: Date,
  pricePerNight: Number,
  totalPrice: Number,
  roomType: String,
  amenities: [String],
  rating: Number,
  image: String,
  bookingLink: String,
  bookingStatus: {
    type: String,
    enum: ['not_booked', 'pending', 'confirmed'],
    default: 'not_booked'
  }
});

const transportationSchema = new mongoose.Schema({
  type: String,
  from: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  to: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  departureTime: Date,
  arrivalTime: Date,
  provider: String,
  price: Number,
  bookingReference: String,
  bookingLink: String,
  bookingStatus: {
    type: String,
    enum: ['not_booked', 'pending', 'confirmed'],
    default: 'not_booked'
  }
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  transportMode: {
    type: String,
    enum: ['air', 'train', 'bus', 'drive'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  hotelStyle: {
    type: String,
    enum: ['ultraLuxury', 'luxury', 'comfortable', 'budget', 'experience'],
    required: true
  },
  cuisine: String,
  theme: {
    type: String,
    required: true
  },
  groupType: {
    type: String,
    enum: ['couple', 'family', 'friends', 'work', 'solo'],
    required: true
  },
  groupCount: {
    type: Number,
    required: true,
    min: 1
  },
  budget: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['budget', 'time', 'distance', 'experience', 'safety'],
    required: true
  },
  itinerary: [dayItinerarySchema],
  accommodations: [accommodationSchema],
  transportation: [transportationSchema],
  totalCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  ratings: {
    overall: { type: Number, min: 1, max: 5 },
    accommodations: { type: Number, min: 1, max: 5 },
    activities: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the updatedAt field
tripSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);