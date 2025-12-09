require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const ridersRouter = require('./routes/riders');
const batchesRouter = require('./routes/batches');

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

// Routes
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Equine Enclave API',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      health: 'GET /api/health',
      riders: {
        getAll: 'GET /api/riders',
        getBatches: 'GET /api/riders/batches',
        getOne: 'GET /api/riders/:id',
        create: 'POST /api/riders',
        update: 'PUT /api/riders/:id',
        checkin: 'PATCH /api/riders/:id/checkin',
        pay: 'PATCH /api/riders/:id/pay',
        move: 'PATCH /api/riders/:id/move',
        delete: 'DELETE /api/riders/:id',
        seed: 'POST /api/riders/seed (populate initial data)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
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
