// backend/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: {
        userId: true,
        email: true,
        fullName: true,
        omangNumber: true,
        role: true,
        phone: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Debug logging
    console.log('Authorize check - Raw values:', {
      userRole: req.user.role,
      allowedRolesRaw: allowedRoles,
      allowedRolesType: allowedRoles.map(r => typeof r)
    });
    
    // Safely convert to strings and uppercase
    const userRole = String(req.user.role || '').trim().toUpperCase();
    
    // Ensure allowedRoles are all strings
    const allowed = allowedRoles
      .filter(role => role != null) // Remove null/undefined
      .map(role => String(role).trim().toUpperCase());
    
    console.log('Authorize check - Processed:', {
      userRole,
      allowed,
      hasAccess: allowed.includes(userRole)
    });
    
    const hasAccess = allowed.includes(userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
      });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };