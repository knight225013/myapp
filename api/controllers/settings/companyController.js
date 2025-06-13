// api/controllers/settings/companyController.js - 公司资料管理控制器
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadFile, deleteFile } = require('../../utils/fileUpload');
const { createAuditLog } = require('../../utils/audit');

class CompanyController {
  // 获取公司资料
  async getCompanyProfile(req, res) {
    try {
      const profile = await prisma.companyProfile.findFirst();
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('获取公司资料失败:', error);
      res.status(500).json({
        success: false,
        error: '获取公司资料失败'
      });
    }
  }

  // 更新公司资料
  async updateCompanyProfile(req, res) {
    try {
      const {
        companyName,
        address,
        phone,
        email,
        website,
        taxNumber,
        description
      } = req.body;

      // 验证必填字段
      if (!companyName) {
        return res.status(400).json({
          success: false,
          error: '公司名称不能为空'
        });
      }

      // 查找现有资料
      let profile = await prisma.companyProfile.findFirst();
      
      let logoUrl = profile?.logo;
      
      // 处理logo上传
      if (req.file) {
        // 删除旧logo
        if (profile?.logo) {
          await deleteFile(profile.logo);
        }
        
        // 上传新logo
        logoUrl = await uploadFile(req.file, 'company/logos');
      }

      const profileData = {
        companyName,
        logo: logoUrl,
        address,
        phone,
        email,
        website,
        taxNumber,
        description
      };

      if (profile) {
        // 更新现有资料
        profile = await prisma.companyProfile.update({
          where: { id: profile.id },
          data: profileData
        });
      } else {
        // 创建新资料
        profile = await prisma.companyProfile.create({
          data: profileData
        });
      }

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: profile ? 'UPDATE' : 'CREATE',
        entityType: 'CompanyProfile',
        entityId: profile.id,
        newValues: JSON.stringify(profileData),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: profile,
        message: '公司资料更新成功'
      });
    } catch (error) {
      console.error('更新公司资料失败:', error);
      res.status(500).json({
        success: false,
        error: '更新公司资料失败'
      });
    }
  }

  // 上传公司logo
  async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '请选择要上传的文件'
        });
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: '只支持 JPEG、PNG、GIF、WebP 格式的图片'
        });
      }

      // 验证文件大小 (5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: '文件大小不能超过 5MB'
        });
      }

      // 上传文件
      const logoUrl = await uploadFile(req.file, 'company/logos');

      // 更新数据库
      let profile = await prisma.companyProfile.findFirst();
      
      if (profile) {
        // 删除旧logo
        if (profile.logo) {
          await deleteFile(profile.logo);
        }
        
        profile = await prisma.companyProfile.update({
          where: { id: profile.id },
          data: { logo: logoUrl }
        });
      } else {
        profile = await prisma.companyProfile.create({
          data: { 
            companyName: '未设置',
            logo: logoUrl 
          }
        });
      }

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'CompanyProfile',
        entityId: profile.id,
        description: '上传公司logo',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: { logoUrl },
        message: 'Logo上传成功'
      });
    } catch (error) {
      console.error('上传logo失败:', error);
      res.status(500).json({
        success: false,
        error: '上传logo失败'
      });
    }
  }

  // 删除公司logo
  async deleteLogo(req, res) {
    try {
      const profile = await prisma.companyProfile.findFirst();
      
      if (!profile || !profile.logo) {
        return res.status(404).json({
          success: false,
          error: '未找到logo文件'
        });
      }

      // 删除文件
      await deleteFile(profile.logo);

      // 更新数据库
      await prisma.companyProfile.update({
        where: { id: profile.id },
        data: { logo: null }
      });

      // 记录审计日志
      await createAuditLog({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'CompanyProfile',
        entityId: profile.id,
        description: '删除公司logo',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Logo删除成功'
      });
    } catch (error) {
      console.error('删除logo失败:', error);
      res.status(500).json({
        success: false,
        error: '删除logo失败'
      });
    }
  }
}

module.exports = new CompanyController(); 