const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const itemsRoutes = require('./items');
const chatRoutes = require('./chat');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Lost & Found Campus Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/items', itemsRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
