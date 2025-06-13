// api/controllers/settings/userController.js - 用户管理控制器
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const { createAuditLog } = require('../../utils/audit');
const { generatePassword, validatePassword } = require('../../utils/password');
const { sendEmail } = require('../../utils/email');

class UserController {
  // 获取用户列表
  async getUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        roleId
      } = req.query;

      const skip = (page - 1) * limit;
      const where = {};

      // 搜索条件
      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (roleId) {
        where.roles = {
          some: { roleId }
        };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            roles: {
              include: {
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      // 移除敏感信息
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      res.json({
        success: true,
        data: safeUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户列表失败'
      });
    }
  }

  // 创建用户
  async createUser(req, res) {
    try {
      const {
        username,
        email,
        firstName,
        lastName,
        phone,
        roleIds = [],
        sendWelcomeEmail = true
      } = req.body;

      // 验证必填字段
      if (!username || !email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: '用户名、邮箱、姓名为必填字段'
        });
      }

      // 检查用户名和邮箱是否已存在
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '用户名或邮箱已存在'
        });
      }

      // 生成临时密码
      const tempPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          status: 'ACTIVE'
        }
      });

      // 分配角色
      if (roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map(roleId => ({
            userId: user.id,
            roleId
          }))
        });
      }

      // 发送欢迎邮件
      if (sendWelcomeEmail) {
        await sendEmail({
          to: email,
          subject: '欢迎加入系统',
          template: 'welcome',
          data: {
            firstName,
            username,
            tempPassword,
            loginUrl: process.env.FRONTEND_URL + '/login'
          }
        });
      }

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        newValues: JSON.stringify({ username, email, firstName, lastName }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // 获取完整用户信息
      const newUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      const { password, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        data: safeUser,
        message: '用户创建成功'
      });
    } catch (error) {
      console.error('创建用户失败:', error);
      res.status(500).json({
        success: false,
        error: '创建用户失败'
      });
    }
  }

  // 更新用户
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        firstName,
        lastName,
        phone,
        status,
        roleIds
      } = req.body;

      // 检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 检查用户名和邮箱是否被其他用户使用
      if (username || email) {
        const duplicateUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  username ? { username } : {},
                  email ? { email } : {}
                ].filter(condition => Object.keys(condition).length > 0)
              }
            ]
          }
        });

        if (duplicateUser) {
          return res.status(400).json({
            success: false,
            error: '用户名或邮箱已被其他用户使用'
          });
        }
      }

      // 更新用户基本信息
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (status) updateData.status = status;

      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });

      // 更新角色
      if (roleIds !== undefined) {
        // 删除现有角色
        await prisma.userRole.deleteMany({
          where: { userId: id }
        });

        // 添加新角色
        if (roleIds.length > 0) {
          await prisma.userRole.createMany({
            data: roleIds.map(roleId => ({
              userId: id,
              roleId
            }))
          });
        }
      }

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        oldValues: JSON.stringify(existingUser),
        newValues: JSON.stringify(updateData),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // 获取更新后的用户信息
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      const { password, ...safeUser } = updatedUser;

      res.json({
        success: true,
        data: safeUser,
        message: '用户更新成功'
      });
    } catch (error) {
      console.error('更新用户失败:', error);
      res.status(500).json({
        success: false,
        error: '更新用户失败'
      });
    }
  }

  // 重置用户密码
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { sendEmail: shouldSendEmail = true } = req.body;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 生成新密码
      const newPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // 更新密码
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword }
      });

      // 发送密码重置邮件
      if (shouldSendEmail) {
        await sendEmail({
          to: user.email,
          subject: '密码重置通知',
          template: 'password-reset',
          data: {
            firstName: user.firstName,
            newPassword,
            loginUrl: process.env.FRONTEND_URL + '/login'
          }
        });
      }

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        description: '重置用户密码',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '密码重置成功',
        data: shouldSendEmail ? null : { newPassword }
      });
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(500).json({
        success: false,
        error: '重置密码失败'
      });
    }
  }

  // 禁用用户
  async disableUser(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      await prisma.user.update({
        where: { id },
        data: { status: 'DISABLED' }
      });

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        description: '禁用用户',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '用户已禁用'
      });
    } catch (error) {
      console.error('禁用用户失败:', error);
      res.status(500).json({
        success: false,
        error: '禁用用户失败'
      });
    }
  }

  // 删除用户
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 软删除：更新状态为DELETED
      await prisma.user.update({
        where: { id },
        data: { status: 'DELETED' }
      });

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        description: '删除用户',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '用户已删除'
      });
    } catch (error) {
      console.error('删除用户失败:', error);
      res.status(500).json({
        success: false,
        error: '删除用户失败'
      });
    }
  }

  // 批量操作
  async batchOperation(req, res) {
    try {
      const { operation, userIds } = req.body;

      if (!operation || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          error: '操作类型和用户ID列表为必填字段'
        });
      }

      let updateData = {};
      let description = '';

      switch (operation) {
        case 'disable':
          updateData = { status: 'DISABLED' };
          description = '批量禁用用户';
          break;
        case 'enable':
          updateData = { status: 'ACTIVE' };
          description = '批量启用用户';
          break;
        case 'delete':
          updateData = { status: 'DELETED' };
          description = '批量删除用户';
          break;
        default:
          return res.status(400).json({
            success: false,
            error: '不支持的操作类型'
          });
      }

      // 执行批量更新
      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds }
        },
        data: updateData
      });

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'User',
        description: `${description}: ${userIds.join(', ')}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `成功${description}${result.count}个用户`,
        data: { affectedCount: result.count }
      });
    } catch (error) {
      console.error('批量操作失败:', error);
      res.status(500).json({
        success: false,
        error: '批量操作失败'
      });
    }
  }
}

module.exports = new UserController(); 