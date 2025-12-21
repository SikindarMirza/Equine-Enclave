const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');

// GET all rides (with pagination and filters)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      riderLevel, 
      riderId,
      batchType,
      startDate,
      endDate 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (riderLevel) {
      filter.riderLevel = riderLevel;
    }
    
    if (riderId) {
      filter.riderId = riderId;
    }
    
    if (batchType) {
      filter.batchType = batchType;
    }
    
    if (startDate || endDate) {
      filter.rideTime = {};
      if (startDate) {
        filter.rideTime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.rideTime.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .sort({ rideTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Ride.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: rides.map(ride => ({
        id: ride._id,
        ...ride
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET ride by ID
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: ride._id,
        ...ride
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET rides by rider ID
router.get('/rider/:riderId', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rides, total] = await Promise.all([
      Ride.find({ riderId: req.params.riderId })
        .sort({ rideTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Ride.countDocuments({ riderId: req.params.riderId })
    ]);

    res.json({
      success: true,
      data: rides.map(ride => ({
        id: ride._id,
        ...ride
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET rides statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalRides,
      todayRides,
      weekRides,
      monthRides,
      ridesByLevel
    ] = await Promise.all([
      Ride.countDocuments(),
      Ride.countDocuments({ rideTime: { $gte: today } }),
      Ride.countDocuments({ rideTime: { $gte: thisWeekStart } }),
      Ride.countDocuments({ rideTime: { $gte: thisMonthStart } }),
      Ride.aggregate([
        { $group: { _id: '$riderLevel', count: { $sum: 1 } } }
      ])
    ]);

    const levelStats = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };
    
    ridesByLevel.forEach(item => {
      levelStats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        totalRides,
        todayRides,
        weekRides,
        monthRides,
        ridesByLevel: levelStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE ride by ID (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      message: 'Ride deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

