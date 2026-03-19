# agent-sandbox-app-hosting 仕様書

生徒が制作したクライアントサイドウェブアプリを教室内で共有するためのサービス。

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript (strict mode) |
| ランタイム / パッケージマネージャ | Bun |
| データベース | SQLite (LibSQL) |
| ORM | Drizzle ORM |
| API | Hono (Next.js Route Handler 上で動作) |
| バリデーション | Zod |
| UIフレームワーク | Tailwind CSS |
| アイコン | Lucide React |
| コード品質 | Biome |
| タスクランナー | Mise |
| ID生成 | UUID v7 |

---

## データベース設計

### `app` テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | `text` (PK) | UUID v7 |
| `title` | `text` (NOT NULL) | アプリのタイトル |
| `description` | `text` (NOT NULL, default `""`) | アプリの説明文 |
| `created_at` | `integer` (NOT NULL) | 作成日時 (Unix ms) |

### `app_file` テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | `text` (PK) | UUID v7 |
| `app_id` | `text` (NOT NULL, FK → `app.id`) | 所属アプリ |
| `path` | `text` (NOT NULL) | ファイルパス (例: `index.html`, `css/style.css`) |
| `content` | `blob` (NOT NULL) | ファイルの内容 (バイナリ) |
| `mime_type` | `text` (NOT NULL) | MIMEタイプ (例: `text/html`, `image/png`) |
| `created_at` | `integer` (NOT NULL) | 作成日時 (Unix ms) |

- `app_file` には `(app_id, path)` のユニーク制約を付与する。

---

## 認証

- 認証は行わない。ユーザーアカウントは存在しない。
- 一覧画面・アップロードAPI・アプリ配信画面はすべて認証不要。

---

## API設計

Hono を Next.js の Route Handler (`/api/[...path]`) 上にマウントして RESTful API を提供する。

レスポンスはすべて `application/json` 形式。エラー時は以下の形式で返す:

```json
{ "error": "エラーメッセージ" }
```

---

### `POST /api/apps`

アプリを新規アップロード（デプロイ）する。

**認証:** 不要

**Content-Type:** `multipart/form-data`

**フォームフィールド:**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | text | Yes | アプリのタイトル (1〜100文字) |
| `description` | text | No | アプリの説明 (最大500文字、省略時は空文字) |
| `files` | file (複数) | Yes | アプリのファイル群。各ファイルのフィールド名にファイルパスを反映する（後述） |

**ファイルの指定方法:**

`files` フィールドに複数のファイルを指定する。各ファイルのパス情報は、curl の `-F` オプションの `filename` パラメータで指定する。サーバーはアップロードされたファイルの `filename` をアプリ内のパスとして使用する。MIMEタイプは各ファイルの `Content-Type` から取得する。

**curl の使用例:**

```bash
curl -X POST https://<host>/api/apps \
  -F "title=My App" \
  -F "description=A cool app" \
  -F "files=@index.html;type=text/html" \
  -F "files=@css/style.css;type=text/css;filename=css/style.css" \
  -F "files=@js/app.js;type=application/javascript;filename=js/app.js" \
  -F "files=@images/logo.png;type=image/png;filename=images/logo.png"
```

> **注:** ファイルパスにディレクトリが含まれない場合（例: `index.html`）、curl は自動的にファイル名をそのまま `filename` に設定するため、明示的な `filename=` 指定は不要。サブディレクトリ内のファイルは `filename=` で相対パスを明示する。

**バリデーション:**

- `title` は1文字以上100文字以下。
- `files` は1つ以上必須。
- `files` の中に `filename` が `index.html` のファイルが含まれていなければエラー。
- 各ファイルの `filename` は空でないこと。先頭の `/` は許可しない。
- ファイル合計サイズが 50MB を超える場合はエラー。

**レスポンス:** `201 Created`

```json
{
  "id": "01912345-6789-7abc-def0-123456789abc",
  "url": "https://<host>/apps/01912345-6789-7abc-def0-123456789abc"
}
```

---

### `GET /api/apps/:appId/files/*`

アプリのファイルを配信する。

