const OpenAI = require("openai");
const { sensitiveWordsList, checkList } = require("../data/fundraising");

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
 * 1-1. 處理募資文案生成
 * @param {Object} projectData - 專案資料
 * @returns {Promise<Object>} - 生成的文案
 */
const processFundraisingCopy = async (projectData) => {
  try {
    console.log(`生成募資文案: "${projectData.projectName}"`);
    const copyContent = await generateFundraisingCopy(projectData);

    return {
      projectData,
      copyContent,
    };
  } catch (error) {
    console.error("處理募資文案生成時出錯:", error);
    throw error;
  }
}

/**
 * 1-1-1. 生成募資文案
 * @param {Object} projectData - 專案資料
 * @returns {Promise<string>} - 生成的文案
 */
const generateFundraisingCopy = async (projectData) => {
  try {
    console.log(`生成募資文案: ${projectData.projectName}`);

    // 構建結構化的提示
    const prompt = `
你是一位專業的文案撰寫專家，以下是專案資訊：
專案名稱：${projectData.projectName}
募資目標金額：${projectData.targetFund}
開始/結束日期：${projectData.startDate} ~ ${projectData.endDate}
產品類型：${projectData.productType}
團隊背景：${projectData.brandBackground}
核心特色：${projectData.coreFeatures}
目標客群：${projectData.targetAudience}
希望文案風格：${projectData.toneStyle}

請根據以上資訊，創建一個完整的募資頁面文案，包含以下部分：
1. 引人注目的標題
2. 簡短有力的專案摘要
3. 專案背景與故事
4. 產品/服務特色與優勢[可以有多個區塊，不需要只有一個]
5. 團隊介紹
6. 資金用途說明
7. 回饋方案建議
8. 時程規劃
9. 結尾呼籲行動

使用繁體中文，並根據指定的文案風格撰寫。
`;

    const response = await getAIResponse({
      model: "gpt-4o",
      instructions:
        "你是一位專業的募資文案撰寫專家，擅長撰寫吸引人的眾籌專案文案。",
      input: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    console.log("生成的募資文案:", response);
    return response.output_text;
  } catch (error) {
    console.error("生成募資文案時出錯:", error);
    throw error;
  }
}

/**
 * 2-1. 處理文案檢測流程
 * @param {Object} data - 包含文案內容和專案資料
 * @returns {Promise<Object>} - 檢測結果
 */
const processCopyCheck = async (data) => {
  try {
    const { copyContent, projectData } = data;

    // 第一階段：敏感詞檢測
    console.log("第一階段：敏感詞檢測");
    const sensitiveCheck = await detectSensitiveContent(copyContent);

    // 第二階段：法規檢測
    console.log("第二階段：法規檢測");
    const regulatoryCheck = await regulatoryCompliance(
      copyContent,
      projectData
    );

    // 生成總結回饋
    const results = {
      projectData,
      copyContent,
      sensitiveCheck,
      regulatoryCheck,
    };

    const feedback = await generateFeedback(results);

    return {
      sensitiveCheck,
      regulatoryCheck,
      feedback,
    };
  } catch (error) {
    console.error("處理文案檢測時出錯:", error);
    throw error;
  }
}

/**
 * 2-1-1. 檢測敏感詞
 * @param {string} content - 要檢測的文案內容
 * @returns {Promise<Object>} - 檢測結果
 */
async function detectSensitiveContent(content) {
  try {
    console.log("進行敏感詞檢測");

    // 定義函式
    const tools = [
      {
        type: "function",
        name: "sensitive_content_analysis",
        description: "分析文案中的敏感內容並提供結果",
        parameters: {
          type: "object",
          properties: {
            hasSensitiveContent: {
              type: "boolean",
              description: "是否發現敏感內容",
            },
            sensitiveWords: {
              type: "array",
              items: {
                type: "string",
              },
              description: "發現的敏感詞列表",
            },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    description: "問題類別，如政治敏感、歧視性語言等",
                  },
                  description: {
                    type: "string",
                    description: "問題說明",
                  },
                  suggestion: {
                    type: "string",
                    description: "修改建議",
                  },
                },
              },
              description: "敏感內容問題列表",
            },
            summary: {
              type: "string",
              description: "敏感內容分析總結",
            },
          },
          required: [
            "hasSensitiveContent",
            "sensitiveWords",
            "issues",
            "summary",
          ],
          additionalProperties: false,
        }
      },
    ];

    const response = await getAIResponse({
      model: "gpt-4o",
      instructions: `你是一位內容審核專家，負責檢測文案中可能存在的敏感詞或不適當內容。
請特別檢查以下敏感詞列表中的詞語是否出現在文案中：
${sensitiveWordsList}

此外，也請檢查以下類別的敏感內容：
1. 政治敏感詞
2. 歧視性語言
3. 違法或灰色地帶內容
4. 誇大不實的宣傳
5. 侵犯智慧財產權的內容
6. 違反平台規範的內容

請使用 sensitive_content_analysis 函式回傳分析結果，提供詳細的敏感詞檢測報告。`,
      input: [{ role: "user", content }],
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    // 解析函式呼叫結果
    console.log("敏感詞檢測 AI 回應:", response);
    if (response.output && response.output.length > 0) {
      const functionCall = response.output.find(
        (item) =>
          item.type === "function_call" &&
          item.name === "sensitive_content_analysis"
      );

      if (functionCall) {
        const result = JSON.parse(functionCall.arguments);

        // 添加原始分析文本
        const analysisText = `敏感詞檢測結果：
是否發現敏感內容：${result.hasSensitiveContent ? "是" : "否"}
${result.hasSensitiveContent
            ? `發現的敏感詞：${result.sensitiveWords.join("、")}`
            : "未發現敏感詞"
          }

問題詳情：
${result.issues
            .map(
              (issue) =>
                `- ${issue.category}：${issue.description}\n  建議：${issue.suggestion}`
            )
            .join("\n\n")}

總結：${result.summary}`;

        return {
          ...result,
          analysis: analysisText,
        };
      }
    }

    // 如果函式呼叫失敗，回傳預設結果
    return {
      hasSensitiveContent: false,
      sensitiveWords: [],
      issues: [],
      summary: "無法進行敏感詞分析",
      analysis: "無法進行敏感詞分析，請稍後再試。",
    };
  } catch (error) {
    console.error("檢測敏感詞時出錯:", error);
    throw error;
  }
}

