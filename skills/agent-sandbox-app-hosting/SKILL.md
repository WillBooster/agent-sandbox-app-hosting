---
name: agent-sandbox-app-hosting
description: 受講者が制作したウェブアプリを agent-sandbox-app-hosting にアップロードする。アプリのデプロイ、アップロード、共有などを頼まれたときに使用する。
disable-model-invocation: true
allowed-tools: Bash(curl *), Glob, Read
---

# agent-sandbox-app-hosting アップロードスキル

受講者に代わって、制作したウェブアプリを agent-sandbox-app-hosting サーバーにアップロードしてください。

---

## 手順

### 1. 環境変数の確認

以下の環境変数が設定されている必要があります。未設定の場合は受講者に講師へ確認するよう伝えてください。

| 環境変数 | 説明 |
|----------|------|
| `AGENT_SANDBOX_APP_HOSTING_URL` | サーバーの URL（例: `https://example.com`） |

### 2. アップロード対象ファイルの収集

受講者にアプリのディレクトリを指定してもらい、Glob と Read でファイルを確認してください。

**バリデーション（アップロード前に必ず確認）:**

- `index.html` が存在すること（必須）
- ファイルの合計サイズが 50MB 以下であること
- タイトルが 1〜100 文字であること

### 3. curl コマンドの組み立てと実行

収集したファイルをもとに `curl` コマンドを組み立てて実行してください。

**MIME タイプの対応表:**

| 拡張子 | type |
|--------|------|
| `.html` | `text/html` |
| `.css` | `text/css` |
| `.js` | `application/javascript` |
| `.json` | `application/json` |
| `.png` | `image/png` |
| `.jpg` / `.jpeg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.svg` | `image/svg+xml` |
| `.ico` | `image/x-icon` |
| `.mp3` | `audio/mpeg` |
| `.wav` | `audio/wav` |
| `.mp4` | `video/mp4` |
| `.woff2` | `font/woff2` |
| その他 | `application/octet-stream` |

**curl コマンドの形式:**

```bash
curl -X POST "${AGENT_SANDBOX_APP_HOSTING_URL}/api/apps" \
  -F "title=<タイトル>" \
  -F "description=<説明（任意）>" \
  -F "files=@<ファイルパス>;type=<MIMEタイプ>" \
  -F "files=@<ファイルパス>;type=<MIMEタイプ>;filename=<アプリ内パス>"
```

**ファイル指定のルール:**

- ルート直下のファイル（例: `index.html`）: `filename=` の指定は不要
- サブディレクトリ内のファイル（例: `css/style.css`）: `filename=css/style.css` のように相対パスを指定

### 4. 結果の報告

アップロードが成功すると以下の JSON が返ります。

```json
{
  "id": "...",
  "url": "https://<サーバー>/apps/..."
}
```

受講者に `url` の値を伝えて、ブラウザで開いて動作確認するよう案内してください。

---

## エラー時の対処

| エラーメッセージ | 原因 | 対処法 |
|-----------------|------|--------|
| `index.html is required` | index.html が含まれていない | ファイル名を確認し、存在しなければ受講者に作成を依頼 |
| `title must be between 1 and 100 characters` | タイトルが未指定または長すぎ | 受講者にタイトルを確認 |
| `Total file size exceeds 50MB limit` | ファイルが大きすぎる | 画像の圧縮や不要ファイルの除外を提案 |
