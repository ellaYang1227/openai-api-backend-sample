const OpenAI = require("openai");
const getWeatherByCity = require("../utils/getWeatherByCity");


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
 * 處理天氣查詢
 * @param {string} query - 用戶的查詢
 * @returns {Promise<Object>} - 包含回答和天氣數據的對象
 */
const processWeatherQuery = async (query) => {
  try {
    // 定義可用工具(tools)的函式
    const tools = [
      {
        type: "function",
        name: "get_weather",
        description: "取得指定城市的天氣信息",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "城市名稱，例如 taipei, tokyo, new york",
            },
            days: {
              type: "integer",
              description: "預報天數 (1-7)",
            },
          },
          required: ["city"],
          additionalProperties: false
        }
      },
    ];

    // 準備輸入
    const input = [{ role: "user", content: query }];
    console.log(`處理天氣查詢: "${query}"`);

    // 第一次 AI 回應
    const response = await getAIResponse({
      model: "gpt-4o",
      instructions: `你是一個天氣助手，可以回答用戶關於天氣的問題。
當用戶詢問天氣相關問題時，呼叫 get_weather 函式取得天氣數據。
使用繁體中文回答，簡潔友善。`,
      input,
      tools,
      tool_choice: "auto",
    });

    console.log("AI 回應:", response);
    // 檢查是否有函式被呼叫
    if (response.output && response.output.length > 0) {
      // 檢查是否是天氣查詢
      const weatherCall = response.output.find((call) => call.name === "get_weather");

      if (weatherCall) {
        // 取得天氣數據
        const args = JSON.parse(weatherCall.arguments);
        const city = args.city || "taipei";
        const days = args.days || 7;

        console.log(`取得城市 "${city}" 的天氣數據`);
        const weatherData = await getWeatherByCity(city, days);
        console.log("天氣數據:", weatherData);

        // 將所有累積的 AI input 傳給 AI
        input.push(weatherCall);
        input.push({
          type: "function_call_output",
          call_id: weatherCall.call_id,
          output: JSON.stringify(weatherData),
        });

        console.log('api 輸入:', input);

        // 取得最終回答
        const finalResponse = await getAIResponse({
          model: "gpt-4o-mini",
          instructions: `你是一個天氣助手，根據提供的天氣數據回答用戶問題。
使用繁體中文回答，簡潔友善。
如果用戶問的是預測性問題（如"會下雨嗎"），根據降雨機率和降水量做出合理判斷。`,
          input
        });

        console.log("最終 AI 回應:", finalResponse);

        return {
          query,
          city,
          answer: finalResponse.output_text,
          weatherData,
        };
      }
    }

    // 如果沒有函式呼叫，直接返回 AI 回答
    return {
      query,
      answer: '請告訴我，你想查詢哪個城市的天氣資訊！',
      weatherData: null,
    };
  } catch (error) {
    console.error("處理天氣查詢出錯:", error);
    throw error;
  }
}

module.exports = { processWeatherQuery };