/**
 * 2-1-2. 進行法規檢測
 * @param {string} content - 要檢測的文案內容
 * @param {Object} projectData - 專案資料
 * @returns {Promise<Object>} - 檢測結果
 */
const regulatoryCompliance = async (content, projectData) => {
  try {
    console.log("進行法規檢測");

    // 定義函式
    const tools = [
      {
        type: "function",
        name: "regulatory_compliance_analysis",
        description: "分析文案是否符合法規並提供結果",
        parameters: {
          type: "object",
          properties: {
            hasRegulatoryIssues: {
              type: "boolean",
              description: "是否發現法規問題",
            },
            violations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    description: "違規類別",
                  },
                  content: {
                    type: "string",
                    description: "違規內容",
                  },
                  law: {
                    type: "string",
                    description: "相關法規",
                  },
                  suggestion: {
                    type: "string",
                    description: "修正建議",
                  },
                },
              },
              description: "法規違規列表",
            },
            missingElements: {
              type: "array",
              items: {
                type: "string",
              },
              description: "缺少的必要元素（如風險揭露、退款政策等）",
            },
            summary: {
              type: "string",
              description: "法規檢測總結",
            },
          },
          required: [
            "hasRegulatoryIssues",
            "violations",
            "missingElements",
            "summary",
          ],
          additionalProperties: false,
        }
      },
    ];

    const response = await getAIResponse({
      model: "gpt-4o",
      instructions: `你是一位募資平台法規專家，負責檢查募資文案是否符合相關法規。
請特別檢查以下法規清單中提到的違規情況是否出現在文案中：
${checkList}

此外，也請檢查以下方面：
1. 消費者保護法相關規範
2. 廣告法規遵循
3. 募資平台特定規範
4. 產品安全與責任聲明
5. 智慧財產權聲明
6. 退款與交付政策

請使用 regulatory_compliance_analysis 函式回傳分析結果，提供詳細的法規檢測報告。`,
      input: [
        {
          role: "user",
          content: `專案資料: ${JSON.stringify(
            projectData
          )}\n\n文案內容: ${content}`,
        },
      ],
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    // 解析函式呼叫結果
    console.log("法規檢測 AI 回應:", response);
    if (response.output && response.output.length > 0) {
      const functionCall = response.output.find(
        (item) =>
          item.type === "function_call" &&
          item.name === "regulatory_compliance_analysis"
      );

      if (functionCall) {
        const result = JSON.parse(functionCall.arguments);

        // 添加原始分析文本
        const analysisText = `法規檢測結果：
是否發現法規問題：${result.hasRegulatoryIssues ? "是" : "否"}

${result.hasRegulatoryIssues ? "違規項目：" : ""}
${result.violations
            .map(
              (v) =>
                `- ${v.category}：${v.content}\n  相關法規：${v.law}\n  建議：${v.suggestion}`
            )
            .join("\n\n")}

${result.missingElements.length > 0 ? "缺少的必要元素：" : ""}
${result.missingElements.map((e) => `- ${e}`).join("\n")}

總結：${result.summary}`;

        return {
          ...result,
          analysis: analysisText,
        };
      }
    }

    // 如果函式呼叫失敗，回傳預設結果
    return {
      hasRegulatoryIssues: false,
      violations: [],
      missingElements: [],
      summary: "無法進行法規檢測",
      analysis: "無法進行法規檢測，請稍後再試。",
    };
  } catch (error) {
    console.error("進行法規檢測時出錯:", error);
    throw error;
  }
}

/**
 * 2-1-3. 生成總結回饋
 * @param {Object} results - 各階段結果
 * @returns {Promise<string>} - 總結回饋
 */
const generateFeedback = async (results) => {
  try {
    console.log("生成總結回饋", results);

    const response = await getAIResponse({
      model: "gpt-4o",
      instructions: `你是一位募資顧問專家，負責提供專業的募資文案回饋。
根據文案生成、敏感詞檢測和法規檢測的結果，提供全面的總結回饋。
包含以下方面：
1. 文案整體評價
2. 敏感內容處理建議
3. 法規合規性建議
4. 改進方向
5. 募資成功要點提示

使用繁體中文，提供專業、實用且具體的建議。`,
      input: [{ role: "user", content: JSON.stringify(results) }],
      temperature: 0.5,
    });

    console.log("生成的總結回饋:", response);
    return response.output_text;
  } catch (error) {
    console.error("生成總結回饋時出錯:", error);
    throw error;
  }
}

module.exports = {
  processFundraisingCopy,
  processCopyCheck,
};

