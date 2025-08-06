const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const { processWeatherQuery } = require('../services/openAi');

const weather = {
  async createChat(req, res, next) {
    try {
      const { query } = req.body;

      if (!query) return next(appError(400, 'no_query', next));

      console.log(`收到天氣查詢: "${query}"`);
      const result = await processWeatherQuery(query);

      // 如果沒有回答，返回錯誤
      if (!result.answer) return next(appError(500, 'no_answer', next));

      successHandle(res, result.answer);
    } catch (error) {
      console.error("處理天氣查詢時出錯:", error);
      const errMsg = error.message || '處理查詢時發生錯誤';
      return next(appError(500, errMsg, next));
    }
  }
};

module.exports = weather;