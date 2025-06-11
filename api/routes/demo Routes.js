// plop-templates/route.hbs
const express = require('express');
const router = express.Router();
const { createDemo } = require('../controllers/demo Controller');

router.post('/', createDemo);

// TODO: 加上 GET/PUT/DELETE 等路由
// router.get("/", getAllDemo);
// router.get("/:id", getDemoById);
// …

module.exports = router;
