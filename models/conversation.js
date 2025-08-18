const mongoose = require('mongoose');

// 定義對話 Schema
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, '使用者 id 必填'],
    cast: false // 停用 Mongoose 的自動型別轉換（casting）功能
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false // 移除欄位 __v
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;