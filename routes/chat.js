const express = require('express');
const router = express.Router();

const chatControllers = require('../controllers/chat');
router.post('', chatControllers.createChat);

module.exports = router;