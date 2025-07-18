import sqlite3 from "sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SQLite データベース接続とテーブル初期化
 */
export class Database {
  private db: sqlite3.Database;

  constructor(dbPath?: string) {
    const defaultPath = join(__dirname, "../data/conversation.db");
    this.db = new sqlite3.Database(dbPath || defaultPath);
  }

  /**
   * データベースの初期化（テーブル作成）
   */
  public initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS conversation_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          sender TEXT NOT NULL DEFAULT 'user',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableQuery, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * メッセージを保存
   */
  public saveMessage(text: string, sender: 'user' | 'echo' = 'user'): Promise<{ id: number; text: string }> {
    return new Promise((resolve, reject) => {
      const insertQuery = "INSERT INTO conversation_history (text, sender) VALUES (?, ?)";
      
      this.db.run(insertQuery, [text, sender], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, text });
        }
      });
    });
  }

  /**
   * 全メッセージを取得
   */
  public getMessages(): Promise<Array<{ id: number; text: string; sender: string; timestamp: string }>> {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT * FROM conversation_history ORDER BY timestamp ASC";
      
      this.db.all(selectQuery, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Array<{ id: number; text: string; sender: string; timestamp: string }>);
        }
      });
    });
  }

  /**
   * データベース接続を閉じる
   */
  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// シングルトンインスタンス
let dbInstance: Database | null = null;

/**
 * データベースインスタンスを取得
 */
export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}