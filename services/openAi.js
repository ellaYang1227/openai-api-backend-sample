const OpenAI = require("openai");
const { errorMsg } = require('./errorHandle');

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

const PRODUCT_CATEGORIES = ["男裝", "女裝", "鞋子", "3C", "玩具", "遊戲", "煙酒", "家具"];

/**
 * 生成商品分類標籤
 * @param {string} imageUrl - 圖片URL
 * @returns {Promise<Object>} - 包含標籤的對象
 */
async function generateProductCategories(imageUrl) {
  try {
    console.log(`生成商品分類標籤，圖片: ${imageUrl}`);

    // 定義可用工具(tools)的函式
    const tools = [
      {
        type: "function",
        name: "select_product_categories",
        description:
          "從預定義的商品分類標籤中選擇最適合的標籤，所有回應必須使用繁體中文",
        parameters: {
          type: "object",
          properties: {
            product_name: {
              type: "string",
              description: "產品名稱（必須使用繁體中文）",
            },
            product_description: {
              type: "string",
              description: "產品的簡短描述（必須使用繁體中文）",
            },
            categories: {
              type: "array",
              description:
                "從預定義分類中選擇的商品分類標籤，最多選擇5個最相關的標籤",
              items: {
                type: "string",
                enum: PRODUCT_CATEGORIES,
              },
              maxItems: 5,
            },
          },
          required: ["product_name", "product_description", "categories"],
          additionalProperties: false,
        },
        strict: true
      },
    ];

    // 準備輸入
    const input = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "請分析這張產品圖片，從預定義的商品分類標籤中選擇最適合的標籤。請選擇最多5個最相關的標籤，並提供簡短的產品描述。請務必使用繁體中文回答，產品名稱和描述都必須是繁體中文。",
          },
          { type: "input_image", image_url: imageUrl },
        ],
      },
    ];

    console.log("AI 輸入:", input);

    // 發送 AI 請求
    const response = await getAIResponse({
      model: "gpt-4o",
      input,
      tools,
      tool_choice: "auto",
    });

    console.log("AI 回應:", response);

    // 檢查是否有函式被呼叫
    if (response.output && response.output.length > 0) {
      const functionCall = response.output.find(
        (call) => call.name === "select_product_categories"
      );

      if (functionCall) {
        // 解析函式參數
        const args = JSON.parse(functionCall.arguments);
        console.log("函式呼叫參數:", args);
        return {
          status: true,
          data: args,
        };
      }
    }

    // 如果沒有函式呼叫，返回錯誤
    return {
      status: false,
      error: errorMsg.no_label
    };
  } catch (error) {
    console.error("生成商品分類標籤出錯:", error);
    return {
      status: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateProductCategories
};