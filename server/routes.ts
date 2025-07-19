import { Router } from "express";
import { handleEcho, getMessages, clearMessages } from "./api-controller.js";

/**
 * API ルーティングの設定
 * 各エンドポイントをコントローラー関数に振り分ける
 */
export function createRouter(): Router {
  const router = Router();

  // POST /echo エンドポイント
  router.post("/echo", handleEcho);

  // GET /messages エンドポイント（メッセージ取得）
  router.get("/messages", getMessages);

  // DELETE /messages エンドポイント（メッセージ削除）
  router.delete("/messages", clearMessages);

  return router;
}