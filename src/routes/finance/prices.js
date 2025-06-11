const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/financeController');

router.get('/', financeController.listPrices);
router.post('/', financeController.createPrice);

module.exports = router;
