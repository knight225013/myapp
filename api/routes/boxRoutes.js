const express = require('express');
const router = express.Router();
const boxController = require('../controllers/boxController');

router.put('/:id', boxController.updateBox); // 更新箱子

module.exports = router;
