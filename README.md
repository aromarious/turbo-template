# Turbo Template

Turbo Repo + pnpmを使用したモノレポテンプレートプロジェクトです。

## プロジェクト構造

```
turbo-template/
├── apps/           # アプリケーション
├── packages/       # 共有パッケージ・ライブラリ
├── tooling/        # 開発ツール設定（ESLint、Prettier等）
├── turbo.json      # Turbo Repo設定
└── pnpm-workspace.yaml # pnpmワークスペース設定
```

- `apps`には何も入っていません
- `tooling`にて開発用ツールの設定をしてあります
  - [commitlint](./tooling/commitlint/src/index.ts) `husky`の`commit-msg`フックとして設定済
  - [docker](./tooling/docker/README.md) postgresのコンテナ設定済
    - [.env](./.env) … [.env.example](./.env.example) を cp して作成、適切な値を設定
    - [docker-compose.yml] postgresのデータディレクトリのマウント先を調整
    - 起動 `pnpm docker:up` 停止 `pnpm docker:down`
  - [eslint](./tooling/eslint/) それぞれのプロジェクトの`eslint.config.js`で適宜importして使う
  - [github]()

## 前提条件

- Node.js 22.14.0以上
- pnpm 9.6.0以上

pnpmがインストールされていない場合：
```bash
npm install -g pnpm
```

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# Huskyの初期化
pnpm prepare
```

## 利用可能なスクリプト

### ビルド

```bash
# すべてのパッケージをビルド（Turbo使用）
pnpm build

# ワークスペースのクリーン
pnpm clean:workspaces

# node_modulesのクリーン
pnpm clean
```

### 開発

```bash
# すべてのパッケージを開発モードで実行
pnpm dev

# 監視モードで開発
pnpm dev:watch
```

### コード品質

```bash
# フォーマット
pnpm format
pnpm format:fix

# Lint
pnpm lint
pnpm lint:fix

# 型チェック
pnpm typecheck

# ワークスペースの依存関係チェック
pnpm lint:ws

# マージ前の全チェック実行
pnpm premerge
```

### 個別のパッケージ

```bash
# 特定のパッケージで作業
pnpm --filter claude-history build
pnpm --filter claude-history dev

# パッケージディレクトリで直接実行
cd packages/claude-history
pnpm build
```

## パッケージ

### @aromarious/claude-history

Claude会話履歴の分析ツール

## 新しいパッケージの追加

1. `packages/`ディレクトリに新しいフォルダを作成
2. `package.json`を作成（名前は`@aromarious/パッケージ名`の形式）
3. `tsconfig.json`を作成（ルートのtsconfig.jsonを継承）
4. `pnpm install`を実行

## パッケージ間の依存関係

```bash
# パッケージAからパッケージBを依存として追加
cd packages/package-a
pnpm add @aromarious/package-b
```

## 開発のベストプラクティス

- 各パッケージは独立してビルド・テスト可能にする
- 共通の設定はルートレベルで管理
- パッケージ名は`@acme/`プレフィックスを使用
- TypeScriptの設定はルートのtsconfig.jsonを継承
