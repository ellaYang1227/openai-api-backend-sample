const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const { generateProductCategories } = require('../services/openAi');

const image = {
  async createImageChat(req, res, next) {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) return next(appError(400, 'no_image_url', next));

      console.log("imageUrl", imageUrl);
      const result = await generateProductCategories(imageUrl);
      console.log("生成的標籤結果:", result);
      if (!result.status) {
        const errMsg = result.error || 'no_label';
        return next(appError(422, errMsg, next))
      }

      successHandle(res, result.data);
    } catch (error) {
      console.error("API 錯誤:", error);
      const errMsg = error.message || '處理圖片標籤時發生錯誤';
      return next(appError(500, errMsg, next));
    }
  }
};

module.exports = image;