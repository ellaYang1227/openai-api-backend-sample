/**
 * 計算 BMI
 * @param {number} height - 身高（公分）
 * @param {number} weight - 體重（公斤）
 * @returns {Object} - BMI 值
 */
const calculateBMI = (height, weight) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const roundedBMI = parseFloat(bmi.toFixed(2));

  let category;
  if (bmi < 18.5) category = "體重過輕";
  else if (bmi < 24) category = "正常體重";
  else if (bmi < 27) category = "過重";
  else if (bmi < 30) category = "輕度肥胖";
  else if (bmi < 35) category = "中度肥胖";
  else category = "重度肥胖";

  return { bmi: roundedBMI, category };
}

module.exports = calculateBMI;