const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');
const Batch = require('../models/Batch');
const Ride = require('../models/Ride');

// Helper to get batch config from database
const getBatchConfig = async () => {
  const batches = await Batch.find().sort({ batchType: 1, batchIndex: 1 });
  
  const config = {
    morning: [],
    evening: []
  };
  
  batches.forEach(batch => {
    config[batch.batchType][batch.batchIndex] = {
      _id: batch._id,
      name: batch.name,
      time: batch.time
    };
  });
  
  // Fallback to defaults if no batches in DB
  if (config.morning.length === 0) {
    config.morning = [
      { name: 'Batch 1', time: '6:00 AM - 7:30 AM' },
      { name: 'Batch 2', time: '7:30 AM - 9:00 AM' },
      { name: 'Batch 3', time: '9:00 AM - 10:30 AM' }
    ];
  }
  if (config.evening.length === 0) {
    config.evening = [
      { name: 'Batch 1', time: '4:00 PM - 5:30 PM' },
      { name: 'Batch 2', time: '5:30 PM - 7:00 PM' },
      { name: 'Batch 3', time: '7:00 PM - 8:30 PM' }
    ];
  }
  
  return config;
};

// Helper to generate dummy checkin entries with past timestamps
const generateCheckins = (count, joinedDate) => {
  const entries = [];
  const startDate = new Date(joinedDate);
  const now = new Date();
  const horses = ['Alishan', 'Aslan', 'Timur', 'Clara', 'XLove', 'Antilope'];
  
  for (let i = 0; i < count; i++) {
    // Spread entries between joined date and now
    const randomTime = startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime());
    entries.push({
      rideNumber: i + 1,
      checkinTime: new Date(randomTime),
      horse: horses[Math.floor(Math.random() * horses.length)]
    });
  }
  
  // Sort by checkinTime
  entries.sort((a, b) => a.checkinTime - b.checkinTime);
  
  // Re-number rides after sorting
  entries.forEach((entry, idx) => {
    entry.rideNumber = idx + 1;
  });
  
  return entries;
};

// Helper to format rider response
const formatRider = (rider, batchConfig) => {
  const riderObj = rider.toObject ? rider.toObject() : rider;
  return {
    id: riderObj._id,
    ...riderObj,
    activeClassesCount: riderObj.checkins?.length || 0,
    batchName: batchConfig?.[riderObj.batchType]?.[riderObj.batchIndex]?.name || `Batch ${riderObj.batchIndex + 1}`,
    batchTime: batchConfig?.[riderObj.batchType]?.[riderObj.batchIndex]?.time || ''
  };
};

