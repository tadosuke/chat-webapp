import { Request, Response } from "express";
import { echo } from "../services/echo.js";
import { getDatabase } from "../services/database.js";
import { ensureConversation, saveEchoMessages } from "../services/conversation-history.js";

/**
 * エコー API のコントローラー
 * リクエストからメッセージを取得し、echo.ts の echo 関数を呼び出して結果を返す
 * 同時にユーザーメッセージとエコーメッセージの両方をデータベースに保存する
 */
export async function handleEcho(req: Request, res: Response): Promise<void> {
  try {
    // リクエストボディからメッセージと会話IDを取得
    const { message, conversationId } = req.body;

    // メッセージが文字列でない場合はエラーを返す
    if (typeof message !== "string") {
      res.status(400).json({ error: "Message must be a string" });
      return;
    }

    // 会話IDを確保（新規作成または既存使用）
    const currentConversationId = await ensureConversation(message, conversationId);

    // echo.ts の echo 関数を呼び出し
    const result = echo(message);

    // ユーザーメッセージとエコーメッセージを保存
    await saveEchoMessages(message, result, currentConversationId);

    // レスポンスとして結果と会話IDを返す
    res.json({ message: result, conversationId: currentConversationId });
  } catch (error) {
    console.error("Echo API error:", error);
    // エラーハンドリング
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * 会話一覧取得 API のコントローラー
 * データベースから全ての会話を取得して返す
 */
export async function getConversations(_req: Request, res: Response): Promise<void> {
  try {
    const db = getDatabase();
    const conversations = await db.getConversations();

    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Database error" });
  }
}

/**
 * 特定の会話のメッセージ取得 API のコントローラー
 * 指定された会話IDのメッセージを取得して返す
 */
export async function getConversationMessages(req: Request, res: Response): Promise<void> {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId || isNaN(Number(conversationId))) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }

    const db = getDatabase();
    const messages = await db.getMessagesByConversationId(Number(conversationId));

    res.json(messages);
  } catch (error) {
    console.error("Get conversation messages error:", error);
    res.status(500).json({ error: "Database error" });
  }
}

/**
 * 会話削除 API のコントローラー
 * 指定された会話IDの会話とその関連メッセージを削除する
 */
export async function deleteConversation(req: Request, res: Response): Promise<void> {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId || isNaN(Number(conversationId))) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }

    const db = getDatabase();
    await db.deleteConversation(Number(conversationId));

    res.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({ error: "Database error" });
  }
}