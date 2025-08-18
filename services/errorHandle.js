const errorMsg = {
  'empty_message': '缺少訊息內容',
  500: '系統錯誤，請洽系統管理員'
};

const errorHandle = (res, statusCode, message, error, stack) => {
  message = errorMsg.hasOwnProperty(message) ? errorMsg[message] : message;

  const send = {
    status: false,
    message
  };

  if (error) send.error = error;
  if (stack) send.stack = stack;

  res.status(statusCode).json(send);
};

module.exports = { errorMsg, errorHandle };