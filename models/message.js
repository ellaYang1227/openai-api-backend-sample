const mongoose = require('mongoose');

// 定義訊息 Schema
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.ObjectId,
    ref: "Conversation", // 填寫 model name
    required: [true, 'conversation ID 必填']
  },
  role: {
    type: String,
    required: [true, '身分必填'],
    cast: false
  },
  content: {
    type: String,
    required: [true, '留言內容必填'],
    cast: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false // 移除欄位 __v
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;