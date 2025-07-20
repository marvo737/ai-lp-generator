# Geminiによる動的コンテンツ生成・編集システム概要

本ドキュメントは、GeminiがAPIを介してNext.js/TinaCMS製のランディングページのコンテンツブロックを動的に生成・編集するために実装された機能の概要をまとめたものです。

## 1. 目的

外部のAI（Gemini）が、APIコールを通じて以下の操作を行えるようにすることを目的とします。

-   既存のコンテンツブロックの並べ替え・内容の編集
-   新しいコンテンツブロック（コンポーネントとスキーマ）の動的な生成とページへの追加

これにより、人間を介さずに、AIの判断でLPの構成や内容を柔軟に変更できるシステムを構築します。

## 2. 実装したAPI

### 2.1. ページコンテンツ操作API

ページのfrontmatter（ブロック配列を含む）を操作するためのAPIです。

-   **`GET /api/pages/[filename]`**
    -   **機能**: 指定されたページ（例: `home`）のMDXファイルからfrontmatterを抽出し、JSON形式で返します。
    -   **使用例**: `curl http://localhost:3000/api/pages/home`

-   **`PUT /api/pages/[filename]`**
    -   **機能**: リクエストボディで受け取ったJSONデータで、指定されたページのfrontmatterを上書きします。
    -   **使用例**: `Invoke-RestMethod -Uri http://localhost:3000/api/pages/home -Method Put -InFile payload.json -ContentType 'application/json'`

### 2.2. 動的ブロック生成API

新しいブロックのコンポーネントとTinaCMSスキーマを一体化した`.tsx`ファイルを生成します。

-   **`POST /api/generate/component`**
    -   **機能**: リクエストボディで受け取った定義（ブロック名、ラベル、フィールド）に基づき、`components/blocks/` ディレクトリ以下に新しいブロックの`.tsx`ファイルを生成します。
    -   **リクエストボディ (例)**:
        ```json
        {
          "blockName": "profile",
          "blockLabel": "Profile",
          "fields": [
            { "type": "string", "name": "name", "label": "Name" },
            { "type": "string", "name": "bio", "label": "Biography" }
          ]
        }
        ```

## 3. 新規ブロック追加の利用フロー

1.  **ブロック生成**: `POST /api/generate/component` を呼び出し、新しいブロックのファイル (`.tsx`) を生成します。
2.  **コンポーネント登録 (手動)**: `components/blocks/index.tsx` を編集し、生成されたコンポーネントを動的インポートのリストに追加します。
3.  **スキーマ登録 (手動)**: `tina/collection/page.ts` を編集し、生成されたブロックスキーマをインポートして `templates` 配列に追加します。
4.  **ページ構成取得**: `GET /api/pages/home` を呼び出し、現在のページ構成（frontmatter）を取得します。
5.  **構成データ編集**: 取得したJSONデータ内の `blocks` 配列に、ステップ1で生成した新しいブロックのデータを追加します。
6.  **ページ更新**: `PUT /api/pages/home` を呼び出し、編集したJSONデータを送信してページを更新します。

## 4. 今後の課題

-   **統合プロセスの自動化**: 現在手動で行っている上記フローのステップ2と3（コンポーネントとスキーマの登録）を自動化すること。`fs`モジュールを使って該当ファイルを読み書きするAPIを開発するなどのアプローチが考えられます。
