const express = require("express");
const router = express.Router();
const fundraisingController = require("../controllers/fundraising");

router.post("/generate", fundraisingController.generate);
router.post("/check", fundraisingController.check);

module.exports = router;