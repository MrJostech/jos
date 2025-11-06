const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getUsers,
  updateUser
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(adminAuth);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Product Management
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Order Management
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;