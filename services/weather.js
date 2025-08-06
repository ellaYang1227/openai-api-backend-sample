// 天氣 API 配置
const axios = require("axios");
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = process.env.WEATHER_BASE_URL;

/**
 * 取得天氣數據
 * @param {string} city - 城市名稱
 * @param {number} [days=7] - 預報天數 (1-7)
 * @returns {Promise<Object>} - 天氣數據
 */
const getWeatherData = async (city, days = 7) => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: city,
        days,
        aqi: "no",
        alerts: "no",
        lang: "zh_tw",
      },
    });
    return response.data;
  } catch (error) {
    console.error("取得天氣數據時出錯:", error);
    throw error;
  }
}

module.exports = getWeatherData;