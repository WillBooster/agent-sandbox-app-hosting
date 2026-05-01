# agent-sandbox-app-hosting

生徒が制作したクライアントサイドウェブアプリを教室内で共有するためのサービス。

## セットアップ

```bash
bun install
mise run db:migrate
```

## 開発

```bash
mise run dev
```

## アプリのアップロード

シードデータのファイルを使って動作確認できます。

**デジタル時計（単一ファイル）:**

```bash
curl -X POST http://localhost:3536/api/apps \
  -F "title=デジタル時計" \
  -F "files=@src/db/seeds/clock/index.html;type=text/html"
```

**カウンターアプリ（複数ファイル）:**

```bash
curl -X POST http://localhost:3536/api/apps \
  -F "title=カウンターアプリ" \
  -F "description=ボタンをクリックするとカウントが増減するシンプルなアプリです。" \
  -F "files=@src/db/seeds/counter/index.html;type=text/html" \
  -F "files=@src/db/seeds/counter/style.css;type=text/css;filename=style.css" \
  -F "files=@src/db/seeds/counter/app.js;type=application/javascript;filename=app.js"
```

## テスト

```bash
mise run test
```

## Docker

```bash
# テスト用コンテナでテスト実行
mise run test-docker

# 開発用コンテナ起動
mise run start-docker
```

## Railway デプロイ

`main` ブランチに push すると GitHub Actions から Railway の production 環境へ自動デプロイされます。

事前に GitHub Secrets に `RAILWAY_API_TOKEN` を設定してください。

また、実運用に必要な値は `.env.production` に設定してください。`bun run deploy:setup` が Railway 側の Variables に反映します。

- 必要に応じて `NEXT_PUBLIC_BASE_URL`

production では Railway Volume を `/data` にマウントし、`DATABASE_URL=file:/data/production.sqlite3` を使います。

手動デプロイは以下で実行できます。

```bash
WB_ENV=production \
RAILWAY_PROJECT_ID=62daa32f-e11c-4b7b-8a2d-3bd7a07e10a7 \
RAILWAY_SERVICE_ID=6740702a-6657-4686-b8ab-2caca3b5b133 \
bun run deploy
```

## 受講者向け Claude Code スキル

`skills/agent-sandbox-app-hosting/` に、受講者が Claude Code からアプリをアップロードできるスキルを同梱しています。

### セットアップ

受講者のプロジェクトルートで以下を実行してスキルをインストールします。

```bash
cp -r <このリポジトリのパス>/skills/agent-sandbox-app-hosting .claude/skills/agent-sandbox-app-hosting
```

次に、環境変数を設定します。

```bash
export AGENT_SANDBOX_APP_HOSTING_URL="https://<サーバーURL>"
```

### 使い方

Claude Code で `/agent-sandbox-app-hosting` と入力すると、アプリのディレクトリを指定してアップロードできます。

```
/agent-sandbox-app-hosting ./my-app をアップロードして
```

## コマンド一覧

| コマンド | 説明 |
|----------|------|
| `mise run dev` | 開発サーバー起動 |
| `mise run build` | プロダクションビルド |
| `mise run test` | Playwright テスト実行 |
| `mise run test-docker` | Docker コンテナでテスト実行 |
| `mise run db:migrate` | DB マイグレーション実行 |
| `mise run db:generate` | マイグレーションファイル生成 |
| `mise run db:reset` | DB リセット |
| `mise run format` | Biome フォーマット |
| `mise run typecheck` | TypeScript 型チェック |
