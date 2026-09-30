const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const { requireAuth } = require('../middlewares/auth');

// All chat routes are protected
router.use(requireAuth);

router.post('/room', chatController.findOrCreateRoom);
router.get('/rooms', chatController.getUserRooms);
router.get('/rooms/:roomId/messages', chatController.getRoomMessages);
router.post('/rooms/:roomId/messages', chatController.sendMessage);

module.exports = router;
