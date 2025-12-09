const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  batchType: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  batchIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 2
  }
}, {
  timestamps: true
});

// Compound index to ensure unique batch per type and index
batchSchema.index({ batchType: 1, batchIndex: 1 }, { unique: true });

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;

