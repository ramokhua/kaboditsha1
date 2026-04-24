// backend/controllers/user.controller.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get current user profile
const getProfile = async (req, res) => {
  try {
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
        maritalStatus: true,
        spouseName: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { email, phone, maritalStatus, spouseName } = req.body;
    const userId = req.user.userId;
    
    // Validate phone if provided
    if (phone && !/^7\d{7}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 8 digits starting with 7' });
    }
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          userId: { not: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        ...(email && { email }),
        ...(phone && { phone }),
        ...(maritalStatus && { maritalStatus }),
        ...(spouseName !== undefined && { spouseName })
      },
      select: {
        userId: true,
        userNumber: true,
        email: true,
        fullName: true,
        omangNumber: true,
        phone: true,
        role: true,
        maritalStatus: true,
        spouseName: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};