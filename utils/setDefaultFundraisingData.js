const setDefaultFundraisingData = ({ projectName, targetFund, startDate, endDate, productType, brandBackground, coreFeatures, targetAudience, toneStyle }) => {
  const defaultValue = "未指定";
  const defaultToneStyle = "專業友善";
  return {
    projectName: projectName,
    targetFund: targetFund || defaultValue,
    startDate: startDate || defaultValue,
    endDate: endDate || defaultValue,
    productType: productType || defaultValue,
    brandBackground: brandBackground || defaultValue,
    coreFeatures: coreFeatures || defaultValue,
    targetAudience: targetAudience || defaultValue,
    toneStyle: toneStyle || defaultToneStyle,
  }
};

module.exports = { setDefaultFundraisingData };