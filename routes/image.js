const express = require('express');
const router = express.Router();

const imageControllers = require('../controllers/image');
router.post('/analysis', imageControllers.createImageChat);

module.exports = router;