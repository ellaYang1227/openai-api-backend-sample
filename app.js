const express = require("express");
require("dotenv").config();

const { errorHandle } = require('./services/errorHandle');
const chatRouter = require('./routes/chat');

// 初始化 Express 應用程式
const app = express();

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/chat', chatRouter);

// express 錯誤處理(上線(Prod)-自己設定的 err 錯誤 & 開發(dev)環境錯誤)
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    errorHandle(res, err.statusCode, err.message);
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    errorHandle(res, 500, '500');
  }
};

const resErrorDev = (err, res) => {
  errorHandle(res, err.statusCode, err.message, err, err.stack);
};

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // dev
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }

  // prod
  resErrorProd(err, res);
});


module.exports = app;

