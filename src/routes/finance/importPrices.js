const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/financeController');

router.post('/:priceId/settings/import', financeController.importPrices);

module.exports = router;
