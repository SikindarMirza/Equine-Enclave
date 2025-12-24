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
    // Get timezone offset from client (in minutes)
    // getTimezoneOffset() returns positive for behind UTC, negative for ahead
    // For IST (UTC+5:30), it returns -330
    const tzOffset = req.query.tzOffset ? parseInt(req.query.tzOffset) : -330;
    
    // Calculate start of today in the client's timezone
    // 1. Get current UTC time
    const now = new Date();
    
    // 2. Calculate what time it is in client's timezone
    //    Local time = UTC time - tzOffset (because getTimezoneOffset returns UTC - Local)
    const clientLocalMs = now.getTime() - (tzOffset * 60 * 1000);
    const clientLocalDate = new Date(clientLocalMs);
    
    // 3. Get midnight on that date (in UTC milliseconds)
    const midnightUTCMs = Date.UTC(
      clientLocalDate.getUTCFullYear(),
      clientLocalDate.getUTCMonth(),
      clientLocalDate.getUTCDate()
    );
    
    // 4. Convert back: midnight in client's timezone expressed as UTC
    //    Add back the offset to get the UTC equivalent of client's midnight
    const today = new Date(midnightUTCMs + (tzOffset * 60 * 1000));
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    const thisMonthStart = new Date(today);
    thisMonthStart.setDate(1);

    const [
      totalRides,
      todayRides,
      weekRides,
      monthRides,
      ridesByLevel,
      todayMorningCheckins,
      todayEveningCheckins
    ] = await Promise.all([
      Ride.countDocuments(),
      Ride.countDocuments({ rideTime: { $gte: today } }),
      Ride.countDocuments({ rideTime: { $gte: thisWeekStart } }),
      Ride.countDocuments({ rideTime: { $gte: thisMonthStart } }),
      Ride.aggregate([
        { $group: { _id: '$riderLevel', count: { $sum: 1 } } }
      ]),
      Ride.countDocuments({ rideTime: { $gte: today }, batchType: 'morning' }),
      Ride.countDocuments({ rideTime: { $gte: today }, batchType: 'evening' })
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
        ridesByLevel: levelStats,
        todayCheckins: {
          morning: todayMorningCheckins,
          evening: todayEveningCheckins
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DEBUG: GET today's rides to verify the query
router.get('/debug/today', async (req, res) => {
  try {
    const tzOffset = req.query.tzOffset ? parseInt(req.query.tzOffset) : -330;
    
    const now = new Date();
    const clientLocalMs = now.getTime() - (tzOffset * 60 * 1000);
    const clientLocalDate = new Date(clientLocalMs);
    const midnightUTCMs = Date.UTC(
      clientLocalDate.getUTCFullYear(),
      clientLocalDate.getUTCMonth(),
      clientLocalDate.getUTCDate()
    );
    const today = new Date(midnightUTCMs + (tzOffset * 60 * 1000));
    
    const todayRides = await Ride.find({ rideTime: { $gte: today } })
      .sort({ rideTime: -1 })
      .lean();
    
    res.json({
      success: true,
      debug: {
        serverTimeUTC: now.toISOString(),
        todayStartsAtUTC: today.toISOString(),
        tzOffsetReceived: tzOffset,
        totalRidesToday: todayRides.length
      },
      rides: todayRides.map(r => ({
        id: r._id,
        riderName: r.riderName,
        batchType: r.batchType,
        rideTime: r.rideTime,
        horse: r.horse
      }))
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

