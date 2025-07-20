import { getDatabase } from "./database.js";

/**
 * 会話管理サービス関数
 * req/res に依存しないデータベース関連のビジネスロジックを提供
 */

/**
 * メッセージから会話を作成または取得し、会話IDを返す
 * @param message ユーザーメッセージ
 * @param conversationId 既存の会話ID（オプション）
 * @returns 会話ID
 */
export async function ensureConversation(message: string, conversationId?: number): Promise<number> {
  const db = getDatabase();
  
  // 会話IDが指定されている場合はそのまま返す
  if (conversationId) {
    return conversationId;
  }
  
  // 会話IDが指定されていない場合は新しい会話を作成
  // メッセージから会話のタイトルを生成（最初の15文字）
  const title = message.length > 15 ? message.substring(0, 15) + "..." : message;
  const conversation = await db.createConversation(title);
  
  return conversation.id;
}

/**
 * ユーザーメッセージとエコーメッセージの両方をデータベースに保存
 * @param userMessage ユーザーメッセージ
 * @param echoMessage エコーメッセージ
 * @param conversationId 会話ID
 */
export async function saveEchoMessages(userMessage: string, echoMessage: string, conversationId: number): Promise<void> {
  const db = getDatabase();
  
  // ユーザーメッセージをデータベースに保存
  await db.saveMessage(userMessage, 'user', conversationId);
  
  // エコーメッセージをデータベースに保存
  await db.saveMessage(echoMessage, 'echo', conversationId);
}