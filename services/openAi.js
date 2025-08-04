const OpenAI = require("openai");

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 取得 AI 回應
 * @param {Object} params - 包含模型、指令、輸入等參數
 * @returns {Promise<Object>} AI 回應
 */
const getAIResponse = async (params) => {
  return await openai.responses.create(params);
}

/**
 * 處理圖片辨識查詢
 * @param {string} query - 客戶的查詢
 * @param {string} imageUrl - 圖片URL
 * @returns {Promise<string>} - 包含回答的文字
 */
const processImageQuery = async (query, imageUrl) => {
  try {
    console.log(`處理圖片查詢: ${query}, 圖片: ${imageUrl}`);

    // 準備輸入
    const input = [
      {
        role: "user",
        content: [
          { type: "input_text", text: query || "這張圖片中有什麼？" },
          { type: "input_image", image_url: imageUrl },
        ],
      },
    ];

    console.log("input:", input);

    // 發送 AI 請求
    const response = await getAIResponse({
      model: "gpt-4o",
      input,
    });

    console.log("AI 回應:", response);

    // 返回 AI 回答
    return response.output_text;
  } catch (error) {
    console.error("處理圖片查詢出錯:", error);
    throw error;
  }
}

module.exports = {
  processImageQuery
};