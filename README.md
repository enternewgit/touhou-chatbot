# 東方チャットボット

東方ProjectのキャラとチャットできるWebアプリケーションです。
今はまだ博麗霊夢としかおしゃべりできません。
## 機能

- 博麗霊夢の性格を再現したAIチャットボット
- リアルタイムチャット機能
- レスポンシブデザイン

## 技術スタック

### バックエンド
- Python 3.10+
- Flask
- Google Gemini AI API
- Poetry (依存関係管理)

### フロントエンド
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4

## セットアップ

### 前提条件
- Node.js 18+
- Python 3.10+
- Poetry
- Google AI Studio APIキー

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. バックエンドのセットアップ
```bash
cd backend
poetry install
```

3. 環境変数の設定
```bash
# backend/.env ファイルを作成
GEMINI_API_KEY=your_gemini_api_key_here
```

4. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
```

### 実行

1. バックエンドサーバーを起動
```bash
cd backend
poetry run python app.py
```

2. フロントエンドサーバーを起動（別ターミナル）
```bash
cd frontend
npm run dev
```

3. ブラウザで http://localhost:3000 を開く

## ライセンス

MIT License

## 注意事項

- `.env`ファイルにAPIキーが含まれているため、Gitにコミットしないよう注意してください
- APIキーは適切に管理し、公開しないでください
