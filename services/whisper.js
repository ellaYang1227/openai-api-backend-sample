const axios = require("axios");
const FormData = require("form-data");
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * 音訊轉文字函式 - 使用記憶體緩衝區
 * @param {Buffer} audioBuffer - 包含音訊檔案內容的 Buffer 物件
 * @param {string} mimeType - 音訊檔案的 MIME 類型 (例如: 'audio/mpeg', 'audio/mp4')
 * @param {string} originalFilename - 原始音訊檔案的名稱 (例如: 'recording.mp3')，用來取得副檔名
 * @returns {Promise<{status: boolean, text?: string, error?: string}>}
 */
const transcribeAudio = async (audioBuffer, mimeType, originalFilename) => {
  try {
    console.log("轉錄音訊...", audioBuffer, mimeType, originalFilename);
    // 取得副檔名
    const extension = originalFilename.split(".").pop() || "mp3";

    // 創建 FormData
    const form = new FormData();
    form.append("model", "whisper-1");
    form.append("language", "zh");

    // 直接將緩衝區添加到 FormData
    form.append("file", audioBuffer, {
      filename: `audio.${extension}`,
      contentType: mimeType,
    });

    // 使用 axios 發送請求到 OpenAI API
    const response = await axios.post(
      `${OPENAI_BASE_URL}/audio/transcriptions`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return {
      status: true,
      text: response.data.text,
    };
  } catch (error) {
    return {
      status: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

module.exports = transcribeAudio;