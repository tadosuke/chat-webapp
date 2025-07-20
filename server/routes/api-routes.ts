import { Router } from "express";
import { handleEcho, getConversations, getConversationMessages, deleteConversation } from "../controllers/api-controller.js";

/**
 * API ルーティングの設定
 * 各エンドポイントをコントローラー関数に振り分ける
 */
export function createRouter(): Router {
  const router = Router();

  // POST /echo エンドポイント
  router.post("/echo", handleEcho);

  // GET /conversations エンドポイント（会話一覧取得）
  router.get("/conversations", getConversations);

  // GET /conversations/:conversationId/messages エンドポイント（特定の会話のメッセージ取得）
  router.get("/conversations/:conversationId/messages", getConversationMessages);

  // DELETE /conversations/:conversationId エンドポイント（会話削除）
  router.delete("/conversations/:conversationId", deleteConversation);

  return router;
}