const express = require('express');
const router = express.Router();

const imageControllers = require('../controllers/image');
router.post('/generation', imageControllers.createImage);

module.exports = router;