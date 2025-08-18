const appError = require('../services/appError');
const successHandle = require('../services/successHandle');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const { processAIChat } = require("../services/openAi");

const service = {
  async createChat(req, res, next) {
    try {
      console.log("處理客服查詢..............................");

      const { message, userId } = req.body;

      if (!message) next(appError(400, 'empty_message', next));

      // 生成隨機用戶ID（如果沒有提供）
      const currentUserId = userId || `user_${Date.now()}`;

      // 尋找或建立對話
      let conversation = await Conversation.findOne({ userId: currentUserId });
      console.log("尋找 conversation:", conversation);

      if (!conversation) {
        // 建立新對話
        conversation = await Conversation.create({
          userId: currentUserId,
          lastActivity: new Date(),
        });
      } else {
        // 更新最後活動時間
        await Conversation.findOneAndUpdate({ userId: currentUserId }, { lastActivity: new Date() });
      }

      const { _id: conversationId } = conversation;
      console.log("conversationId:", conversationId);

      // 新增用戶資訊到 Message 資料庫
      await Message.create({
        conversation: conversationId,
        role: 'user',
        content: message,
      });

      // 取得訊息歷史紀錄
      const messageHistory = await Message
        .find({ conversation: conversationId })
        .sort({ createdAt: 1 });
      console.log("取得訊息歷史紀錄:", messageHistory);

      // 將訊息紀錄轉換為字串
      const conversationHistory = messageHistory
        .map((msg) => `${msg.role === "user" ? "用戶" : "客服"}: ${msg.content}`)
        .join("\n");
      console.log("訊息歷史紀錄:", conversationHistory);

      const aiResponseData = await processAIChat(conversationHistory);
      console.log("AI 回應內容:", aiResponseData);

      // 增加 AI 客服回應到資料庫
      await Message.create({
        conversation: conversationId,
        role: 'assistant',
        content: aiResponseData
      });


      // 回傳結果
      successHandle(res, {
        data: aiResponseData,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("處理客服查詢時出錯:", error);
      next(appError(500, error.message, next));
    }
  }
};

module.exports = service;