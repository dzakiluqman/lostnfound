const express = require('express');
const router = express.Router();
const itemRoutes = require('./itemRoutes');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Lost & Found Campus Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Resource Routes
router.use('/items', itemRoutes);

module.exports = router;
