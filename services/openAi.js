const OpenAI = require("openai");
const { errorMsg } = require('./errorHandle');

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * (刪除)取得 AI 回應
 * @param {Object} params - 包含模型、指令、輸入等參數
 * @returns {Promise<Object>} AI 回應
 */
const getAIResponse = async (params) => {
  return await openai.responses.create(params);
}

/**
 * (刪除)取得 AI 生成圖片回應
 * @param {Object} prompt - 提式詞內容
 * @param {Object} params - 生成圖片的尺寸
 * @returns {Promise<Object>} AI 生成圖片回應
 */
const getGenerateImageResponse = async (prompt, size) => {
  return await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size,
    quality: "standard",
  });
}

const generateImage = async (prompt, size = "1024x1024") => {
  try {
    console.log(`生成圖片: "${prompt}", 尺寸: ${size}`);

    const response = await getGenerateImageResponse(prompt, size);

    console.log("圖片生成回應:", response);

    // 回傳生成的圖片URL
    if (response.data && response.data.length > 0) {
      return {
        url: response.data[0].url,
        revised_prompt: response.data[0].revised_prompt,
      };
    } else {
      throw new Error(errorMsg.unable_to_generate_image);
    }
  } catch (error) {
    console.error("生成圖片出錯:", error);
    throw error;
  }
}

module.exports = { generateImage }