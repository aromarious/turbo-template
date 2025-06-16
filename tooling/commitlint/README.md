# @acme/commitlint-config

このパッケージは、monorepo用の共有commitlint設定を提供します。Gitmoji（絵文字付きコミット）スタイルに基づいて、一貫性のあるコミットメッセージの形式を強制し、各プロジェクトで個別に`commitlint.config`を作成する必要をなくします。

## 📦 インストール

```bash
pnpm add -D @acme/commitlint-config
```

## 🚀 使用方法

プロジェクトの`package.json`に次のように設定してください：

```json
{
  "commitlint": {
    "extends": ["@acme/commitlint-config"]
  }
}
```

## 📝 コミットメッセージの形式

### Gitmojiスタイル（必須）

```
✨ type(scope?): subject

body?

footer?
```

**注意**: この設定では絵文字で開始することが必須です。絵文字なしのコミットメッセージはエラーになります。

#### Scope（スコープ）について

- **任意**: scopeは省略可能です
- **小文字必須**: `auth`, `api`, `user-service`など小文字で記述
- **ハイフン区切り**: 複数単語は`-`で区切る（`user-service`, `payment-gateway`など）
- **例**: `✨ feat(auth): add login feature`, `🐛 fix(api): resolve timeout issue`

### 許可されるタイプ

| タイプ     | 説明                               | 絵文字 |
| ---------- | ---------------------------------- | ------ |
| `feat`     | 新機能の追加                       | ✨     |
| `fix`      | バグ修正                           | 🐛     |
| `refactor` | リファクタリング（機能変更なし）   | ♻️     |
| `docs`     | ドキュメントの追加・更新           | 📝     |
| `test`     | テストの追加・修正                 | ✅     |
| `perf`     | パフォーマンス改善                 | ⚡     |
| `revert`   | 以前のコミットの取り消し           | ⏪     |
| `style`    | コードフォーマット・スタイル修正   | 💄     |
| `build`    | ビルドシステム・外部依存関係の変更 | 👷     |
| `ci`       | CI設定ファイルやスクリプトの変更   | 💚     |
| `wip`      | 作業中（Work In Progress）         | 🚧     |
| `chore`    | その他のメンテナンス作業           | 🔧     |
| `env`      | 環境設定・環境変数の変更           | 🌍     |

## ✅ 良い例

### Gitmojiスタイル（必須）

```bash
# scope なし
✨ feat: add user authentication feature
🐛 fix: resolve memory leak in user service
♻️ refactor: improve database connection logic
📝 docs: update API documentation
✅ test: add unit tests for user repository
⚡ perf: optimize query performance
⏪ revert: revert previous commit changes
💄 style: format code with prettier
👷 build: update webpack configuration
💚 ci: update GitHub Actions workflow
🚧 wip: work in progress on payment module
🔧 chore: update dependencies
🌍 env: add production environment variables

# scope 付き
✨ feat(auth): add user authentication feature
🐛 fix(api): resolve timeout issue in user service
♻️ refactor(db): improve database connection logic
📝 docs(user-service): update API documentation
✅ test(auth): add unit tests for login functionality
⚡ perf(query): optimize database query performance
💄 style(components): format React components
👷 build(webpack): update webpack configuration
💚 ci(github): update GitHub Actions workflow
🚧 wip(payment-gateway): work in progress on payment module
```

## ❌ 悪い例

```bash
# 絵文字なし（必須のgitmojiルール違反）
feat: add user authentication feature

# タイプが大文字
✨ FEAT: add user authentication feature

# 許可されていないタイプ
✨ update: add new feature

# コロンの後にスペースがない
✨ feat:add user authentication

# 72文字制限を超過
✨ feat: add a very long commit message that exceeds the 72 character limit and will be truncated on GitHub

# subjectが空
✨ feat:
```

## 🔧 設定ルール

この設定には以下のルールが含まれています：

### 📏 文字数制限

- **`header-max-length`**: 72文字（GitHubで省略されない）

