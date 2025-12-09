const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');

// GET all batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ batchType: 1, batchIndex: 1 });
    
    // Organize by type
    const morning = batches.filter(b => b.batchType === 'morning');
    const evening = batches.filter(b => b.batchType === 'evening');
    
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

// PUT update batch timing
router.put('/:id', async (req, res) => {
  try {
    const { name, time } = req.body;
    
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    if (name !== undefined) batch.name = name;
    if (time !== undefined) batch.time = time;
    
    const updatedBatch = await batch.save();
    
    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update batch by type and index
router.put('/by-type/:batchType/:batchIndex', async (req, res) => {
  try {
    const { batchType, batchIndex } = req.params;
    const { name, time } = req.body;
    
    const batch = await Batch.findOne({ 
      batchType, 
      batchIndex: parseInt(batchIndex) 
    });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    if (name !== undefined) batch.name = name;
    if (time !== undefined) batch.time = time;
    
    const updatedBatch = await batch.save();
    
    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST seed default batches
router.post('/seed', async (req, res) => {
  try {
    // Clear existing batches
    await Batch.deleteMany({});
    
    const defaultBatches = [
      // Morning batches
      { name: 'Batch 1', time: '6:00 AM - 7:30 AM', batchType: 'morning', batchIndex: 0 },
      { name: 'Batch 2', time: '7:30 AM - 9:00 AM', batchType: 'morning', batchIndex: 1 },
      { name: 'Batch 3', time: '9:00 AM - 10:30 AM', batchType: 'morning', batchIndex: 2 },
      // Evening batches
      { name: 'Batch 1', time: '4:00 PM - 5:30 PM', batchType: 'evening', batchIndex: 0 },
      { name: 'Batch 2', time: '5:30 PM - 7:00 PM', batchType: 'evening', batchIndex: 1 },
      { name: 'Batch 3', time: '7:00 PM - 8:30 PM', batchType: 'evening', batchIndex: 2 },
    ];
    
    const batches = await Batch.insertMany(defaultBatches);
    
    res.status(201).json({
      success: true,
      message: `Seeded ${batches.length} batches successfully`,
      data: batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

