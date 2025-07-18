/**
 * エコー機能の実装
 * リクエストとレスポンスに依存しない純粋な関数として実装
 */

/**
 * 受け取ったメッセージをそのまま返すエコー関数
 * @param message エコーするメッセージ
 * @returns 同じメッセージ
 */
export function echo(message: string): string {
  return message;
}