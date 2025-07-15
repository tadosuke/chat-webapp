import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの配信（ビルド済みファイル）
app.use(express.static(join(__dirname, "../dist-src")));

// ルートパス用の設定
app.get("/", (_req, res) => {
  res.sendFile(join(__dirname, "../dist-src/index.html"));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
