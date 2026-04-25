// backend/controllers/auth.controller.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createAuditLog } = require('./admin.controller');
const crypto = require('crypto');
const { sendEmail } = require('../services/email.service');

const prisma = new PrismaClient();

// Helper function to create welcome notification
const createWelcomeNotification = async (userId, fullName) => {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.notification.count();
    const notificationNumber = `NOT${year}${(count + 1).toString().padStart(6, '0')}`;

    await prisma.notification.create({
      data: {
        notificationNumber,
        userId,
        type: 'IN_APP',
        subject: 'Welcome to KaboDitsha! 🎉',
        message: `Hello ${fullName}, welcome to KaboDitsha! Start your land application journey today.`,
        sentAt: new Date()
      }
    });
    console.log(`Welcome notification created for ${fullName}`);
  } catch (error) {
    console.error('Failed to create welcome notification:', error);
  }
};

// Helper function to create verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to get next user number
async function getNextUserNumber() {
  try {
    const lastUser = await prisma.user.findFirst({
      orderBy: { userNumber: 'desc' }
    });
    
    if (!lastUser || !lastUser.userNumber) {
      return 'US000001';
    }
    
    const match = lastUser.userNumber.match(/US(\d+)/);
    if (!match) {
      return 'US000001';
    }
    
    const lastNumber = parseInt(match[1], 10);
    
    if (isNaN(lastNumber)) {
      return 'US000001';
    }
    
    const nextNumber = lastNumber + 1;
    return `US${nextNumber.toString().padStart(6, '0')}`;
  } catch (error) {
    console.error('Error getting next user number:', error);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `US${timestamp}${random}`;
  }
}

// Register new user - DISABLED EMAIL VERIFICATION
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, omangNumber, phone, maritalStatus, spouseName } = req.body;

    // Validate omang number format (9 digits)
    const omangStr = omangNumber.toString();
    if (omangStr.length !== 9) {
      return res.status(400).json({ error: 'Omang number must be exactly 9 digits' });
    }
    
    // Convert to integer for Prisma
    const omangInt = parseInt(omangStr, 10);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { omangNumber: omangInt }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or Omang' });
    }

    // Generate unique user number
    let userNumber;
    let retries = 3;
    let userCreated = false;
    
    while (retries > 0 && !userCreated) {
      userNumber = await getNextUserNumber();
      
      const existingUserNumber = await prisma.user.findUnique({
        where: { userNumber }
      });
      
      if (!existingUserNumber) {
        userCreated = true;
      }
      retries--;
    }
    
    if (!userCreated) {
      userNumber = `US${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - Using correct schema field names: tokenExpiry (not verificationExpires)
    const user = await prisma.user.create({
      data: {
        userNumber,
        email,
        password: hashedPassword,
        fullName,
        omangNumber: omangInt,
        phone,
        role: 'APPLICANT',
        emailVerified: true,  // Auto-verified
        verificationToken: null,  // No verification token needed
        tokenExpiry: null,  // Using tokenExpiry as in schema
        maritalStatus: maritalStatus || null,
        spouseName: spouseName || null
      }
    });

    console.log('User created successfully (email verification disabled):', email);

    // Create welcome notification
    await createWelcomeNotification(user.userId, user.fullName);

    // ✅ CREATE AUDIT LOG FOR REGISTRATION
    await createAuditLog(user.userId, `User registered: ${email} (APPLICANT)`, req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress);

    // Generate JWT token for auto-login
    const authToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully! You are now logged in.',
      user: userWithoutPassword,
      token: authToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ 
        error: `A user with this ${target} already exists` 
      });
    }
    
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Verify email - Simplified
const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified - KaboDitsha</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #F5E6D3 0%, #fff 100%); }
            .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .success { color: #22C55E; font-size: 64px; margin-bottom: 20px; }
            h1 { color: #2C1810; }
            .btn { background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Email Verification Not Required</h1>
            <p>Your account is already verified. You can log in directly.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Proceed to Login</a>
          </div>
        </body>
        </html>
      `);
    }

    // Try to find user with token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: { gt: new Date() }
      }
    });

    if (user) {
      await prisma.user.update({
        where: { userId: user.userId },
        data: {
          emailVerified: true,
          verificationToken: null,
          tokenExpiry: null
        }
      });
      await createWelcomeNotification(user.userId, user.fullName);
      
      // ✅ CREATE AUDIT LOG FOR EMAIL VERIFICATION
      await createAuditLog(user.userId, `Email verified: ${user.email}`, req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress);
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified - KaboDitsha</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #F5E6D3 0%, #fff 100%); }
          .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .success { color: #22C55E; font-size: 64px; margin-bottom: 20px; }
          h1 { color: #2C1810; }
          .btn { background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>Email Verified Successfully!</h1>
          <p>You can now log in to your KaboDitsha account.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Proceed to Login</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error - KaboDitsha</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #F5E6D3 0%, #fff 100%); }
          .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .error { color: #DC2626; font-size: 64px; margin-bottom: 20px; }
          h1 { color: #2C1810; }
          .btn { background: #DC2626; color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">⚠️</div>
          <h1>Verification Error</h1>
          <p>Something went wrong. Please try logging in directly.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Go to Login</a>
        </div>
      </body>
      </html>
    `);
  }
};

// Resend verification - Simplified
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Just mark as verified if not already
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { userId: user.userId },
        data: {
          emailVerified: true,
          verificationToken: null,
          tokenExpiry: null
        }
      });
      
      // ✅ CREATE AUDIT LOG FOR RESEND VERIFICATION
      await createAuditLog(user.userId, `Verification resent: ${user.email}`, req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress);
    }

    res.json({ message: 'Your account has been verified. You can now log in.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const authToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // ✅ CREATE AUDIT LOG FOR LOGIN
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await createAuditLog(user.userId, `User logged in: ${user.email}`, clientIp);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token: authToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Logout user (optional - creates audit log)
const logout = async (req, res) => {
  try {
    if (req.user && req.user.userId) {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      await createAuditLog(req.user.userId, `User logged out: ${req.user.email}`, clientIp);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: {
        userId: true,
        userNumber: true,
        email: true,
        fullName: true,
        omangNumber: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Request password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.json({ message: 'If your email is registered, you will receive a reset link' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    await sendEmail(user.email, 'passwordReset', {
      user: { fullName: user.fullName },
      resetToken: resetToken,
      resetUrl: resetUrl
    });
    
    // ✅ CREATE AUDIT LOG FOR PASSWORD RESET REQUEST
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await createAuditLog(user.userId, `Password reset requested for: ${user.email}`, clientIp);
    
    res.json({ message: 'If your email is registered, you will receive a reset link' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    // ✅ CREATE AUDIT LOG FOR PASSWORD RESET
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await createAuditLog(user.userId, `Password reset completed for: ${user.email}`, clientIp);
    
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};