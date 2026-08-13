const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middlewares/validateOrder');

router.post('/', validateOrder, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/stream', orderController.streamOrderStatus);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
