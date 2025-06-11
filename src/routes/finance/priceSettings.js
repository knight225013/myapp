const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/financeController');

router.get('/:priceId/settings', financeController.listSettings);
router.post('/:priceId/settings', financeController.createSetting);

module.exports = router;
