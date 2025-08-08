const express = require("express");
require("dotenv").config();

const { errorHandle } = require('./services/errorHandle');
// [開始]新增 transcribeRouter 路由 - 1
const transcribeRouter = require('./routes/transcribe');
// [結束]新增 transcribeRouter 路由 - 1

// 初始化 Express 應用程式
const app = express();

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// [開始]新增 transcribeRouter 路由 - 2
app.use('/transcribe', transcribeRouter);
// [結束]新增 transcribeRouter 路由 - 2

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
  // [開始]新增上傳錯誤訊息統一判斷
  if (err.message.indexOf('上傳') > -1) {
    err.statusCode = 400;
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  // [結束]新增上傳錯誤訊息統一判斷


  resErrorProd(err, res);
});


module.exports = app;