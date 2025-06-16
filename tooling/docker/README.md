# Docker 開発環境設定

このディレクトリには、開発環境で使用するDockerコンテナの設定ファイルが含まれています。

## 関連ファイル

- `docker-compose.yml`: PostgreSQLとpgAdminのDocker Compose設定
- `postgres.conf`: PostgreSQL設定ファイル
- `.env`または`.envrc`(プロジェクトルート): Docker Compose用環境変数（プロジェクト名、DB設定など）

## 事前準備

### データディレクトリの確認（必須）

**重要**: Dockerコンテナを起動する前に、必ずデータ永続化用のディレクトリが存在するか確認してください。このディレクトリが存在しない場合、データベースのデータが永続化されず、コンテナを再起動するたびにデータベースがリセットされます。

## 使用方法

### データベースサービスの起動

```bash
# ルートディレクトリから実行
pnpm docker:up

# または直接実行
cd tooling/docker
docker-compose up -d
```

### サービスの停止

```bash
pnpm docker:down
```

### ログの確認

```bash
pnpm docker:logs
```

## コンテナ名

Docker Composeは自動的に以下の命名規則でコンテナを作成します：

- PostgreSQL: `template_postgres_1`
- pgAdmin: `template_pgadmin_1`

プロジェクト名（`template`）は環境変数 `APP_NAME` で設定されています。

### データベース接続情報

- **PostgreSQL**:

  - Host: `localhost`
  - Port: `5432`
  - Database: `template`
  - Username: `postgres`
  - Password: `password`

- **pgAdmin**:
  - URL: http://localhost:5050
  - Email: `admin@template.local`
  - Password: `admin`

### 環境変数の設定

開発環境での使用に合わせて、ルートディレクトリの`.env`または`.envrc`ファイルにて、以下のように設定してください：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/turbo-template"
POSTGRES_URL="postgresql://postgres:password@localhost:5432/turbo-template"
```

## 注意事項

- 本設定は開発環境専用です
- 本番環境では適切なセキュリティ設定を行ってください
- データは`postgres_data`ボリュームに永続化されます
- `postgres_data`ディレクトリは事前に作成しておくことを推奨します
