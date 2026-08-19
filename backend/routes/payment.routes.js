const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);
router.post('/confirm-payment', authenticate, paymentController.confirmPayment);

module.exports = router;