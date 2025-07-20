/**
 * 時刻関連の機能実装
 * リクエストとレスポンスに依存しない純粋な関数として実装
 */

/**
 * 現在時刻をHH:MM形式で取得する関数
 * @returns HH:MM形式の現在時刻（例: "15:48", "07:05"）
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}