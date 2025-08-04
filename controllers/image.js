const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const { processImageQuery } = require('../services/openAi');

const image = {
  async createImageChat(req, res, next) {
    try {
      const { message, imageUrl } = req.body;

      if (!imageUrl) return next(appError(400, 'no_image_url', next));

      const answer = await processImageQuery(message, imageUrl);
      console.log("AI 回答:", answer);

      // 如果沒有回答，返回錯誤
      if (!answer) return next(appError(500, 'no_answer', next));

      successHandle(res, answer);
    } catch (error) {
      console.error("API 錯誤:", error);
      const errMsg = error.message || '處理圖片查詢時發生錯誤';
      return next(appError(500, errMsg, next));
    }
  }
};

module.exports = image;