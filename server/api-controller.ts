import { Request, Response } from "express";
import { echo } from "./greeting.js";
import { getDatabase } from "./db.js";

/**
 * エコー API のコントローラー
 * リクエストからメッセージを取得し、greeting.ts の echo 関数を呼び出して結果を返す
 */
export function handleEcho(req: Request, res: Response): void {
  try {
    // リクエストボディからメッセージを取得
    const { message } = req.body;

    // メッセージが文字列でない場合はエラーを返す
    if (typeof message !== "string") {
      res.status(400).json({ error: "Message must be a string" });
      return;
    }

    // greeting.ts の echo 関数を呼び出し
    const result = echo(message);

    // レスポンスとして同じメッセージを返す
    res.json({ message: result });
  } catch {
    // エラーハンドリング
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * メッセージ保存 API のコントローラー
 * リクエストからメッセージを取得し、データベースに保存する
 */
export async function saveMessage(req: Request, res: Response): Promise<void> {
  try {
    const { message } = req.body;

    // メッセージが文字列でない場合はエラーを返す
    if (typeof message !== "string") {
      res.status(400).json({ error: "Message must be a string" });
      return;
    }

    const db = getDatabase();
    const result = await db.saveMessage(message);

    res.json({ id: result.id, text: result.text });
  } catch (error) {
    console.error("Save message error:", error);
    res.status(500).json({ error: "Database error" });
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