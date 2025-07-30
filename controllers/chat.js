const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const { processAIQuery } = require('../services/openAi');

const chat = {
  async createChat(req, res, next) {
    try {
      const { message } = req.body;

      if (!message) return next(appError(400, 'empty_message', next));

      const answer = await processAIQuery(message);
      console.log("AI 回答:", answer);

      // 如果沒有回答，返回錯誤
      if (!answer) return next(appError(500, 'no_answer', next));

      successHandle(res, answer);
    } catch (error) {
      console.error('API 錯誤:', error);
      const errMsg = error.message || '處理查詢時發生錯誤';
      return next(appError(500, errMsg, next));
    }
  }
};

module.exports = chat;