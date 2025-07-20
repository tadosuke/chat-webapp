import sqlite3 from "sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SQLite データベース接続とテーブル初期化
 */
export class Database {
  private db: sqlite3.Database;

  constructor(dbPath?: string) {
    const defaultPath = join(__dirname, "../../data/conversation.db");
    
    // データディレクトリが存在しない場合は作成
    const dataDir = dirname(dbPath || defaultPath);
    try {
      mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合のエラーは無視
    }
    
    this.db = new sqlite3.Database(dbPath || defaultPath);
  }

  /**
   * データベースの初期化（テーブル作成）
   */
  public initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createConversationsTable = `
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createMessagesTable = `
        CREATE TABLE IF NOT EXISTS conversation_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          sender TEXT NOT NULL DEFAULT 'user',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
        )
      `;

      // まず会話テーブルを作成
      this.db.run(createConversationsTable, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // 次にメッセージテーブルを作成
        this.db.run(createMessagesTable, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * 新しい会話を作成
   */
  public createConversation(title: string): Promise<{ id: number; title: string }> {
    return new Promise((resolve, reject) => {
      const insertQuery = "INSERT INTO conversations (title) VALUES (?)";
      
      this.db.run(insertQuery, [title], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, title });
        }
      });
    });
  }

  /**
   * 全ての会話を取得
   */
  public getConversations(): Promise<Array<{ id: number; title: string; created_at: string }>> {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT * FROM conversations ORDER BY created_at DESC";
      
      this.db.all(selectQuery, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Array<{ id: number; title: string; created_at: string }>);
        }
      });
    });
  }

  /**
   * 指定された会話のメッセージを取得
   */
  public getMessagesByConversationId(conversationId: number): Promise<Array<{ id: number; text: string; sender: string; timestamp: string }>> {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT * FROM conversation_history WHERE conversation_id = ? ORDER BY timestamp ASC";
      
      this.db.all(selectQuery, [conversationId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Array<{ id: number; text: string; sender: string; timestamp: string }>);
        }
      });
    });
  }

  /**
   * メッセージを保存
   */
  public saveMessage(text: string, sender: 'user' | 'echo' = 'user', conversationId: number): Promise<{ id: number; text: string }> {
    return new Promise((resolve, reject) => {
      const insertQuery = "INSERT INTO conversation_history (conversation_id, text, sender) VALUES (?, ?, ?)";
      
      this.db.run(insertQuery, [conversationId, text, sender], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, text });
        }
      });
    });
  }

  /**
   * 全メッセージを取得（後方互換性のため残すが、最新の会話のメッセージのみ返す）
   */
  public getMessages(): Promise<Array<{ id: number; text: string; sender: string; timestamp: string }>> {
    return new Promise((resolve, reject) => {
      // 最新の会話のIDを取得
      const latestConversationQuery = "SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1";
      
      this.db.get(latestConversationQuery, [], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          // 会話が存在しない場合は空配列を返す
          resolve([]);
          return;
        }
        
        // 最新の会話のメッセージを取得
        this.getMessagesByConversationId(row.id).then(resolve).catch(reject);
      });
    });
  }

  /**
   * 指定された会話を削除
   */
  public deleteConversation(conversationId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // CASCADE DELETE により関連メッセージも自動削除される
      const deleteQuery = "DELETE FROM conversations WHERE id = ?";
      
      this.db.run(deleteQuery, [conversationId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 全メッセージを削除（全ての会話を削除）
   */
  public clearMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      // まずメッセージを削除、次に会話を削除
      const deleteMessagesQuery = "DELETE FROM conversation_history";
      const deleteConversationsQuery = "DELETE FROM conversations";
      
      this.db.run(deleteMessagesQuery, [], (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.db.run(deleteConversationsQuery, [], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
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