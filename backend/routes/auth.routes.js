const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

// Register route
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('fullName').notEmpty().trim(),
  body('omangNumber').isLength({ min: 9, max: 9 }).isNumeric(),
  body('phone').optional().isMobilePhone()
], authController.register);

// Verify email - Accept both GET and POST
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Get current user (protected)
router.get('/me', authenticate, authController.getMe);

module.exports = router;