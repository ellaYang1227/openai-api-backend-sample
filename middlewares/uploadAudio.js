const multer = require("multer");
const { errorMsg } = require("../services/errorHandle");

/**
 * 音訊/影片檔案上傳中間件
 * 使用記憶體儲存，限制檔案大小為 25MB，只允許 audio/video 類型檔案
 * 可用於 Express 路由的檔案上傳處理
 *
 * @module uploadAudio
 * @type {multer.Instance}
 */
const uploadAudio = multer({
  storage: multer.memoryStorage(), // 使用記憶體儲存
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB 限制：OpenAI API Speech to text 檔案限制
  fileFilter: (req, file, cb) => {
    console.log("上傳音訊/影片檔案:", file.mimetype);
    // 只允許音訊/影片檔案
    if (file.mimetype.startsWith("audio/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error(errorMsg.no_audio));
    }
  },
});

module.exports = uploadAudio;