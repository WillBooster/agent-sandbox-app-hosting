# frontend-app-share

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
  -H "Authorization: Bearer my-secret-key-2024" \
  -F "title=デジタル時計" \
  -F "files=@src/db/seeds/clock/index.html;type=text/html"
```

**カウンターアプリ（複数ファイル）:**

```bash
curl -X POST http://localhost:3536/api/apps \
  -H "Authorization: Bearer my-secret-key-2024" \
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
