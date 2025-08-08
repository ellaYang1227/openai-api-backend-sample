const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const transcribeAudio = require('../services/whisper');

const transcribe = {
  async createText(req, res, next) {
    if (!req.file) return next(appError(400, 'no_audio', next));

    console.log(
      `收到音訊檔案: ${req.file.originalname}, 大小: ${req.file.size} bytes`
    );

    // 使用緩衝區而非檔案路徑
    const result = await transcribeAudio(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (result.status) {
      successHandle(res, result.text)
    } else {
      next(appError(500, result.error, next));
    }
  }
};

module.exports = transcribe;