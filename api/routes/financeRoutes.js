const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// 运价主表
router.get('/prices', financeController.listPrices);
router.post('/prices', financeController.createPrice);
router.get('/prices/:priceId', financeController.getPrice);

// 运价设置（时段）
router.get('/prices/:priceId/settings', financeController.listSettings);
router.post('/prices/:priceId/settings', financeController.createSetting);

// 批量导入
router.post('/prices/:priceId/settings/import', financeController.importPrices);

module.exports = router;
