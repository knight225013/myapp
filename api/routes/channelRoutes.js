const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const channelController = require('../controllers/channelController');

router.get('/', channelController.getChannels); // 获取渠道列表
router.post('/', channelController.createChannel); // 创建渠道
router.put('/:id', channelController.updateChannel); // 更新渠道
router.delete('/:id', channelController.deleteChannel); // 删除渠道
router.post('/estimate', channelController.estimateCost); // 估算费用
router.get('/export', channelController.exportChannels); // 导出渠道
router.post('/import', upload.single('file'), channelController.importChannels); // 导入渠道
router.get('/waybill-rules', channelController.getWaybillRules); // 获取运单规则

module.exports = router;
