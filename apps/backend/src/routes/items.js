const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items');
const { requireAuth } = require('../middlewares/auth');

// Public read routes
router.get('/', itemsController.getItems);
router.get('/:id', itemsController.getItemById);

// Protected routes (Auth required)
router.post('/', requireAuth, itemsController.createItem);
router.patch('/:id/status', requireAuth, itemsController.updateItemStatus);
router.delete('/:id', requireAuth, itemsController.deleteItem);

module.exports = router;
