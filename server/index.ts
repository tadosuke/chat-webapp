import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRouter } from "./routes/api-routes.js";
import { getDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// JSON パース用のミドルウェア
app.use(express.json());

// API ルーターの使用
app.use("/api", createRouter());

// 静的ファイルの配信（ビルド済みファイル）
app.use(express.static(join(__dirname, "../dist-src")));

// ルートパス用の設定
app.get("/", (_req, res) => {
  res.sendFile(join(__dirname, "../dist-src/index.html"));
});

// データベース初期化とサーバー起動
async function startServer() {
  try {
    // データベースの初期化
    const db = getDatabase();
    await db.initialize();
    console.log("Database initialized successfully");

    // サーバー起動
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
