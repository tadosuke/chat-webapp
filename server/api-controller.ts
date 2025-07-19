import { Request, Response } from "express";
import { echo } from "./greeting.js";
import { getDatabase } from "./db.js";

/**
 * エコー API のコントローラー
 * リクエストからメッセージを取得し、greeting.ts の echo 関数を呼び出して結果を返す
 * 同時にユーザーメッセージとエコーメッセージの両方をデータベースに保存する
 */
export async function handleEcho(req: Request, res: Response): Promise<void> {
  try {
    // リクエストボディからメッセージを取得
    const { message } = req.body;

    // メッセージが文字列でない場合はエラーを返す
    if (typeof message !== "string") {
      res.status(400).json({ error: "Message must be a string" });
      return;
    }

    const db = getDatabase();

    // ユーザーメッセージをデータベースに保存
    await db.saveMessage(message, 'user');

    // greeting.ts の echo 関数を呼び出し
    const result = echo(message);

    // エコーメッセージをデータベースに保存
    await db.saveMessage(result, 'echo');

    // レスポンスとして同じメッセージを返す
    res.json({ message: result });
  } catch (error) {
    console.error("Echo API error:", error);
    // エラーハンドリング
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * メッセージ取得 API のコントローラー
 * データベースから全てのメッセージを取得して返す
 */
export async function getMessages(_req: Request, res: Response): Promise<void> {
  try {
    const db = getDatabase();
    const messages = await db.getMessages();

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Database error" });
  }
}

/**
 * メッセージ削除 API のコントローラー
 * データベースから全てのメッセージを削除する
 */
export async function clearMessages(_req: Request, res: Response): Promise<void> {
  try {
    const db = getDatabase();
    await db.clearMessages();

    res.json({ success: true });
  } catch (error) {
    console.error("Clear messages error:", error);
    res.status(500).json({ error: "Database error" });
  }
}