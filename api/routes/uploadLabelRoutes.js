const multer = require('multer');
const path = require('path');
const express = require('express');
const controller = require('../controllers/uploadLabelController');

const router = express.Router();

// ✅ 使用带扩展名的保存策略
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/attachments/');
  },
  filename: function (req, file, cb) {
    // 使用时间戳 + 原文件名 + .pdf
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
    const finalName =
      path.extname(uniqueName).toLowerCase() === '.pdf' ? uniqueName : `${uniqueName}.pdf`;
    cb(null, finalName);
  },
});

const upload = multer({ storage });

router.post('/upload-label', upload.single('file'), controller.uploadAndParseLabel);

module.exports = router;
