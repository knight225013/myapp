// routes/trackRoutes.js
const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

router.post('/update', trackController.updateTrackByNumber);
router.post('/batch', trackController.batchTrack);

module.exports = router;
