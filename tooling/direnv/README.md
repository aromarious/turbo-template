# 環境変数の取り扱いについて

このプロジェクトでは、環境変数を管理するための2つのアプローチを提供しています。

## 方法1: 従来の.envファイル（シンプル）

最もシンプルな方法です：

1. ルートディレクトリの`.env.example`を`.env`にコピー
2. 必要な値を設定
3. `.env`ファイルは自動的にgitignoreされます

```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

## 方法2: direnv（推奨・セキュリティ重視）

**セキュリティ上の利点:**

- 認証情報をOSの安全なストレージに保存
- プロジェクト間での認証情報の分離
- 誤ってコミットするリスクを排除

### セットアップ手順

1. **direnvをインストール**

   ```bash
   # macOS
   brew install direnv

   # Ubuntu/Debian
   sudo apt install direnv

   # その他のインストール方法: https://direnv.net/docs/installation.html
   ```

2. **シェルに統合**

   ```bash
   # bashの場合
   echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

   # zshの場合
   echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc

   # fishの場合
   echo 'direnv hook fish | source' >> ~/.config/fish/config.fish
   ```

3. **.envrcファイルを設定**

   ```bash
   # このディレクトリの.envrcをプロジェクトルートにシンボリックリンク
   ln -s tooling/direnv/.envrc .envrc
   ```

   **注意**: `.envrc`シンボリックリンクはgit管理外です。各開発者が個別に作成します

4. **direnvを許可**
   ```bash
   direnv allow
   ```

## 環境変数の分類と管理方法

### 共有可能な値（.envrcに直接記述）

チーム全体で共通して使用する、秘匿性のない設定値：

```bash
# アプリケーション設定
export APP_NAME="turbo-template"
export NODE_ENV="development"

# データベース接続設定（非秘匿）
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="turbo-template"
export DB_USER="postgres"

# 開発ツール設定
export VITE_PORT="3000"
export API_PORT="3001"
```

### 秘匿情報（OS認証ストアから取得）

パスワード、APIキー、トークンなど、個人または環境固有の機密情報：

```bash
# データベースパスワード
export DB_PASSWORD=$(security find-generic-password -a $USER -s "t3turbo-db" -w 2>/dev/null || echo "")

# 本番データベースURL
export POSTGRES_URL=$(security find-generic-password -a $USER -s "t3turbo-postgres-url" -w 2>/dev/null || echo "")

# 外部サービスAPIキー
export OPENAI_API_KEY=$(security find-generic-password -a $USER -s "t3turbo-openai" -w 2>/dev/null || echo "")
export STRIPE_SECRET_KEY=$(security find-generic-password -a $USER -s "t3turbo-stripe" -w 2>/dev/null || echo "")
```

## データベース設定

このプロジェクトでは2つのデータベース設定オプションを提供：

### オプション1: ローカルPostgreSQL（Docker）- 開発推奨

```bash
# 必要な環境変数（共有設定）
APP_NAME=turbo-template
DB_HOST=localhost
DB_PORT=5432
DB_NAME=turbo-template
DB_USER=postgres
# DB_PASSWORD=（認証ストアから取得）

# データベース起動
pnpm docker:up
```

### オプション2: 外部PostgreSQL（Supabase等）

```bash
# 本番環境用（認証ストアから取得）
POSTGRES_URL="postgres://postgres.[USERNAME]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

## OS別セキュア認証情報管理

### macOS - Keychain使用

```bash
# Keychainに保存
security add-generic-password -a $USER -s "t3turbo-db" -w "your-password"
security add-generic-password -a $USER -s "t3turbo-openai" -w "sk-your-openai-key"

# .envrcで取得（エラーハンドリング付き）
export DB_PASSWORD=$(security find-generic-password -a $USER -s "t3turbo-db" -w 2>/dev/null || echo "")
export OPENAI_API_KEY=$(security find-generic-password -a $USER -s "t3turbo-openai" -w 2>/dev/null || echo "")
```

### Linux - pass使用

```bash
# GPGキーでパスワード管理
pass insert t3turbo/db-password
pass insert t3turbo/openai-key

# .envrcで取得
export DB_PASSWORD=$(pass show t3turbo/db-password 2>/dev/null || echo "")
export OPENAI_API_KEY=$(pass show t3turbo/openai-key 2>/dev/null || echo "")
```

### Windows - Windows Credential Manager

```powershell
# PowerShellで保存
cmdkey /add:t3turbo-db /user:postgres /pass:your-password
cmdkey /add:t3turbo-openai /user:api /pass:sk-your-openai-key

# .envrcで取得（WSL使用時）
export DB_PASSWORD=$(powershell.exe -Command "(cmdkey /list:t3turbo-db | Select-String 'Password:').Line.Split(' ')[-1]" 2>/dev/null || echo "")
```

## チーム開発のベストプラクティス

### .envrcファイルの構成例

```bash
#!/usr/bin/env bash

# === 共有設定（チーム全体で同じ値） ===
export APP_NAME="turbo-template"
export NODE_ENV="development"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="turbo-template"
export DB_USER="postgres"

# === 個人設定（各自のOS認証ストアから取得） ===
# データベースパスワード
if command -v security >/dev/null 2>&1; then
    # macOS Keychain
    export DB_PASSWORD=$(security find-generic-password -a $USER -s "t3turbo-db" -w 2>/dev/null || echo "")
elif command -v pass >/dev/null 2>&1; then
    # Linux pass
    export DB_PASSWORD=$(pass show t3turbo/db-password 2>/dev/null || echo "")
fi

# APIキー類
export OPENAI_API_KEY=$(get_credential "openai-key")
export STRIPE_SECRET_KEY=$(get_credential "stripe-key")

# === ヘルパー関数 ===
get_credential() {
    local key=$1
    if command -v security >/dev/null 2>&1; then
        security find-generic-password -a $USER -s "t3turbo-$key" -w 2>/dev/null || echo ""
    elif command -v pass >/dev/null 2>&1; then
        pass show "t3turbo/$key" 2>/dev/null || echo ""
    else
        echo ""
    fi
}
```

### 推奨設定手順

1. **チームメンバー全員が同じ.envrcを使用**
2. **各自が必要な認証情報をOSの認証ストアに保存**
   ```bash
   # macOS例
   security add-generic-password -a $USER -s "t3turbo-db" -w "your-db-password"
   security add-generic-password -a $USER -s "t3turbo-openai" -w "your-openai-key"
   ```
3. **認証情報が設定されていない場合は空文字列が設定されるため注意（エラーなし）**

## トラブルシューティング

- **direnv: error .envrc is blocked**: `direnv allow`を実行
- **環境変数が読み込まれない**: シェルを再起動するか`direnv reload`を実行
- **認証情報が見つからない**: OSの認証情報管理ツールが正しく設定されているか確認
- **空の環境変数**: 認証ストアに該当するキーが存在しない場合、空文字列が設定されます

## 推奨事項

- **開発環境**: direnv + ローカルDocker PostgreSQL + OS認証ストア
- **本番環境**: インフラプロバイダーのダッシュボード（Vercel、Railway、AWS等）で環境変数を設定
- **チーム開発**: 共有設定は.envrcに直接記述、秘匿情報は各自のOS認証ストアで管理
- **CI/CD**: 秘匿情報はCI/CDプラットフォームのシークレット機能を使用
