# Chat Application

React + TypeScript + Viteを使用したリアルタイムチャットアプリケーションです。メッセージの送受信、エコー機能、SQLiteでの会話履歴保存を提供します。

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

- チャットインターフェース（メッセージ送信・表示）
- メッセージエコー機能
- SQLiteデータベースでの会話履歴保存
- リアルタイムメッセージ表示
- TypeScriptによる型安全性

## セットアップ

```bash
# 依存関係のインストール
npm install

# フロントエンドとバックエンドのビルド
npm run build:all
```

## 開発モード

```bash
# フロントエンド開発サーバー起動
npm run dev:src

# バックエンド開発サーバー起動（別ターミナル）
npm run dev:server
```

## 本番モード

```bash
# ビルド実行
npm run build:all

# サーバー起動
npm run run:server
```

## プロジェクト構造

```
src/              # React フロントエンドコード
├── Chat.tsx      # メインチャットコンポーネント
├── ChatDisplay.tsx # メッセージ表示コンポーネント
└── ChatInput.tsx # メッセージ入力コンポーネント

server/           # Express バックエンドコード
├── index.ts      # サーバーエントリーポイント
├── routes.ts     # API ルーティング
├── api-controller.ts # API コントローラー
└── db.ts         # データベース管理

__tests__/        # テストコード
```

## テスト

```bash
# 全テスト実行
npm test
```
