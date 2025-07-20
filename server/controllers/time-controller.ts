import { Request, Response } from "express";
import { getCurrentTime } from "../services/time.js";

/**
 * 時刻 API のコントローラー
 * 現在時刻を取得し、HH:MM形式で返す
 */
export async function handleTime(_req: Request, res: Response): Promise<void> {
  try {
    // time.ts の getCurrentTime 関数を呼び出し
    const currentTime = getCurrentTime();

    // レスポンスとして現在時刻を返す
    res.json({ message: currentTime });
  } catch (error) {
    console.error("Time API error:", error);
    // エラーハンドリング
    res.status(500).json({ error: "Internal server error" });
  }
}