const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  rideTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  riderName: {
    type: String,
    required: [true, 'Rider name is required'],
    trim: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  riderLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Rider level is required']
  },
  horse: {
    type: String,
    required: [true, 'Horse name is required'],
    trim: true
  },
  batchType: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  batchName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
rideSchema.index({ rideTime: -1 });
rideSchema.index({ riderId: 1 });
rideSchema.index({ riderLevel: 1 });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;

