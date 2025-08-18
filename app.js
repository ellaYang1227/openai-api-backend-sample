const express = require("express");
require("dotenv").config();

const { errorHandle } = require('./services/errorHandle');
// [開始]新增 serviceRouter 路由 - 1
const serviceRouter = require('./routes/service');
// [結束]新增 serviceRouter 路由 - 1

// 初始化 Express 應用程式
const app = express();
// MongoDB 連線
require('./connections');

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 提供靜態檔案服務：讓 index.html 以 /index.html 路徑存取，不會自動加 public 前綴
app.use(express.static("public"));

// [開始]新增 serviceRouter 路由 - 2
app.use('/service', serviceRouter);
// [結束]新增 serviceRouter 路由 - 2

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