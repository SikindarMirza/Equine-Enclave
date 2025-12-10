require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const ridersRouter = require('./routes/riders');
const batchesRouter = require('./routes/batches');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/riders', ridersRouter);
app.use('/api/batches', batchesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║       🐴 Equine Enclave API Server 🐴          ║
╠════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}      ║
║  Database: MongoDB                             ║
║                                                ║
║  Available endpoints:                          ║
║  • GET    /api/riders           - All riders   ║
║  • GET    /api/riders/batches   - All batches  ║
║  • GET    /api/riders/:id       - Single rider ║
║  • POST   /api/riders           - Create rider ║
║  • PUT    /api/riders/:id       - Update rider ║
║  • PATCH  /api/riders/:id/checkin - Check-in   ║
║  • PATCH  /api/riders/:id/pay   - Pay fees     ║
║  • PATCH  /api/riders/:id/move  - Move batch   ║
║  • DELETE /api/riders/:id       - Delete rider ║
║  • POST   /api/riders/seed      - Seed data    ║
╚════════════════════════════════════════════════╝
  `);
});
