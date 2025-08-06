const express = require('express');
const router = express.Router();

const weatherControllers = require('../controllers/weather');
router.post('/query', weatherControllers.createChat);

module.exports = router;