const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all land boards
router.get('/', async (req, res) => {
  try {
    const landBoards = await prisma.landBoard.findMany({
      include: {
        subBoards: true,
        waitingListStats: true
      }
    });
    res.json(landBoards);
  } catch (error) {
    console.error('Error fetching land boards:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single land board by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const landBoard = await prisma.landBoard.findUnique({
      where: { landBoardId: id },
      include: {
        subBoards: true,
        waitingListStats: true
      }
    });
    if (!landBoard) {
      return res.status(404).json({ error: 'Land board not found' });
    }
    res.json(landBoard);
  } catch (error) {
    console.error('Error fetching land board:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for a specific land board
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await prisma.waitingListStat.findMany({
      where: { landBoardId: id },
      include: {
        landBoard: true
      }
    });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
