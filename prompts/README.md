# スマートプロンプト管理システム

現在の Markdown ベースのプロンプト管理をより効率的で保守性の高いシステムに改善するためのソリューション群です。

## 🚀 改善されたプロンプト管理システムの特徴

### 1. **TypeScript 型安全性**

- [`schema-types.ts`](schema-types.ts) - 全てのブロック定義に型安全性を提供
- コンパイル時のエラー検出
- IDE の自動補完と IntelliSense サポート

### 2. **JSON Schema + 自動生成**

- [`block-schemas.json`](block-schemas.json) - 構造化されたスキーマ定義
- [`schema-generator.ts`](schema-generator.ts) - プロンプトの自動生成とバリデーション
- スキーマから Markdown ドキュメントの自動生成

### 3. **柔軟なテンプレートシステム**

- [`template-system.ts`](template-system.ts) - Handlebars 風のテンプレート処理
- [`templates/`](templates/) - 再利用可能なプロンプトテンプレート
- 条件分岐とループ処理のサポート

### 4. **統合管理システム**

- [`prompt-manager.ts`](prompt-manager.ts) - 全機能を統合したプロンプト管理
- キャッシュ機能による高速化
- 動的設定変更とバリデーション

## 📁 ファイル構造

```
prompts/
├── README.md                    # このファイル
├── PROMPT_SCHEMA.md            # 従来のスキーマ（レガシー）
├── schema-types.ts             # TypeScript型定義
├── block-schemas.json          # JSON Schema定義
├── schema-generator.ts         # 自動プロンプト生成
├── template-system.ts          # テンプレートエンジン
├── prompt-config.ts            # 基本設定
├── prompt-manager.ts           # 統合管理システム
└── templates/                  # テンプレートファイル
    ├── base-system.hbs
    └── content-generation.hbs
```

## 🔧 使用方法

### 基本的な使用

```typescript
import { promptManager } from "./prompts/prompt-manager";

// プロンプト生成
const prompt = await promptManager.generatePrompt(
  "AIスタートアップのランディングページを作成して"
);

// 設定変更
promptManager.updateConfig({
  useAutoGeneration: true,
  templateEngine: "handlebars",
  cachePrompts: true,
});
```

### API Route での利用

改善された API 実装: [`app/api/generate/route-improved.ts`](../app/api/generate/route-improved.ts)

```typescript
// 従来の方法（route.ts）
const fullPromptContext = readFile + template;

// 改善された方法（route-improved.ts）
const fullPromptContext = await promptManager.generatePrompt(userRequest);
```

## ⚡ パフォーマンス改善

| 機能           | 従来                 | 改善後                  |
| -------------- | -------------------- | ----------------------- |
| プロンプト生成 | ファイル読み込み毎回 | キャッシュ + 自動生成   |
| 型安全性       | なし                 | TypeScript 完全サポート |
| バリデーション | 手動                 | 自動スキーマ検証        |
| テンプレート   | 静的文字列           | 動的テンプレート        |

## 🎯 導入の選択肢

### レベル 1: 基本改善

既存コードを最小限変更して型安全性を追加

```typescript
import { promptManager } from "./prompts/prompt-manager";
// 既存のroute.tsを段階的に置き換え
```

### レベル 2: 中級改善

JSON Schema とテンプレートシステムをフル VATIVA

```typescript
// 自動生成とテンプレートを活用
promptManager.updateConfig({ useAutoGeneration: true });
```

### レベル 3: 完全移行

新しい API 実装への完全切り替え

```typescript
// route-improved.tsに置き換え
// 統合管理システムのフル活用
```

## 🔄 マイグレーション手順

1. **段階 1**: 型定義と PromptManager を導入
2. **段階 2**: 既存の route.ts で新しいシステムを使用
3. **段階 3**: route-improved.ts に完全移行
4. **段階 4**: レガシーファイル（PROMPT_SCHEMA.md）の廃止検討

## 💡 今すぐ試すには

```bash
# 新しいAPIエンドポイントで設定確認
GET /api/generate

# キャッシュクリア
DELETE /api/generate

# 改善されたプロンプト生成を使用
POST /api/generate
{
  "prompt": "テストプロンプト",
  "config": { "useAutoGeneration": true }
}
```

## 🛠️ カスタマイズ

### 新しいテンプレートの追加

```handlebars
<!-- templates/custom-template.hbs -->
## カスタム指示:
{{customInstruction}}

{{#if includeExamples}}
  参考例:
  {{examples}}
{{/if}}
```

### 新しいブロックタイプの追加

```json
// block-schemas.jsonに追加
"newBlock": {
  "type": "object",
  "properties": {
    "_template": { "const": "newBlock" },
    "customField": { "type": "string" }
  }
}
```

これらの改善により、プロンプト管理がより**保守性が高く**、**型安全**で、**拡張可能**になります。
