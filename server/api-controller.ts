import { Request, Response } from "express";
import { echo } from "./greeting.js";

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