const express = require("express");
const router = express.Router();
const priceController = require("../controllers/priceController");

router.post("/", priceController.createPrice);
router.get("/", priceController.getAllPrice);
router.get("/:id", priceController.getPriceById);

module.exports = router;
