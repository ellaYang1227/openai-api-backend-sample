const errorMsg = {
  'no_copy_content': '請提供文案內容',
  'no_complete_project_data': '請提供完整的專案資料',
  'no_project_name': '請提供專案名稱',
  'api_request_error': 'API 請求錯誤，請稍後再試',
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