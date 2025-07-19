import { Router } from "express";
import { handleEcho, getMessages } from "./api-controller.js";

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

  return router;
}