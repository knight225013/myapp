// api/routes/settings.js - 系统设置主路由
const express = require('express');
const router = express.Router();

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    firstName: '系统',
    lastName: '管理员',
    phone: '+86-138-0000-0001',
    avatar: null,
    status: 'ACTIVE',
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    roles: [
      {
        role: {
          id: '1',
          name: '超级管理员'
        }
      }
    ]
  }
];

// 模拟角色数据
const mockRoles = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有系统所有权限的超级管理员',
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: [
      {
        permission: {
          id: '1',
          module: '*',
          action: '*',
          resource: '*',
          description: '所有权限'
        }
      }
    ]
  }
];

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let filteredUsers = mockUsers;
    
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.username.includes(search) || 
        user.email.includes(search) ||
        user.firstName.includes(search) ||
        user.lastName.includes(search)
      );
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    const total = filteredUsers.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// 获取角色列表
router.get('/roles', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockRoles
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({ success: false, error: '获取角色列表失败' });
  }
});

// 获取系统概览信息
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      userCount: mockUsers.length,
      activeUserCount: mockUsers.filter(u => u.status === 'ACTIVE').length,
      roleCount: mockRoles.length,
      systemVersion: '1.0.0',
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('获取系统概览失败:', error);
    res.status(500).json({
      success: false,
      error: '获取系统概览失败'
    });
  }
});

module.exports = router; 