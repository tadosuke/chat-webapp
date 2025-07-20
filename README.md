# Chat Application

React + TypeScript + Viteを使用したリアルタイムチャットアプリケーションです。複数会話の管理、メッセージの送受信、エコー機能、時刻取得API、SQLiteでの会話履歴保存、リサイズ可能なサイドバーを提供します。

## 技術スタック

### フロントエンド
- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.4

### バックエンド
- Express 5.1.0
- SQLite3 5.1.7

### 開発ツール
- ESLint 9.30.1
- Vitest 3.2.4

## 機能

- **マルチ会話管理**: 複数の会話を作成・切り替え・削除
- **チャットインターフェース**: メッセージ送信・表示
- **メッセージエコー機能**: 送信したメッセージをエコーバック
- **時刻取得API**: 現在時刻を取得する機能
- **リサイズ可能サイドバー**: 会話リストのサイドバー幅を調整可能
- **SQLiteデータベース**: 会話履歴の永続化
- **リアルタイムメッセージ表示**: 送信したメッセージの即座反映
- **TypeScriptによる型安全性**: 厳密な型チェック

## セットアップ

```bash
# 依存関係のインストール
npm install

# フロントエンドとバックエンドのビルド
npm run build:all
```

## 開発モード

開発時は2つのサーバーを同時に起動します：

```bash
# バックエンド開発サーバー起動（ポート3000）
npm run dev:server

# フロントエンド開発サーバー起動（別ターミナル、ポート5173）
npm run dev:src
```

開発サーバー起動後、`http://localhost:5173` でアプリケーションにアクセスできます。
API は `http://localhost:3000/api` で提供されます。

## 本番モード

```bash
# ビルド実行
npm run build:all

# サーバー起動（ポート3000）
npm run run:server
```

本番モードでは、`http://localhost:3000` でアプリケーションにアクセスできます。

## プロジェクト構造

```
src/                    # React フロントエンドコード
├── components/         # Reactコンポーネント
│   ├── App/           # メインアプリケーションコンポーネント
│   ├── Chat/          # チャット統合コンポーネント
│   ├── ChatDisplay/   # メッセージ表示コンポーネント
│   ├── ChatInput/     # メッセージ入力コンポーネント
│   ├── ConversationList/ # 会話リスト関連コンポーネント
│   │   ├── ConversationDeleteButton.tsx # 削除ボタン
│   │   ├── ConversationItem.tsx        # 個別会話項目
│   │   ├── ConversationItems.tsx       # 会話項目リスト
│   │   └── index.tsx                   # メインコンポーネント
│   └── ResizeHandle/  # サイドバーリサイズハンドル
├── main.tsx           # アプリケーションエントリーポイント
└── assets/           # 静的リソース

server/               # Express バックエンドコード
├── controllers/      # API コントローラー
│   ├── api-controller.ts  # チャット・会話管理API
│   └── time-controller.ts # 時刻取得API
├── routes/          # ルーティング定義
│   └── api-routes.ts
├── services/        # ビジネスロジック
│   ├── conversation-history.ts # 会話履歴管理
│   ├── database.ts            # データベース接続
│   ├── echo.ts               # エコー機能
│   └── time.ts               # 時刻取得機能
└── index.ts         # サーバーエントリーポイント

__tests__/           # テストコード（13ファイル、75テスト）
├── unit/
│   ├── src/         # フロントエンドテスト
│   └── server/      # バックエンドテスト
```

## API エンドポイント

### チャット・会話管理
- `POST /api/echo` - メッセージエコー機能
- `GET /api/conversations` - 会話一覧取得
- `GET /api/conversations/:conversationId/messages` - 特定会話のメッセージ取得
- `DELETE /api/conversations/:conversationId` - 会話削除

### ユーティリティ
- `POST /api/time` - 現在時刻取得

## テスト

```bash
# 全テスト実行（13ファイル、75テストケース）
npm test

# ウォッチモードでテスト実行
npm test -- --watch
```

## データベース

アプリケーションは SQLite データベースを使用します。データベースファイルは `data/conversation.db` に自動作成されます。データディレクトリが存在しない場合は、アプリケーション起動時に自動的に作成されます。

### データベーススキーマ
- `conversations` テーブル: 会話情報（ID、タイトル、作成日時）
- `messages` テーブル: メッセージ情報（ID、会話ID、内容、送信者、作成日時）

## 開発ガイドライン

このプロジェクトは以下のコーディング規約に従っています：
- TypeScript 厳密モード使用
- React 関数コンポーネントとHooks使用
- ESLint による静的解析
- 日本語でのJSDoc・コメント記述
- コンポーネント単一責任原則（100行以下推奨）
