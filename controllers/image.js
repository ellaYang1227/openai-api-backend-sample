const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const { generateImage } = require('../services/openAi');

const image = {
  async createImage(req, res, next) {
    try {
      const { prompt, size } = req.body;

      if (!prompt) return next(appError(400, 'no_prompt', next));

      const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
      const imageSize = validSizes.includes(size) ? size : "1024x1024";

      const result = await generateImage(prompt, imageSize);

      successHandle(res, {
        image_url: result.url,
        revised_prompt: result.revised_prompt,
      });
    } catch (error) {
      console.error("API 錯誤:", error);
      const errMsg = error.message || '生成圖片時發生錯誤';
      return next(appError(500, errMsg, next));
    }
  }
};

module.exports = image;