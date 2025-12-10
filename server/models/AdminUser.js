const mongoose = require('mongoose')
const crypto = require('crypto')

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Hash password before saving
adminUserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next()
  
  // Simple hash using crypto (for production, use bcrypt)
  this.password = crypto.createHash('sha256').update(this.password).digest('hex')
  next()
})

// Method to check password
adminUserSchema.methods.checkPassword = function(password) {
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
  return this.password === hashedPassword
}

// Don't return password in JSON
adminUserSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('AdminUser', adminUserSchema)

