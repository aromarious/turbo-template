# Turbo Template

Turbo Repo + pnpmを使用したモノレポテンプレートプロジェクトです。

**このテンプレートについて**: 開発ツールの設定が完了しており、あなたのパッケージやアプリケーションを追加していくためのベースとなります。

## 使い方

### 1. `create-turbo`でテンプレートとして利用

パッケージプレフィックスを指定してテンプレートを作成：

```bash
PACKAGE_PREFIX=@your-company npx create-turbo@latest -e https://github.com/aromarious/turbo-template your-project
```

### 2. `gh`コマンドでテンプレートとして利用

GitHub CLI または GitHub の `Use this template` を利用し、テンプレートからリポジトリを作成：

```bash
# ghコマンドでテンプレートからリポジトリを作成
gh repo create my-project --template aromarious/turbo-template --clone

# プロジェクトディレクトリに移動してパッケージプレフィックスを設定
cd my-project
PACKAGE_PREFIX=@mycompany pnpm install
```

## このテンプレートの使用方法

## プロジェクト構造

```
turbo-template/
├── apps/           # アプリケーション（空）
├── packages/       # 共有パッケージ・ライブラリ（空）
├── tooling/        # 開発ツール設定（設定済み）
│   ├── commitlint/ # Commitlint設定
│   ├── docker/     # Docker設定（PostgreSQL）
│   ├── eslint/     # ESLint設定
│   ├── github/     # GitHub Actions設定
│   ├── prettier/   # Prettier設定
│   ├── setup/      # セットアップスクリプト
│   └── tsconfig/   # TypeScript設定
├── turbo.json      # Turbo Repo設定
└── pnpm-workspace.yaml # pnpmワークスペース設定
```

## 設定済みの開発ツール

ワークスペースルートに設定ファイルを置かず、`package.json`に設定を記述します。設定はパッケージで提供されており、それを利用します。

### Commitlint
- [commitlint設定](./tooling/commitlint/src/index.ts)
- `husky`の`commit-msg`フックとして設定済み
- `index.ts`を変更したら `pnpm build` します
- `echo 'test commit message' | pnpm commitlint` でテストできます
- `pnpm commitlint --print-config` で設定内容が表示できます

### Docker
- [Docker設定](./tooling/docker/README.md)
- PostgreSQLコンテナ設定済み
- 環境変数: [.env.example](./.env.example) を参考に `.env` を作成すること
- 起動: `pnpm docker:up` 停止: `pnpm docker:down`

### ESLint
- [ESLint設定](./tooling/eslint/)
- プロジェクトの`eslint.config.js`でimportして使用
- `husky`の`pre-commit`フックとして設定済み（`lint-staged`から呼び出している）

### Prettier
- [Prettier設定](./tooling/prettier/index.js)
- `husky`の`pre-commit`フックとして設定済み(`lint-staged`から呼び出している)

### TypeScript
- [TypeScript設定](./tooling/typescript/)
- `base.json` … コンパイルするパッケージではこれを使う

### GitHub Actions 設定
- [GitHub Actions](./tooling/github/)
- ここにあるものを利用してプルリク時のCIを設定済み [ci.yml](./.github/workflows/ci.yml)

### その他
- Husky設定 ... [.husky](./.husky)
- `lint-staged`設定 ... [package.json](./package.json)に直接設定を記述、`husky`の`pre-commit`フックとして設定済み

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

## 新しいパッケージの追加

`pnpm gen`コマンドでパッケージを作成します：

```bash
# Turbo Generatorを実行
pnpm gen
```

コマンドを実行すると、対話形式でパッケージの種類と名前を聞かれます：

1. パッケージタイプを選択（例：`package`, `app`など）
2. パッケージ名を入力（例：`my-utils`）

パッケージが作成されたら、以下の手順を実行：

```bash
# appsにあるべきパッケージ（アプリケーション）の場合は手動で移設
# 例：Next.jsアプリ、サーバーアプリなど
(mv packages/my-app apps/my-app)

# 作成されたパッケージディレクトリに移動
cd packages/my-utils  # または apps/my-app

# 依存関係をインストール（ルートで実行推奨）
cd ../../
pnpm install

# パッケージをビルド
pnpm build
```

### 作成される内容

- `packages/`ディレクトリに新しいフォルダ
- `package.json`（名前は`@acme/パッケージ名`の形式）
- `tsconfig.json`（ルートのtsconfig.jsonを継承）

## パッケージ間の依存関係

```bash
# パッケージAからパッケージBを依存として追加
cd packages/package-a
pnpm add @acme/package-b
```

## 開発のベストプラクティス

- 各パッケージは独立してビルド・テスト可能にする
- パッケージ名は`@mycompany/`プレフィックスを使用
