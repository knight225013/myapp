// routes/labelTemplateRoutes.js
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/labelTemplateController.js');

router.get('/', templateController.getLabelTemplates);
router.post('/create', templateController.createTemplate);
router.put('/update/:id', templateController.updateTemplate);
router.post('/download-labels', templateController.downloadLabels);

module.exports = router;
