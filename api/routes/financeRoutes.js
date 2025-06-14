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

// 财务账单
router.get('/bills', financeController.listBills);
router.get('/bills/:billId', financeController.getBill);

// 仪表板统计
router.get('/reports/dashboard', financeController.dashboard);

// 搜索账单
router.get('/search', financeController.searchBills);

module.exports = router;
