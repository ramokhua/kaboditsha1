const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// ========== STATISTICS ==========

// Get system statistics
const getStats = async (req, res) => {
  try {
    const [totalUsers, activeStaff, totalApplications, landBoards] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['STAFF', 'MANAGER'] } } }),
      prisma.application.count(),
      prisma.landBoard.count()
    ]);

    // Calculate system uptime (mock for now)
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    res.json({
      totalUsers,
      activeStaff,
      totalApplications,
      landBoards,
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      pendingApplications: await prisma.application.count({ where: { status: 'SUBMITTED' } }),
      approvedApplications: await prisma.application.count({ where: { status: 'APPROVED' } }),
      rejectedApplications: await prisma.application.count({ where: { status: 'REJECTED' } })
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// ========== USER MANAGEMENT ==========

// Get all users
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { userNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        userId: true,
        userNumber: true,
        email: true,
        fullName: true,
        omangNumber: true,
        phone: true,
        role: true,
        emailVerified: true,
        landBoardId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { userId: id },
      select: {
        userId: true,
        userNumber: true,
        email: true,
        fullName: true,
        omangNumber: true,
        phone: true,
        role: true,
        emailVerified: true,
        landBoardId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get available land boards for dropdown
    const landBoards = await prisma.landBoard.findMany({
      select: { landBoardId: true, name: true, region: true }
    });

    res.json({ user, landBoards });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { email, password, fullName, omangNumber, phone, role, landBoardId } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { omangNumber: parseInt(omangNumber) }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or Omang' });
    }

    // Generate user number
    const lastUser = await prisma.user.findFirst({
      orderBy: { userNumber: 'desc' }
    });

    let userNumber = 'US000001';
    if (lastUser && lastUser.userNumber) {
      const lastNumber = parseInt(lastUser.userNumber.replace('US', ''));
      userNumber = `US${(lastNumber + 1).toString().padStart(6, '0')}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        userNumber,
        email,
        password: hashedPassword,
        fullName,
        omangNumber: parseInt(omangNumber),
        phone,
        role,
        landBoardId: role !== 'APPLICANT' ? landBoardId : null,
        emailVerified: true
      },
      select: {
        userId: true,
        userNumber: true,
        email: true,
        fullName: true,
        omangNumber: true,
        phone: true,
        role: true,
        landBoardId: true,
        createdAt: true
      }
    });

    // CREATE AUDIT LOG FOR USER CREATION
    const adminEmail = req.user?.email || 'System';
    await createAuditLog(req.user.userId, `Created user: ${email} (${role})`, req.ip);

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, phone, role, landBoardId, password } = req.body;

    // Get old user data for audit
    const oldUser = await prisma.user.findUnique({ where: { userId: id } });

    const updateData = {
      email,
      fullName,
      phone,
      role,
      landBoardId: role !== 'APPLICANT' ? landBoardId : null,
      updatedAt: new Date()
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { userId: id },
      data: updateData,
      select: {
        userId: true,
        userNumber: true,
        email: true,
        fullName: true,
        omangNumber: true,
        phone: true,
        role: true,
        landBoardId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // CREATE AUDIT LOG FOR USER UPDATE
    await createAuditLog(req.user.userId, `Updated user: ${email} (Role: ${oldUser?.role} → ${role})`, req.ip);

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { userId: id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // CREATE AUDIT LOG BEFORE DELETE
    await createAuditLog(req.user.userId, `Deleted user: ${user.email} (${user.role})`, req.ip);

    await prisma.user.delete({ where: { userId: id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ========== LAND BOARD MANAGEMENT ==========

// Get all land boards
const getLandBoards = async (req, res) => {
  try {
    const boards = await prisma.landBoard.findMany({
      include: {
        subBoards: true,
        _count: {
          select: { applications: true, staff: true }
        }
      }
    });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching land boards:', error);
    res.status(500).json({ error: 'Failed to fetch land boards' });
  }
};

// Create land board
const createLandBoard = async (req, res) => {
  try {
    const { name, region, jurisdiction, officeAddress, contactInfo, type, parentBoardId } = req.body;

    // Generate board number
    const lastBoard = await prisma.landBoard.findFirst({
      where: { type },
      orderBy: { boardNumber: 'desc' }
    });

    let boardNumber;
    if (type === 'MAIN') {
      const lastNum = lastBoard ? parseInt(lastBoard.boardNumber.replace('MLB', '')) : 0;
      boardNumber = `MLB${(lastNum + 1).toString().padStart(3, '0')}`;
    } else {
      const lastNum = lastBoard ? parseInt(lastBoard.boardNumber.replace('SLB', '')) : 0;
      boardNumber = `SLB${(lastNum + 1).toString().padStart(3, '0')}`;
    }

    const board = await prisma.landBoard.create({
      data: {
        boardNumber,
        name,
        region,
        jurisdiction,
        officeAddress,
        contactInfo,
        type,
        parentBoardId
      }
    });

    // CREATE AUDIT LOG FOR LAND BOARD CREATION
    await createAuditLog(req.user.userId, `Created land board: ${name} (${boardNumber})`, req.ip);

    res.status(201).json({ message: 'Land board created successfully', board });
  } catch (error) {
    console.error('Error creating land board:', error);
    res.status(500).json({ error: 'Failed to create land board' });
  }
};

// Update land board
const updateLandBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region, jurisdiction, officeAddress, contactInfo } = req.body;

    const oldBoard = await prisma.landBoard.findUnique({ where: { landBoardId: id } });

    const board = await prisma.landBoard.update({
      where: { landBoardId: id },
      data: { name, region, jurisdiction, officeAddress, contactInfo, updatedAt: new Date() }
    });

    // CREATE AUDIT LOG FOR LAND BOARD UPDATE
    await createAuditLog(req.user.userId, `Updated land board: ${name} (${oldBoard?.boardNumber})`, req.ip);

    res.json({ message: 'Land board updated successfully', board });
  } catch (error) {
    console.error('Error updating land board:', error);
    res.status(500).json({ error: 'Failed to update land board' });
  }
};

// Delete land board
const deleteLandBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.landBoard.findUnique({ where: { landBoardId: id } });

    // Check if board has applications
    const applications = await prisma.application.count({ where: { landBoardId: id } });
    if (applications > 0) {
      return res.status(400).json({ error: 'Cannot delete board with existing applications' });
    }

    // 👇 CREATE AUDIT LOG BEFORE DELETE
    await createAuditLog(req.user.userId, `Deleted land board: ${board?.name} (${board?.boardNumber})`, req.ip);

    await prisma.landBoard.delete({ where: { landBoardId: id } });
    res.json({ message: 'Land board deleted successfully' });
  } catch (error) {
    console.error('Error deleting land board:', error);
    res.status(500).json({ error: 'Failed to delete land board' });
  }
};

// ========== AUDIT LOGS ==========

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    const { user, action, limit = 100 } = req.query;

    const where = {};
    if (user) where.userId = user;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { fullName: true, email: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit)
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// Create audit log entry (utility function)
const createAuditLog = async (userId, action, ipAddress = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getLandBoards,
  createLandBoard,
  updateLandBoard,
  deleteLandBoard,
  getAuditLogs,
  createAuditLog
};