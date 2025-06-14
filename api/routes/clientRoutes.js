const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// 获取客户列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 构建查询条件
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 获取总数用于分页
    const total = await prisma.customer.count({ where });

    // 获取客户列表
    const clients = await prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    // 转换数据格式以匹配前端接口
    const transformedClients = clients.map(client => ({
      id: client.id,
      companyName: client.companyName || client.name,
      contactName: client.name,
      phoneNumber: client.phone || 'N/A',
      position: 'Customer',
      status: (client.status || 'ACTIVE').toLowerCase(),
      createdDate: new Date(client.createdAt).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      email: client.email,
      address: client.address,
      settlementMethod: client.settlementMethod,
      financeContact: null,
      positions: [],
      shipmentCount: 0,
      loginCount: 0,
      notes: client.notes,
      attachments: client.attachments,
      updatedAt: client.updatedAt
    }));

    res.json({ 
      success: true, 
      data: transformedClients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取客户列表失败:', error);
    res.status(500).json({ success: false, error: '获取客户列表失败' });
  }
});

// 创建客户
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    
    // 创建客户数据
    const clientData = {
      name: body.contactName,
      phone: body.phoneNumber,
      email: body.email,
      address: body.address,
      tenantId: 'test-tenant-id'
    };

    const client = await prisma.customer.create({
      data: clientData
    });

    res.json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error('创建客户失败:', error);
    res.status(500).json({ success: false, error: '创建客户失败' });
  }
});

// 获取单个客户详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await prisma.customer.findUnique({
      where: { id },
      include: {
        financeContact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        loginLogs: {
          orderBy: {
            loginAt: 'desc'
          },
          take: 5,
          select: {
            id: true,
            ip: true,
            device: true,
            userAgent: true,
            loginAt: true
          }
        },
        fbaOrders: {
          select: {
            status: true,
            createdAt: true,
            totalCost: true
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ success: false, error: '客户不存在' });
    }

    // 计算运单状态统计
    const shipmentStats = client.fbaOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // 计算账户余额（模拟数据）
    const accountBalance = Math.random() * 10000 - 2000;
    const overdueAmount = Math.random() * 5000;

    // 获取最近60天的运单趋势数据
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const shipmentTrend = await prisma.fBAOrder.findMany({
      where: {
        customerId: id,
        createdAt: {
          gte: sixtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 处理趋势数据，按日期分组
    const trendData = [];
    const dateCountMap = new Map();
    
    // 统计每天的运单数量
    shipmentTrend.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
    });
    
    // 生成完整的60天数据
    for (let i = 59; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      trendData.push({
        date: dateStr,
        count: dateCountMap.get(dateStr) || 0
      });
    }

    const validTrendData = trendData.filter(item => {
      const date = new Date(item.date);
      return !isNaN(date.getTime()) && typeof item.count === 'number' && item.count >= 0;
    });

    const responseData = {
      ...client,
      shipmentStats,
      accountBalance: Number(accountBalance.toFixed(2)),
      overdueAmount: Number(overdueAmount.toFixed(2)),
      shipmentTrend: validTrendData,
      lastLogin: client.loginLogs[0] || null
    };

    res.json({ 
      success: true, 
      data: responseData 
    });
  } catch (error) {
    console.error('获取客户详情失败:', error);
    res.status(500).json({ success: false, error: '获取客户详情失败' });
  }
});

// 更新客户
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    const updateData = {};
    
    // 基本信息更新
    if (body.contactName) updateData.name = body.contactName;
    if (body.phoneNumber) updateData.phone = body.phoneNumber;
    if (body.email) updateData.email = body.email;
    if (body.address) updateData.address = body.address;
    if (body.companyName) updateData.companyName = body.companyName;
    if (body.status) updateData.status = body.status;
    if (body.notes) updateData.notes = body.notes;
    
    // 销售代表更新
    if (body.hasOwnProperty('financeContactId')) {
      updateData.financeContactId = body.financeContactId;
    }
    
    const client = await prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        financeContact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error('更新客户失败:', error);
    res.status(500).json({ success: false, error: '更新客户失败' });
  }
});

// 删除客户
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.replace('#', ''); // 移除 # 前缀
    
    await prisma.customer.delete({
      where: { id: cleanId }
    });

    res.json({ 
      success: true 
    });
  } catch (error) {
    console.error('删除客户失败:', error);
    res.status(500).json({ success: false, error: '删除客户失败' });
  }
});

// 获取客户运单列表
router.get('/:id/shipments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 获取运单状态统计
    const statusCounts = await prisma.fBAOrder.groupBy({
      by: ['status'],
      where: { customerId: id },
      _count: {
        id: true
      }
    });

    // 获取运单总数
    const total = await prisma.fBAOrder.count({
      where: { customerId: id }
    });

    // 获取最近运单
    const shipments = await prisma.fBAOrder.findMany({
      where: { customerId: id },
      include: {
        channel: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        statusCounts,
        total,
        shipments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取客户运单失败:', error);
    res.status(500).json({ success: false, error: '获取客户运单失败' });
  }
});

module.exports = router; 