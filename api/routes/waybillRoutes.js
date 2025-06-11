// src/routes/waybillRoutes.js
const express = require('express');
const router = express.Router();
const waybillController = require('../controllers/waybillController');
const multer = require('multer');
const path = require('path');

// 配置 Multer 存储
const storage = multer.diskStorage({
  destination: './uploads/attachments',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 运单路由
router.get('/stats', waybillController.getStats);
router.get('/', waybillController.getWaybills);
router.post('/', waybillController.createWaybill);
router.get('/:id', waybillController.getWaybillById);
router.get('/:id/summary', waybillController.getSummary);
router.put('/:id', waybillController.updateShipment);
router.put('/boxes/:id', waybillController.updateBox);
router.get('/fba/:id/logs', waybillController.getLogs);
router.post('/fba/:id/logs', waybillController.addLog);
router.get('/:id/logs', waybillController.getLogs);
router.post('/:id/logs', waybillController.addLog);
router.post('/:id/attachments', upload.single('file'), waybillController.uploadAttachment);

module.exports = router;
