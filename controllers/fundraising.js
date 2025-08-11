const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const { processFundraisingCopy, processCopyCheck } = require("../services/openAi");
const { errMsg } = require("../services/errorHandle");
const setDefaultFundraisingData = require("../utils/setDefaultFundraisingData").setDefaultFundraisingData;

const fundraising = {
  // 1. 生成文案
  async generate(req, res, next) {
    try {
      const projectData = req.body;

      // 檢查必要欄位
      if (!projectData.projectName) return next(appError(400, 'no_project_name', next));

      // 設定預設值
      const processedData = setDefaultFundraisingData(projectData);

      console.log(`收到募資文案生成請求: "${processedData.projectName}"`);
      const result = await processFundraisingCopy(processedData);
      successHandle(res, result);
    } catch (error) {
      console.error("處理募資文案生成時出錯:", error);
      const errorMsg = error.message || errMsg['api_request_error'];
      next(appError(500, errorMsg, next));
    }
  },
  // 2. 審核文案
  async check(req, res, next) {
    try {
      const { copyContent, projectData } = req.body;

      // 檢查必要欄位
      if (!copyContent) return next(appError(400, 'no_copy_content', next));

      if (!projectData || !projectData.projectName) return next(appError(400, 'no_complete_project_data', next));

      console.log(`收到文案檢測請求: "${projectData.projectName}"`);
      const result = await processCopyCheck({ copyContent, projectData });

      successHandle(res, result);
    } catch (error) {
      console.error("處理文案檢測時出錯:", error);
      const errorMsg = error.message || errMsg['api_request_error'];
      next(appError(500, errorMsg, next));
    }
  }
};

module.exports = fundraising;