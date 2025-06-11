const express = require('express');
const router = express.Router();
const carrierController = require('../controllers/carrierController');

router.get('/', carrierController.getAllCarriers);

module.exports = router;
