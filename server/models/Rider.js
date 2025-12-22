const mongoose = require('mongoose');

// Schema for individual checkin record (combines ride tracking + horse info)
const checkinSchema = new mongoose.Schema({
  rideNumber: {
    type: Number,
    required: true
  },
  checkinTime: {
    type: Date,
    default: Date.now
  },
  horse: {
    type: String,
    required: true,
    trim: true
  },
  paid: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const riderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [5, 'Age must be at least 5'],
    max: [80, 'Age must be less than 80']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  checkins: {
    type: [checkinSchema],
    default: []
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  joinedDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  feesPaid: {
    type: Boolean,
    default: false
  },
  batchType: {
    type: String,
    required: [true, 'Batch type is required'],
    trim: true
    // No enum restriction - can be any batch type (morning, evening, etc.)
  },
  batchIndex: {
    type: Number,
    required: [true, 'Batch index is required'],
    min: 0
    // No max restriction - can have any number of batches
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for active classes count (only unpaid checkins)
riderSchema.virtual('activeClassesCount').get(function() {
  return this.checkins.filter(c => !c.paid).length;
});

// Index for faster queries
riderSchema.index({ batchType: 1, batchIndex: 1 });

const Rider = mongoose.model('Rider', riderSchema);

module.exports = Rider;
