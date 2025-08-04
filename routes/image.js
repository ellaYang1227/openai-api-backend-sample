const express = require('express');
const router = express.Router();

const imageControllers = require('../controllers/image');
router.post('/product-categories', imageControllers.createImageChat);

module.exports = router;