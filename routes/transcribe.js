const express = require('express');
const router = express.Router();
const uploadAudio = require("../middlewares/uploadAudio");

const transcribeControllers = require('../controllers/transcribe');
router.post('', uploadAudio.single("audio"), transcribeControllers.createText);

module.exports = router;