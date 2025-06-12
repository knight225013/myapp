const express = require('express');
const router = express.Router();
const { getSettingsByPriceId, createSetting } = require('../controllers/priceSettingController');

router.get('/prices/:priceId/settings', getSettingsByPriceId);
router.post('/settings', createSetting);

module.exports = router; 