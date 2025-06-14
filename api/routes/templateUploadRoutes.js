const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();

// 配置 multer 用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // 验证文件类型
    if (file.mimetype.includes('spreadsheet') || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 Excel 文件（.xlsx 或 .xls）'), false);
    }
  }
});

// 处理文件上传
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const templateName = req.body.templateName;

    // 验证输入
    if (!file || !templateName) {
      return res.status(400).json({ success: false, error: '缺少文件或模板名称' });
    }

    // 清理模板名称
    const sanitizedTemplateName = templateName.replace(/[<>:"/\\|?*]/g, '');
    if (!sanitizedTemplateName) {
      return res.status(400).json({
        success: false,
        error: '模板名称需包含中文、字母、数字、下划线或连字符'
      });
    }

    // 定义保存路径
    const uploadDir = path.join(process.cwd(), 'public', 'template');
    const encodedFileName = encodeURIComponent(sanitizedTemplateName) + '.xlsx';
    const filePath = path.join(uploadDir, encodedFileName);

    // 确保目录存在
    await fs.mkdir(uploadDir, { recursive: true });

    // 保存文件
    await fs.writeFile(filePath, file.buffer);

    res.json({
      success: true,
      filePath: `/template/${encodedFileName}`,
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    res.status(500).json({ success: false, error: '上传失败' });
  }
});

// 处理文件下载
router.get('/', async (req, res) => {
  try {
    const templateName = req.query.name;

    // 验证输入
    if (!templateName) {
      return res.status(400).json({ success: false, error: '缺少模板名称' });
    }

    // 清理模板名称
    const sanitizedTemplateName = templateName.replace(/[<>:"/\\|?*]/g, '');
    if (!sanitizedTemplateName) {
      return res.status(400).json({
        success: false,
        error: '模板名称需包含中文、字母、数字、下划线或连字符'
      });
    }

    // 定义文件路径
    const filePath = path.join(
      process.cwd(),
      'public',
      'template',
      `${encodeURIComponent(sanitizedTemplateName)}.xlsx`
    );

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: `模板文件不存在: ${sanitizedTemplateName}.xlsx`
      });
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filePath);

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(sanitizedTemplateName)}.xlsx"`);
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('下载模板文件失败:', error);
    res.status(500).json({
      success: false,
      error: `下载失败: ${error.message}`
    });
  }
});

module.exports = router; 