// GET all riders
router.get('/', async (req, res) => {
  try {
    const batchConfig = await getBatchConfig();
    const riders = await Rider.find().sort({ batchType: 1, batchIndex: 1, name: 1 });
    const formattedRiders = riders.map(r => formatRider(r, batchConfig));
    
    res.json({
      success: true,
      data: formattedRiders,
      count: formattedRiders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET all batches with riders
router.get('/batches', async (req, res) => {
  try {
    const batchConfig = await getBatchConfig();
    const riders = await Rider.find().sort({ name: 1 });
    
    // Organize riders by batches
    const morning = batchConfig.morning.map((batch, index) => ({
      ...batch,
      batchIndex: index,
      riders: riders
        .filter(r => r.batchType === 'morning' && r.batchIndex === index)
        .map(r => formatRider(r, batchConfig))
    }));
    
    const evening = batchConfig.evening.map((batch, index) => ({
      ...batch,
      batchIndex: index,
      riders: riders
        .filter(r => r.batchType === 'evening' && r.batchIndex === index)
        .map(r => formatRider(r, batchConfig))
    }));
    
    res.json({
      success: true,
      data: {
        morning,
        evening
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET single rider by ID
router.get('/:id', async (req, res) => {
  try {
    const batchConfig = await getBatchConfig();
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    res.json({
      success: true,
      data: formatRider(rider, batchConfig)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST create new rider
router.post('/', async (req, res) => {
  try {
    const { name, age, phone, email, level, batchType, batchIndex } = req.body;
    
    // Validation
    if (!name || !age || !phone || !batchType || batchIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, age, phone, batchType, batchIndex'
      });
    }
    
    // Validate batchType
    if (!['morning', 'evening'].includes(batchType)) {
      return res.status(400).json({
        success: false,
        message: 'batchType must be "morning" or "evening"'
      });
    }
    
    // Validate batchIndex
    if (batchIndex < 0 || batchIndex > 10) {
      return res.status(400).json({
        success: false,
        message: 'batchIndex must be between 0 and 10'
      });
    }
    
    const newRider = new Rider({
      name,
      age: parseInt(age),
      phone,
      email: email || '',
      level: level || 'beginner',
      batchType,
      batchIndex: parseInt(batchIndex),
      checkins: [], // Empty array for new riders
      feesPaid: false,
      joinedDate: new Date().toISOString().split('T')[0]
    });
    
    const savedRider = await newRider.save();
    const batchConfig = await getBatchConfig();
    
    res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      data: formatRider(savedRider, batchConfig)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update rider
router.put('/:id', async (req, res) => {
  try {
    const { name, age, phone, email, level, feesPaid } = req.body;
    
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    // Update fields if provided
    if (name !== undefined) rider.name = name;
    if (age !== undefined) rider.age = parseInt(age);
    if (phone !== undefined) rider.phone = phone;
    if (email !== undefined) rider.email = email;
    if (level !== undefined) rider.level = level;
    if (feesPaid !== undefined) rider.feesPaid = feesPaid;
    
    const updatedRider = await rider.save();
    const batchConfig = await getBatchConfig();
    
    res.json({
      success: true,
      message: 'Rider updated successfully',
      data: formatRider(updatedRider, batchConfig)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH check-in rider (add new checkin record and create a Ride)
router.patch('/:id/checkin', async (req, res) => {
  try {
    const { horse } = req.body;
    
    // Validate horse selection
    if (!horse) {
      return res.status(400).json({
        success: false,
        message: 'Horse selection is required'
      });
    }
    
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    const checkinTime = new Date();
    const newRideNumber = rider.checkins.length + 1;
    
    // Get batch config to retrieve batch name
    const batchConfig = await getBatchConfig();
    const batchName = batchConfig?.[rider.batchType]?.[rider.batchIndex]?.name || `Batch ${rider.batchIndex + 1}`;
    
    // Add checkin record to rider
    rider.checkins.push({
      rideNumber: newRideNumber,
      checkinTime: checkinTime,
      horse: horse
    });
    
    // Save rider and create Ride in parallel (independent operations)
    const [updatedRider, savedRide] = await Promise.all([
      rider.save(),
      Ride.create({
        rideTime: checkinTime,
        riderName: rider.name,
        riderId: rider._id,
        riderLevel: rider.level,
        horse: horse,
        batchType: rider.batchType,
        batchName: batchName
      })
    ]);
    
    res.json({
      success: true,
      message: 'Check-in successful',
      data: formatRider(updatedRider, batchConfig),
      ride: {
        id: savedRide._id,
        rideTime: savedRide.rideTime,
        riderName: savedRide.riderName,
        riderLevel: savedRide.riderLevel,
        horse: savedRide.horse
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH pay fees (remove first 26 checkin entries)
router.patch('/:id/pay', async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    if (rider.checkins.length < 26) {
      return res.status(400).json({
        success: false,
        message: 'Payment not required. Active classes less than 26.'
      });
    }
    
    // Remove first 26 entries (oldest checkins)
    rider.checkins = rider.checkins.slice(26);
    
    // Re-number remaining rides
    rider.checkins.forEach((entry, idx) => {
      entry.rideNumber = idx + 1;
    });
    
    const updatedRider = await rider.save();
    const batchConfig = await getBatchConfig();
    
    res.json({
      success: true,
      message: 'Payment recorded. 26 classes deducted.',
      data: formatRider(updatedRider, batchConfig)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH move rider to different batch
router.patch('/:id/move', async (req, res) => {
  try {
    const { targetBatchType, targetBatchIndex } = req.body;
    
    // Validation
    if (!targetBatchType || targetBatchIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: targetBatchType, targetBatchIndex'
      });
    }
    
    if (!['morning', 'evening'].includes(targetBatchType)) {
      return res.status(400).json({
        success: false,
        message: 'targetBatchType must be "morning" or "evening"'
      });
    }
    
    if (targetBatchIndex < 0 || targetBatchIndex > 10) {
      return res.status(400).json({
        success: false,
        message: 'targetBatchIndex must be between 0 and 10'
      });
    }
    
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    rider.batchType = targetBatchType;
    rider.batchIndex = parseInt(targetBatchIndex);
    const updatedRider = await rider.save();
    const batchConfig = await getBatchConfig();
    
    res.json({
      success: true,
      message: 'Rider moved successfully',
      data: formatRider(updatedRider, batchConfig)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE rider
router.delete('/:id', async (req, res) => {
  try {
    const batchConfig = await getBatchConfig();
    const rider = await Rider.findByIdAndDelete(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Rider deleted successfully',
      data: formatRider(rider, batchConfig)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST seed initial data (for development)
router.post('/seed', async (req, res) => {
  try {
    // Clear existing data
    await Rider.deleteMany({});
    
    // Initial riders data with checkins array
    const initialRiders = [
      // Morning Batch 1
      { name: 'Aanya Sharma', age: 14, phone: '+91 98765 43210', email: 'aanya.s@email.com', checkins: generateCheckins(28, '2024-03-15'), level: 'intermediate', joinedDate: '2024-03-15', feesPaid: true, batchType: 'morning', batchIndex: 0 },
      { name: 'Rohan Kapoor', age: 16, phone: '+91 98765 43211', email: 'rohan.k@email.com', checkins: generateCheckins(32, '2023-11-20'), level: 'advanced', joinedDate: '2023-11-20', feesPaid: true, batchType: 'morning', batchIndex: 0 },
      { name: 'Priya Malhotra', age: 12, phone: '+91 98765 43212', email: 'priya.m@email.com', checkins: generateCheckins(14, '2025-01-10'), level: 'beginner', joinedDate: '2025-01-10', feesPaid: false, batchType: 'morning', batchIndex: 0 },
      { name: 'Arjun Singh', age: 15, phone: '+91 98765 43213', email: 'arjun.s@email.com', checkins: generateCheckins(26, '2024-06-22'), level: 'intermediate', joinedDate: '2024-06-22', feesPaid: true, batchType: 'morning', batchIndex: 0 },
      { name: 'Meera Patel', age: 13, phone: '+91 98765 43214', email: 'meera.p@email.com', checkins: generateCheckins(18, '2025-02-05'), level: 'beginner', joinedDate: '2025-02-05', feesPaid: false, batchType: 'morning', batchIndex: 0 },
      
      // Morning Batch 2
      { name: 'Kabir Verma', age: 17, phone: '+91 98765 43215', email: 'kabir.v@email.com', checkins: generateCheckins(30, '2023-08-14'), level: 'advanced', joinedDate: '2023-08-14', feesPaid: true, batchType: 'morning', batchIndex: 1 },
      { name: 'Ishaan Reddy', age: 14, phone: '+91 98765 43216', email: 'ishaan.r@email.com', checkins: generateCheckins(22, '2024-04-18'), level: 'intermediate', joinedDate: '2024-04-18', feesPaid: true, batchType: 'morning', batchIndex: 1 },
      { name: 'Tara Gupta', age: 11, phone: '+91 98765 43217', email: 'tara.g@email.com', checkins: generateCheckins(12, '2025-03-01'), level: 'beginner', joinedDate: '2025-03-01', feesPaid: false, batchType: 'morning', batchIndex: 1 },
      { name: 'Vikram Joshi', age: 16, phone: '+91 98765 43218', email: 'vikram.j@email.com', checkins: generateCheckins(35, '2023-09-25'), level: 'advanced', joinedDate: '2023-09-25', feesPaid: true, batchType: 'morning', batchIndex: 1 },
      { name: 'Ananya Kumar', age: 13, phone: '+91 98765 43219', email: 'ananya.k@email.com', checkins: generateCheckins(20, '2024-07-30'), level: 'intermediate', joinedDate: '2024-07-30', feesPaid: false, batchType: 'morning', batchIndex: 1 },
      
      // Morning Batch 3
      { name: 'Siddharth Rao', age: 15, phone: '+91 98765 43220', email: 'siddharth.r@email.com', checkins: generateCheckins(27, '2024-02-12'), level: 'intermediate', joinedDate: '2024-02-12', feesPaid: true, batchType: 'morning', batchIndex: 2 },
      { name: 'Nisha Agarwal', age: 12, phone: '+91 98765 43221', email: 'nisha.a@email.com', checkins: generateCheckins(15, '2025-01-28'), level: 'beginner', joinedDate: '2025-01-28', feesPaid: false, batchType: 'morning', batchIndex: 2 },
      { name: 'Aarav Mehta', age: 18, phone: '+91 98765 43222', email: 'aarav.m@email.com', checkins: generateCheckins(40, '2023-05-17'), level: 'advanced', joinedDate: '2023-05-17', feesPaid: true, batchType: 'morning', batchIndex: 2 },
      { name: 'Diya Iyer', age: 14, phone: '+91 98765 43223', email: 'diya.i@email.com', checkins: generateCheckins(24, '2024-08-09'), level: 'intermediate', joinedDate: '2024-08-09', feesPaid: true, batchType: 'morning', batchIndex: 2 },
      { name: 'Karan Bhatia', age: 16, phone: '+91 98765 43224', email: 'karan.b@email.com', checkins: generateCheckins(29, '2023-12-03'), level: 'advanced', joinedDate: '2023-12-03', feesPaid: false, batchType: 'morning', batchIndex: 2 },
      
      // Evening Batch 1
      { name: 'Riya Desai', age: 13, phone: '+91 98765 43225', email: 'riya.d@email.com', checkins: generateCheckins(16, '2025-02-20'), level: 'beginner', joinedDate: '2025-02-20', feesPaid: true, batchType: 'evening', batchIndex: 0 },
      { name: 'Aditya Nair', age: 17, phone: '+91 98765 43226', email: 'aditya.n@email.com', checkins: generateCheckins(38, '2023-07-11'), level: 'advanced', joinedDate: '2023-07-11', feesPaid: true, batchType: 'evening', batchIndex: 0 },
      { name: 'Pooja Saxena', age: 15, phone: '+91 98765 43227', email: 'pooja.s@email.com', checkins: generateCheckins(26, '2024-05-06'), level: 'intermediate', joinedDate: '2024-05-06', feesPaid: false, batchType: 'evening', batchIndex: 0 },
      { name: 'Rahul Choudhury', age: 14, phone: '+91 98765 43228', email: 'rahul.c@email.com', checkins: generateCheckins(21, '2024-09-14'), level: 'intermediate', joinedDate: '2024-09-14', feesPaid: true, batchType: 'evening', batchIndex: 0 },
      { name: 'Sneha Pillai', age: 12, phone: '+91 98765 43229', email: 'sneha.p@email.com', checkins: generateCheckins(10, '2025-03-08'), level: 'beginner', joinedDate: '2025-03-08', feesPaid: false, batchType: 'evening', batchIndex: 0 },
      
      // Evening Batch 2
      { name: 'Nikhil Menon', age: 16, phone: '+91 98765 43230', email: 'nikhil.m@email.com', checkins: generateCheckins(33, '2023-10-22'), level: 'advanced', joinedDate: '2023-10-22', feesPaid: true, batchType: 'evening', batchIndex: 1 },
      { name: 'Kavya Shah', age: 13, phone: '+91 98765 43231', email: 'kavya.s@email.com', checkins: generateCheckins(19, '2024-06-15'), level: 'intermediate', joinedDate: '2024-06-15', feesPaid: true, batchType: 'evening', batchIndex: 1 },
      { name: 'Harsh Trivedi', age: 15, phone: '+91 98765 43232', email: 'harsh.t@email.com', checkins: generateCheckins(28, '2024-03-28'), level: 'intermediate', joinedDate: '2024-03-28', feesPaid: false, batchType: 'evening', batchIndex: 1 },
      { name: 'Simran Kaur', age: 11, phone: '+91 98765 43233', email: 'simran.k@email.com', checkins: generateCheckins(8, '2025-01-05'), level: 'beginner', joinedDate: '2025-01-05', feesPaid: true, batchType: 'evening', batchIndex: 1 },
      { name: 'Dev Pandey', age: 18, phone: '+91 98765 43234', email: 'dev.p@email.com', checkins: generateCheckins(45, '2023-06-19'), level: 'advanced', joinedDate: '2023-06-19', feesPaid: true, batchType: 'evening', batchIndex: 1 },
      
      // Evening Batch 3
      { name: 'Zara Khan', age: 14, phone: '+91 98765 43235', email: 'zara.k@email.com', checkins: generateCheckins(23, '2024-04-02'), level: 'intermediate', joinedDate: '2024-04-02', feesPaid: false, batchType: 'evening', batchIndex: 2 },
      { name: 'Yash Oberoi', age: 17, phone: '+91 98765 43236', email: 'yash.o@email.com', checkins: generateCheckins(31, '2023-08-30'), level: 'advanced', joinedDate: '2023-08-30', feesPaid: true, batchType: 'evening', batchIndex: 2 },
      { name: 'Aditi Bhatt', age: 12, phone: '+91 98765 43237', email: 'aditi.b@email.com', checkins: generateCheckins(11, '2025-02-14'), level: 'beginner', joinedDate: '2025-02-14', feesPaid: false, batchType: 'evening', batchIndex: 2 },
      { name: 'Vihaan Khanna', age: 15, phone: '+91 98765 43238', email: 'vihaan.k@email.com', checkins: generateCheckins(26, '2024-07-21'), level: 'intermediate', joinedDate: '2024-07-21', feesPaid: true, batchType: 'evening', batchIndex: 2 },
      { name: 'Anvi Sinha', age: 13, phone: '+91 98765 43239', email: 'anvi.s@email.com', checkins: generateCheckins(17, '2025-03-12'), level: 'beginner', joinedDate: '2025-03-12', feesPaid: false, batchType: 'evening', batchIndex: 2 },
    ];
    
    const riders = await Rider.insertMany(initialRiders);
    
    res.status(201).json({
      success: true,
      message: `Seeded ${riders.length} riders successfully`,
      count: riders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
