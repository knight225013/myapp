// api/routes/settings.js - 系统设置主路由
const express = require('express');
const router = express.Router();

// 导入各个设置模块的路由
const companyRoutes = require('./settings/company');
const brandingRoutes = require('./settings/branding');
const userRoutes = require('./settings/users');
const roleRoutes = require('./settings/roles');
const warehouseRoutes = require('./settings/warehouses');
const numberingRoutes = require('./settings/numbering');
const securityRoutes = require('./settings/security');
const customFieldRoutes = require('./settings/customFields');
const auditRoutes = require('./settings/audit');

// 中间件
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// 应用认证中间件到所有设置路由
router.use(authenticate);

// 路由分组
router.use('/company', authorize('settings', 'manage'), companyRoutes);
router.use('/branding', authorize('settings', 'manage'), brandingRoutes);
router.use('/users', authorize('users', 'manage'), userRoutes);
router.use('/roles', authorize('roles', 'manage'), roleRoutes);
router.use('/warehouses', authorize('warehouses', 'manage'), warehouseRoutes);
router.use('/numbering', authorize('settings', 'manage'), numberingRoutes);
router.use('/security', authorize('security', 'manage'), securityRoutes);
router.use('/custom-fields', authorize('settings', 'manage'), customFieldRoutes);
router.use('/audit', authorize('audit', 'read'), auditRoutes);

// 获取系统概览信息
router.get('/overview', authorize('settings', 'read'), async (req, res) => {
  try {
    const overview = {
      company: await req.prisma.companyProfile.findFirst(),
      userCount: await req.prisma.user.count({ where: { status: 'ACTIVE' } }),
      warehouseCount: await req.prisma.warehouse.count({ where: { status: 'ACTIVE' } }),
      customFieldCount: await req.prisma.customField.count(),
      lastAuditLog: await req.prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } }
      })
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