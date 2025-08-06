# openai-api-backend-sample
用 Node.js + Express 快速串接 OpenAI API。

## 技術筆記
- [申請 OpenAI 免費額度資格與 API 金鑰](https://perfect-submarine-445.notion.site/OpenAI-API-22697d04e2cb80988cbdf7376ed35ad3?source=copy_link)
- [用 Node.js + Express 快速串接 OpenAI API(1-3)：AI 天氣查詢](https://perfect-submarine-445.notion.site/Node-js-Express-OpenAI-API-1-3-AI-24597d04e2cb808f9dcbeac6cac3cfc0?source=copy_link)

## 安裝

以下將會引導你如何安裝此專案到你的電腦上。

- Node.js v20.18.0

### 取得專案

```
git clone git@github.com:ellaYang1227/openai-api-backend-sample.git
```

### 移動到專案內

```
cd openai-api-backend-sample
```

### 安裝套件

```
npm install
```

### 啟動伺服器

```
# 生產模式
npm run start

# 開發模式(自動重啟)
npm run start:dev

# 生產模式(自動重啟)
npm run start:prod
```

### 瀏覽器開啟專案

```
http://127.0.0.1:3000/
```

### 環境變數
請參照 .env.example 檔案新增 .env 檔案：

```
OPENAI_API_KEY =
WEATHER_API_KEY = 
WEATHER_BASE_URL = https://api.weatherapi.com/v1
```

## 專案技術

- Node.js v20.18.0
- dotenv v17.1.0
- express v5.1.0
- openai v5.8.3
- cross-env v7.0.3
- nodemon v3.1.10
- axios v1.11.0
