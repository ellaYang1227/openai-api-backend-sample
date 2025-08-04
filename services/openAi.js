const OpenAI = require("openai");
const calculateBMI = require('../utils/calculateBMI');
const recommendedRestaurant = require('../utils/recommendedRestaurant');

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
 * 處理 AI 回應中的 BMI 計算函式呼叫(calculate_bmi Function calling)
 * @param {Array<object>} input - 傳送給 AI 模型的輸入歷史陣列
 * @param {Object} output AI 回應的輸出
 * @returns {Promise<string|null>} AI 最終回答文字 若沒有呼叫 BMI 函式則返回 null
 */
const handleAiResponseCalculate_bmiFunctionCalling = async (input, output) => {
  const bmiCall = output.find((call) => call.name === "calculate_bmi");
  console.log("AI 呼叫 calculate_bmi:", bmiCall);
  // 檢查是否呼叫 calculate_bmi Function calling
  if (bmiCall) {
    // [開始] 2.解析模型的回應並執行本地端 calculateBMI 函式
    // 計算 BMI
    const args = JSON.parse(bmiCall.arguments);
    console.log("計算 BMI 參數:", args);
    const bmiResult = calculateBMI(args.height, args.weight);
    // [結束] 2.解析模型的回應並執行本地端 calculateBMI 函式

    // [開始] 3.提供結果並再次呼叫模型 取得最終回答
    // 將結果傳回 AI
    input.push(bmiCall);
    input.push({
      type: "function_call_output",
      call_id: bmiCall.call_id,
      output: JSON.stringify(bmiResult),
    });
    console.log('BMI 累積 input', input);

    // 獲取最終回答
    const finalResponse = await getAIResponse({
      model: "gpt-4o",
      instructions: "根據 BMI 數據回答問題，提供健康建議，提供純文字。",
      input,
    });

    console.log("獲取最終回答:", finalResponse, finalResponse.output_text);
    // [結束] 3.提供結果並再次呼叫模型 取得最終回答
    return finalResponse.output_text;
  }

  return null;
}

/**
 * 處理 AI 回應中的推薦餐廳函式呼叫(recommended_restaurant Function calling)
 * @param {Array<object>} input - 傳送給 AI 模型的輸入歷史陣列
 * @param {Object} output AI 回應的輸出
 * @returns {Promise<string|null>} AI 最終回答文字 若沒有呼叫推薦餐廳函式則返回 null
 */
const handleAiResponseRecommended_RestaurantFunctionCalling = async (input, output) => {
  const restaurantCall = output.find((call) => call.name === "recommended_restaurant");
  console.log("AI 呼叫 recommended_restaurant:", restaurantCall);
  // 檢查是否呼叫 recommended_restaurant Function calling
  if (restaurantCall) {
    // [開始] 2.解析模型的回應並執行本地端 recommendedRestaurant 函式
    // 獲取餐廳推薦
    const restaurantResult = recommendedRestaurant();
    // [結束] 2.解析模型的回應並執行本地端 recommendedRestaurant 函式

    // [開始] 3.提供結果並再次呼叫模型 取得最終回答
    // 將結果傳回 AI
    input.push(restaurantCall);
    input.push({
      type: "function_call_output",
      call_id: restaurantCall.call_id,
      output: JSON.stringify(restaurantResult),
    });
    console.log('推薦餐廳 累積 input', input);

    // 獲取最終回答
    const finalResponse = await getAIResponse({
      model: "gpt-4o",
      instructions: "根據餐廳列表回答問題，介紹餐廳特色。",
      input,
    });

    console.log("獲取最終回答:", finalResponse, finalResponse.output_text);
    // [結束] 3.提供結果並再次呼叫模型 取得最終回答
    return finalResponse.output_text;
  }

  return null;
}

/**
 * 處理 AI 查詢
 * @param {string} query - 客戶的查詢
 * @returns {Promise<Object>} - 包含回答和相關數據
 */
const processAIQuery = async (query) => {
  try {
    // [開始] 1.使用定義的 calculate_bmi 或 recommended_restaurant 可用工具呼叫模型
    // 定義可用工具
    const tools = [
      {
        type: "function",
        name: "calculate_bmi",
        description: "計算用戶的身體質量指數(BMI)",
        parameters: {
          type: "object",
          properties: {
            height: {
              type: "number",
              description: "用戶的身高（公分），例如 170",
            },
            weight: {
              type: "number",
              description: "用戶的體重（公斤），例如 65",
            },
          },
          required: ["height", "weight"],
          additionalProperties: false,
        },
        strict: true
      },
      {
        type: "function",
        name: "recommended_restaurant",
        description: "隨機推薦幾家餐廳",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false
        },
        strict: true
      }
    ];

    // 準備輸入
    const input = [{ role: "user", content: query }];
    console.log(`處理查詢: "${query}"`);

    // 第一次 AI 回應
    const response = await getAIResponse({
      model: "gpt-4o",
      instructions: `你是一個助手，可以回答 BMI 計算和餐廳推薦的問題。
當用戶詢問 BMI 相關問題時，呼叫 calculate_bmi 。
當用戶詢問餐廳推薦時，呼叫 recommend_food 。
使用繁體中文回答，簡潔友善。`,
      input,
      tools,
      tool_choice: "auto",
    });

    console.log("第一次 AI 回應:", response);
    // [結束] 1.使用定義的 calculate_bmi 或 recommended_restaurant 可用工具呼叫模型

    // 檢查是否有被呼叫
    if (response.output && response.output.length > 0) {
      // 獲取 BMI 計算
      const finalAnswerToBMI = await handleAiResponseCalculate_bmiFunctionCalling(input, response.output);

      if (finalAnswerToBMI) return finalAnswerToBMI;

      // 獲取餐廳推薦
      const finalAnswerToRestaurant = await handleAiResponseRecommended_RestaurantFunctionCalling(input, response.output);

      if (finalAnswerToRestaurant) return finalAnswerToRestaurant;
    }

    // 如果沒有呼叫，直接返回 AI 回答
    return '我擅長「BMI 諮詢與推薦口袋餐廳」，請提供身高和體重或請我推薦餐廳。';
  } catch (error) {
    console.error("處理查詢出錯:", error);
    throw error;
  }
};

module.exports = {
  processAIQuery
};