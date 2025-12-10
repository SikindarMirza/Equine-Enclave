const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const AdminUser = require('../models/AdminUser')

// Generate a simple token
const generateToken = (userId) => {
  const payload = `${userId}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`
  return Buffer.from(payload).toString('base64')
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      })
    }

    // Find user
    const user = await AdminUser.findOne({ username: username.toLowerCase() })
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      })
    }

    // Check password
    if (!user.checkPassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// Verify token (simple check - for production use JWT)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    // Decode token to get user ID
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const userId = decoded.split('-')[0]

    const user = await AdminUser.findById(userId)
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
})

// Logout (client-side will remove token, but we can log it)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Seed admin user (run once to create initial admin)
router.post('/seed', async (req, res) => {
  try {
    const existingAdmin = await AdminUser.findOne({ username: 'admin' })
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists'
      })
    }

    const adminUser = new AdminUser({
      username: 'admin',
      password: 'admin123', // Change this!
      name: 'Administrator',
      email: 'admin@equineenclave.com',
      role: 'superadmin'
    })

    await adminUser.save()

    res.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        username: 'admin',
        password: 'admin123 (please change this)'
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating admin user'
    })
  }
})

module.exports = router