**認証:** 不要

**処理:**

- パスの `*` 部分をファイルパスとして解釈する。パスが空（`/api/apps/:appId/files/` または `/api/apps/:appId/files`）の場合は `index.html` を返す。
- DB から該当する `app_file` を取得し、`content` をレスポンスボディに、`mime_type` を `Content-Type` ヘッダーにセットして返す。
- 該当ファイルが存在しない場合は `404` を返す。
- キャッシュヘッダー `Cache-Control: public, max-age=3600` を付与する。

---

## 画面設計

### ホーム画面 (`/`)

- アップロード済みアプリの一覧をカード形式で表示する。
- 各カードには以下を表示する:
  - タイトル
  - 説明文（長い場合は省略表示）
  - アップロード日時
- カードをクリックするとアプリ画面に遷移する。
- アプリが0件の場合は「まだアプリがありません」と表示する。
- Server Component として実装し、アクセスのたびにDBから最新データを取得する。

### アプリ画面 (`/apps/[appId]`)

- 該当アプリの `index.html` を `<iframe>` で全画面表示する。
- 画面上部に薄いヘッダーバーを設ける:
  - アプリのタイトルを表示
  - ホームに戻るリンク
- `iframe` の `src` は `/api/apps/<appId>/files/` を指す。
- 存在しない `appId` の場合は 404 ページを表示する。

---

## 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | SQLiteデータベースのパス | `file:./drizzle/mount/dev.sqlite3` |

---

## プロジェクト構成

```
src/
├── app/
│   ├── page.tsx                         # ホーム画面
│   ├── layout.tsx                       # ルートレイアウト
│   ├── globals.css                      # グローバルスタイル (Tailwind)
│   ├── apps/
│   │   └── [appId]/
│   │       └── page.tsx                 # アプリ画面 (iframe表示)
│   └── api/
│       └── [...path]/
│           └── route.ts                 # Hono アプリをマウント
├── server/
│   ├── app.ts                           # Hono アプリ定義・ルート集約
│   ├── routes/
│   │   ├── apps.ts                      # POST /api/apps エンドポイント
│   │   └── appFiles.ts                  # /api/apps/:appId/files/* 配信
├── lib/
│   └── db.ts                            # Drizzle クライアント初期化
└── db/
    └── schema.ts                        # Drizzle スキーマ定義

drizzle/
├── mount/                               # SQLite ファイル配置先
└── [マイグレーションファイル群]
```

---

## セットアップ・開発コマンド

Mise でタスクを管理する。

| コマンド | 説明 |
|----------|------|
| `bun install` | 依存パッケージのインストール |
| `mise run dev` | 開発サーバー起動 |
| `mise run build` | プロダクションビルド |
| `mise run db:migrate` | DBマイグレーション実行 |
| `mise run db:generate` | マイグレーションファイル生成 |

---

## 動作の流れ

### アップロードの流れ

1. 生徒がアプリのファイル群を用意する（HTML, CSS, JS, 画像等）。
2. curl の `-F` オプションでファイルを指定し、`POST /api/apps` にリクエストを送る。
3. サーバーがファイルをDBに保存し、アプリIDとURLをJSONで返す。
4. 生徒は返却されたURLをブラウザで開いて動作確認できる。

### 閲覧の流れ

1. ユーザーがホーム画面 (`/`) にアクセスする。
2. アプリ一覧がカード形式で表示される。
3. カードをクリックするとアプリ画面 (`/apps/<appId>`) に遷移する。
4. `<iframe>` 内でアプリの `index.html` が読み込まれ、アプリが動作する。
5. アプリ内の相対パス参照（CSS, JS, 画像等）は `/api/apps/<appId>/files/...` 経由で解決される。

---

## その他の仕様

- MIMEタイプはアップロード時の各ファイルの `Content-Type` から取得するため、サーバー側での推定は不要。
- `<iframe>` には `sandbox="allow-scripts allow-same-origin"` を設定し、最低限の権限で動作させる。
- UUID v7 の生成には適切なライブラリ（例: `uuidv7`）を使用する。
