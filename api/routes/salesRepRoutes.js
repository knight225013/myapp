const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// 获取销售代表列表
router.get('/', async (req, res) => {
  try {
    const salesReps = await prisma.user.findMany({
      where: {
        role: {
          in: ['TENANT_ADMIN', 'TENANT_STAFF']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: salesReps
    });
  } catch (error) {
    console.error('获取销售代表失败:', error);
    res.status(500).json({ success: false, error: '获取销售代表失败' });
  }
});

module.exports = router; 