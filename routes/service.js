const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service");

router.post("/chat", serviceController.createChat);

module.exports = router;