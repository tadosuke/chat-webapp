# プロジェクト概要

このプロジェクトは、Vite + React + TypeScript を使用した Web アプリケーションです。

# 技術スタック

- **フロントエンド**: React 19.1.0
- **ビルドツール**: Vite 7.0.4
- **言語**: TypeScript 5.8.3
- **リンター**: ESLint 9.30.1
- **サーバー**: Express 5.1.0

# コーディング規約

## TypeScript

- 厳密な TypeScript モードを使用（strict: true）
- `noUnusedLocals`、`noUnusedParameters`を有効化
- 型定義は明示的に記述し、`any`型の使用を避ける
- ES2022 の機能を使用可能

## React

- 関数コンポーネントを使用
- Hooks を適切に使用
- JSX は`react-jsx`変換を使用
- コンポーネント名は PascalCase で命名

## インポート

- 絶対パスではなく相対パスを使用
- 使用しないインポートは削除
- TypeScript ファイルの拡張子は明示的に記述可能

## ファイル構造

- `src/`ディレクトリ内にソースコードを配置
- 静的ファイルは`public/`ディレクトリに配置
- サーバーサイドコードは`server/`ディレクトリに配置

## ESLint 設定

- ESLint の推奨設定を使用
- React Hooks の規則を適用
- React Refresh の規則を適用

# 開発ガイドライン

## コンポーネント作成

```typescript
// 推奨: 関数コンポーネントとHooksを使用
import { useState } from "react";

interface Props {
  title: string;
}

function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}

export default MyComponent;
```

## イベントハンドラー

- アロー関数を使用してイベントハンドラーを定義
- 型安全性を保つため、適切な型注釈を追加

## スタイリング

- CSS Modules または CSS-in-JS を使用
- クラス名は kebab-case で命名

# 注意事項

- `noEmit: true`が設定されているため、TypeScript はコンパイルのみ実行
- `moduleResolution: "bundler"`を使用
- `verbatimModuleSyntax: true`により、型のみのインポートは明示的に記述
- HMR（Hot Module Replacement）が有効

# 推奨パターン

1. **状態管理**: useState、useReducer を適切に使用
2. **副作用**: useEffect を適切に使用し、クリーンアップ関数を忘れずに
3. **パフォーマンス**: 必要に応じて useMemo、useCallback を使用
4. **エラーハンドリング**: Error Boundary を使用してエラーを適切に処理

# 避けるべきパターン

1. `any`型の使用
2. 非同期処理での適切なエラーハンドリングの省略
3. useEffect の依存配列の省略
4. 不必要な re-render の発生

# コミット規約

- コミットメッセージは日本語で記述
- 変更の内容を簡潔に記述
- 機能追加: `feat: 新機能の説明`
- バグ修正: `fix: バグの説明`
- リファクタリング: `refactor: リファクタリングの説明`
