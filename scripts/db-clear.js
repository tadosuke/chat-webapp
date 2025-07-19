#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 会話履歴データベースファイルを削除して初期状態に戻す
 */
async function clearDatabase() {
  try {
    // プロジェクトルートからのデータベースファイルパス
    const projectRoot = join(__dirname, '..');
    const dataDir = join(projectRoot, 'data');
    const dbPath = join(dataDir, 'conversation.db');

    console.log('会話履歴データベースをクリアしています...');
    console.log(`データベースパス: ${dbPath}`);

    // データベースファイルが存在する場合は削除
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
      console.log('✓ データベースファイルを削除しました');
    } else {
      console.log('ℹ データベースファイルが存在しませんでした');
    }

    // dataディレクトリが存在しない場合は作成
    // (サーバー起動時にデータベースが作成される際に必要)
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log('✓ dataディレクトリを作成しました');
    }

    console.log('✓ 会話履歴データベースのクリアが完了しました');
    console.log('ℹ サーバー再起動時に新しいデータベースが作成されます');

  } catch (error) {
    console.error('✗ データベースクリア中にエラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabase();
}

export { clearDatabase };