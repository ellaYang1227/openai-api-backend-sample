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
 * 處理 AI 聊天
 * @param {Array} conversationHistory 訊息歷史紀錄
 * @returns {Promise<Object>} - AI 回應資料
 */
const processAIChat = async (conversationHistory) => {
  try {
    // 構建系統提示
    const stockInfo = `- 智慧型手機 X1：庫存 50
    - 筆記型電腦 Pro：庫存 30
    - 無線耳機：庫存 100
    - 智慧型手錶：庫存 45
    - 滑鼠：庫存 25`;

    const systemPrompt = `你是一個專業的客服機器人，專門負責回答商品庫存查詢。

    目前商品庫存情況：
    ${stockInfo}

    當用戶詢問商品庫存時，請提供上述最新資訊。如果用戶詢問其他商品，請告知我們目前沒有該商品的資訊。
    如果用戶詢問非庫存相關問題，請禮貌地引導他們詢問商品庫存情況。`;

    // 呼叫 OpenAI Responses API 與 Function Calling
    const response = await getAIResponse({
      model: "gpt-3.5-turbo",
      instructions: systemPrompt,
      input: conversationHistory,
      tools: [
        {
          type: "function",
          name: "provide_stock_info",
          description: "提供商品庫存資訊給用戶",
          parameters: {
            type: "object",
            properties: {
              response: {
                type: "string",
                description: "對用戶問題的回應",
              },
            },
            required: ["response"],
          },
        },
      ],
      tool_choice: { type: "function", name: "provide_stock_info" },
    });

    console.log('ai 回應:', response);
    // 取得回應內容
    const toolCall = response.output.find((item) => item.type === "function_call");
    const { response: aiResponseData } = JSON.parse(toolCall.arguments);

    return aiResponseData;
  } catch (error) {
    console.error("處理查詢出錯:", error);
    throw error;
  }
};


module.exports = {
  processAIChat
};