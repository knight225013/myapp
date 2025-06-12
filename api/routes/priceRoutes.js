const express = require("express");
const router = express.Router();
const { createPrice, getAllPrice, getPriceById } = require("../controllers/priceController");

router.post("/", createPrice);
router.get("/", getAllPrice);
router.get("/:priceId", getPriceById);

module.exports = router;
