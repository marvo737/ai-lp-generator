# AI LP Generator

Google Gemini API を搭載した AI ランディングページジェネレーターのモックアプリケーション。  
ローカル環境でウェブサイトのコンテンツを視覚的に編集し、AI を活用してランディングページのコンテンツを生成することができます。

コンテンツはローカルファイルシステム上の Markdown および JSON ファイルを介して管理され、ローカル GraphQL API を介してクエリされます。

### 主な機能

- ローカルファイルシステムベースのコンテンツ管理
- Google Gemini API を使用した**AI コンテンツ生成**で、ページコンテンツとコンポーネント構造を作成
- TinaCMSのVisual Editingでサイトをローカルで視覚的に編集
- ローカル GraphQL サーバーを使用したファイルシステムからの開発ワークフロー
- フレームワークにはNext.jsを採用

## ローカル開発

プロジェクトの依存関係をインストールします。

```
npm install
```

### 環境変数

プロジェクトを実行する前に、環境変数を設定する必要があります。`.env.example`ファイルを`.env`という名前の新しいファイルにコピーします。

```
cp .env.example .env
```

次に、`.env`ファイルに必要な値を入力します。

```
# Google Gemini API用（必須）
GEMINI_API_KEY=あなたのGoogle Gemini APIキー
GEMINI_MODEL_NAME="gemini-2.5-pro"
GEMINI_MAX_OUTPUT_TOKENS=24576
GEMINI_TEMPERATURE=0.3
```

### プロジェクトの実行

プロジェクトをローカルで実行します。

```
npm run dev
```

### ローカル URL

サーバーを起動させたら以下にアクセスしてエディタから操作してください。

- http://localhost:3000/ai-editor

編集対象の LP そのものにアクセスしたい場合は以下にアクセス。

-  http://localhost:3000

## プロジェクト構造

```
├── app/                    # Next.js App Router
├── components/             # React コンポーネント
├── content/               # Markdown コンテンツファイル
├── tina/                  # TinaCMS 設定
├── prompts/               # AIプロンプトテンプレート
└── public/                # 静的ファイル
```
