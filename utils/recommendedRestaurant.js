/**
 * 取得推薦餐廳
 * @returns {Object} - 推薦的餐廳列表
 */
const recommendedRestaurant = () => {
  const restaurants = [
    "鼎泰豐",
    "添好運點心專門店",
    "乾杯燒肉",
    "藏壽司",
    "涓豆腐",
    "金子半之助",
    "屋馬燒肉",
    "貳樓餐廳",
    "樂福餐廳"
  ];

  // 隨機選擇3家餐廳
  const shuffled = restaurants.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return { recommendations: selected };
}

module.exports = recommendedRestaurant;