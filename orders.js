const express = require('express');
const { createOrder, initializePayment, verifyPayment, getUserOrders } = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getUserOrders);
router.post('/', createOrder);
router.post('/initialize-payment', initializePayment);
router.get('/verify-payment/:reference', verifyPayment);

module.exports = router;