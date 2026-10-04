const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  confirmUpiPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/confirm-upi', confirmUpiPayment);

module.exports = router;