### 🎯 必須ルール

- **`start-with-gitmoji`**: 絵文字で開始することを**必須**（gitmojiスタイル）
- **`type-enum`**: 許可されたタイプのみ使用可能
- **`subject-empty`**: 件名は必須
- **`type-empty`**: タイプは必須

### 📋 その他のルール

- **`body-leading-blank`**: 本文の前に空行が必要
- **`footer-leading-blank`**: フッターの前に空行が必要
- **`header-trim`**: ヘッダーの前後の空白を削除
- **`subject-full-stop`**: 件名の末尾にピリオドを禁止
- **`type-case`**: タイプは小文字のみ
- **`scope-case`**: スコープは小文字のみ

## 🧪 テスト方法

### 基本的なテスト

コミットメッセージをテストするには、以下のコマンドを使用してください：

```bash
# Gitmojiスタイル（推奨）をテスト
echo "✨ feat: add new feature" | npx commitlint

# 通常スタイルをテスト
echo "feat: add new feature" | npx commitlint

# 間違った形式をテスト（エラーになる）
echo "update: Add New Feature" | npx commitlint

# 文字数制限をテスト（エラーになる）
echo "✨ feat: this is a very long commit message that exceeds 72 characters" | npx commitlint
```

### 🛠 ルール修正時のテスト手順

ルール設定を変更した場合は、以下の手順でテストしてください：

#### 1. TypeScript設定をビルド

```bash
cd tooling/commitlint
npx tsc
```

#### 2. プロジェクトルートでテスト実行

```bash
cd /path/to/project/root

# ✅ 正常パターンのテスト
echo "✨ feat: add user authentication" | npx commitlint
echo "🐛 fix: resolve memory leak issue" | npx commitlint
echo "📝 docs: update API documentation" | npx commitlint
echo "♻️ refactor: improve code structure" | npx commitlint

# ❌ エラーパターンのテスト
echo "feat: missing emoji" | npx commitlint           # 絵文字なし
echo "✨ FEAT: wrong case" | npx commitlint           # 大文字タイプ
echo "✨ invalid: wrong type" | npx commitlint        # 無効なタイプ
echo "✨ feat: Very Long Subject" | npx commitlint    # 大文字subject
echo "✨ feat: this message is way too long and exceeds the 72 character limit" | npx commitlint  # 文字数超過
```

#### 3. 包括的テスト（ワンライナー）

```bash
# 複数パターンを一度にテスト
for msg in \
  "✨ feat: add new feature" \
  "🐛 fix: resolve bug" \
  "📝 docs: update readme" \
  "feat: missing emoji" \
  "✨ FEAT: wrong case" \
  "✨ invalid: wrong type"; do
  echo -e "\n📝 Testing: $msg"
  echo "$msg" | npx commitlint
  echo "---"
done
```

#### 4. 設定の確認

```bash
# 現在の設定を表示（ルールが正しく反映されているか確認）
npx commitlint --print-config
```

### 📊 文字数確認

コミットメッセージの文字数を確認：

```bash
echo "✨ feat: add user authentication" | wc -c
# 結果: 33文字（72文字以内 ✅）
```

## 📋 設定確認

### 📖 現在の設定を詳細表示

この共有設定パッケージがどのように適用されているかを確認できます：

```bash
npx commitlint --print-config
```

このコマンドで以下の情報が表示されます：

- 継承している設定（`extends`）
- 適用されているルール（`rules`）
- パーサー設定（`parserPreset`）
- プラグイン情報（`plugins`）

### 🔍 利用可能なルール一覧

commitlintで利用可能な全てのルールを確認するには、公式ドキュメントを参照してください：

