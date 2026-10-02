const mongoose = require('mongoose');

const CATEGORIES = [
  'Music',
  'Concert',
  'Workshop',
  'Conference',
  'Sports',
  'Comedy',
  'Education',
  'Other'
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid event category'
      }
    },
    image: {
      type: String,
      required: [true, 'Event image URL is required'],
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Detailed address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
      default: 0
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats must be specified'],
      min: [1, 'Total seats must be at least 1']
    },
    availableSeats: {
      type: Number,
      min: [0, 'Available seats cannot be negative']
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed', 'draft'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Automatically set availableSeats equal to totalSeats when creating if not provided
eventSchema.pre('validate', function () {
  if (this.isNew && (this.availableSeats === undefined || this.availableSeats === null)) {
    this.availableSeats = this.totalSeats;
  }
});

// Indexes for high performance searching and filtering
eventSchema.index({ category: 1, date: 1, status: 1 });
eventSchema.index({ city: 1 });
eventSchema.index({ ticketPrice: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
