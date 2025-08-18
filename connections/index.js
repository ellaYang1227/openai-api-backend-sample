const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const { DATABASE, DATABASE_PASSWORD } = process.env;
const DB = DATABASE.replace('<db_password>', DATABASE_PASSWORD);

const mongoose = require('mongoose');
// 帳號 yanzi19841227 db_name open-ai
// 連接資料庫 mongodb+srv://yanzi19841227:<db_password>@cluster0.us2n3sk.mongodb.net/open-ai?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect(DB)
  .then(() => console.log('連接資料庫成功'))
  .catch((error) => console.error(error));