- [commitlint Rules リファレンス](https://commitlint.js.org/reference/rules.html)

または、設定ファイルで使用されているルールの詳細を確認：

`bash`

### ❓ commitlintのヘルプ

```bash
npx commitlint --help
```

## 🔗 参考リンク

- **[Gitmoji](https://gitmoji.dev/)** - 絵文字付きコミットメッセージのガイド
- **[Conventional Commits](https://www.conventionalcommits.org/)** - コミットメッセージの規約
- **[commitlint公式ドキュメント](https://commitlint.js.org/)** - commitlintの詳細設定
- **[commitlint Rules](https://commitlint.js.org/reference/rules.html)** - 利用可能なルール一覧

## 💡 ベストプラクティス

### ✅ 推奨事項

1. **Gitmojiスタイルを使用**: `✨ feat: add new feature`
2. **72文字以内**: GitHubで省略されない
3. **現在形で記述**: `added` ではなく `add` を使用
4. **小文字で開始**: subject は小文字で始める
5. **ピリオドなし**: subject の末尾にピリオドを付けない

## 🔧 開発・カスタマイズ

### カスタムルールの追加

独自のルールを追加したい場合は、`./src/index.ts`でルールをオーバーライドできます：

```typescript
import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@acme/commitlint-config'],
  rules: {
    // カスタムルールをここに追加
    'header-max-length': [2, 'always', 50], // より短い制限
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'custom-type', // カスタムタイプを追加
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'], // ケース制限を有効化
    'start-with-gitmoji': [0], // 絵文字必須を無効化
  },
}

export default config
```

## 🎨 Gitmojiのカスタマイズ

特定の絵文字のみを許可したい場合：

```typescript
import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@acme/commitlint-config'],
  rules: {
    // 許可する絵文字を制限
    'start-with-gitmoji': [
      2,
      'always',
      {
        allowedEmojis: ['✨', '🐛', '📝', '♻️', '🔧'],
      },
    ],
  },
}

export default config
```

## 📄 ライセンス

MIT

```bash
# tsconfig.jsonの設定を確認
cat tooling/commitlint/tsconfig.json

# "extends": "@acme/tsconfig/base.json" になっているかチェック
# internal-package.json だとビルドされません

# 手動でビルド
cd tooling/commitlint && npx tsc --build
```

### ルール変更が反映されない

```bash
# 1. distフォルダを削除して完全リビルド
cd tooling/commitlint
rm -rf dist
npx tsc

# 2. 設定確認
cd /path/to/project/root
npx commitlint --print-config

# 3. テスト実行
echo "✨ feat: test message" | npx commitlint
```

### 📏 文字数の目安

- **短い**: `✨ feat: add login` (18文字)
- **適切**: `✨ feat: add user authentication` (33文字)
- **長い**: `✨ feat: add OAuth2 authentication with Google and GitHub` (58文字)
- **限界**: `✨ feat: add comprehensive user authentication system with OAuth` (67文字)

## 🛠 開発・カスタマイズ

この共有設定パッケージをベースに、プロジェクト固有のルールを追加したい場合は、`package.json`でルールをオーバーライドできます：

```json
{
  "commitlint": {
    "extends": ["@acme/commitlint-config"],
    "rules": {
      "header-max-length": [2, "always", 100],
      "type-enum": [
        2,
        "always",
        ["feat", "fix", "docs", "style", "refactor", "test", "chore", "custom-type", "hotfix"]
      ],
      "start-with-gitmoji": [0],
      "subject-case": [2, "always", "lower-case"]
    }
  }
}
```

### 設定例の説明

- **`header-max-length`**: 文字数制限を変更（デフォルト: 72文字）
- **`type-enum`**: カスタムタイプを追加
- **`start-with-gitmoji`**: gitmojiルールを無効化（通常スタイルのみ使用したい場合）
- **`subject-case`**: 件名のケースルールを追加

### 🎨 Gitmojiのカスタマイズ

特定の絵文字のみを許可したい場合：

```javascript
export default {
  extends: ['@acme/commitlint-config'],
  rules: {
    // 許可する絵文字を制限
    'start-with-gitmoji': [
      2,
      'always',
      {
        allowedEmojis: ['✨', '🐛', '📝', '♻️', '🔧'],
      },
    ],
  },
}
```

## 📄 ライセンス

MIT
