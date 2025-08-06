const getWeatherData = require('../services/weather');

/**
 * 根據城市名稱取得天氣
 * @param {string} city - 城市名稱
 * @param {number} [days=7] 預報天數 (1-10)
 * @returns {Promise<Object>} - 天氣數據
 */
const getWeatherByCity = async (city, days) => {
  try {
    console.log(`取得城市天氣: ${city}`);
    const weatherData = await getWeatherData(city, days);
    return weatherData;
  } catch (error) {
    console.error("根據城市取得天氣時出錯:", error);
    throw error;
  }
}

module.exports = getWeatherByCity;