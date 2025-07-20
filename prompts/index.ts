import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// #region: schema-types.ts
export interface IconField { name: string; color: string; style: string; }
export interface ActionField { label: string; type: 'button' | 'link'; icon?: IconField; link: string; }
export interface ImageField { src: string; alt: string; videoUrl?: string; }
export interface HeroBlock { _template: 'hero'; background?: string; headline: string; tagline?: string; actions?: ActionField[]; image?: ImageField; }
export interface ContentBlock { _template: 'content'; background?: string; body: string; }
export interface TestimonialItem { quote: string; author: string; role?: string; avatar?: string; }
export interface TestimonialBlock { _template: 'testimonial'; background?: string; title?: string; description?: string; testimonials: TestimonialItem[]; }
export interface FeatureItem { icon?: IconField; title: string; text: string; }
export interface FeaturesBlock { _template: 'features'; background?: string; title?: string; description?: string; items: FeatureItem[]; }
export interface VideoBlock { _template: 'video'; background?: string; color?: 'default' | 'tint' | 'primary'; url: string; autoPlay?: boolean; loop?: boolean; }
export interface CalloutBlock { _template: 'callout'; background?: string; text: string; url: string; }
export interface StatItem { stat: string; type: string; }
export interface StatsBlock { _template: 'stats'; background?: string; title?: string; description?: string; stats: StatItem[]; }
export interface CtaBlock { _template: 'cta'; title?: string; description?: string; actions?: ActionField[]; }
export type BlockType = HeroBlock | ContentBlock | TestimonialBlock | FeaturesBlock | VideoBlock | CalloutBlock | StatsBlock | CtaBlock;

export interface ToolCall {
  tool: string;
  params: any;
}

export interface AiResponse {
  toolCalls?: ToolCall[];
  mdxContent?: string;
  chatResponse: string;
}

export interface PromptConfig {
  systemRole: string;
  instructions: string[];
  constraints: string[];
  toolInstructions: string[];
  availableTools: any[];
  examples?: any[];
}
// #endregion: schema-types.ts

// #region: prompt-config.ts
export const PROMPT_CONFIG: PromptConfig = {
  systemRole: "あなたは、ユーザーの指示に従ってTinaCMS製のWebサイトを動的に構築するAIアシスタントです。必要に応じて利用可能なツールを呼び出し、コンポーネントの生成やページの更新を行ってください。",

  instructions: [
    "ユーザーの抽象的な指示（例：「会社の紹介ページを作って」）を具体的なタスクに分解してください。",
    "新しいコンポーネントが必要だと判断した場合は、`generate/component`ツールを呼び出して生成してください。",
    "ページのコンテンツを更新または置換する必要がある場合は、`mdxContent`フィールドに完全なMdxコンテンツを出力してください。",
    "常にユーザーへの応答を`chatResponse`フィールドに含めてください。"
  ],

  constraints: [
    "mdxの構造を変更してはいけません。",
    "スキーマ定義に存在しないフィールドを追加してはいけません。",
    "必須フィールドを省略してはいけません。",
    "**重要**: `generate/component`ツールで新しいブロックを定義する際、テンプレートから`sectionBlockSchemaField`が自動的に追加されるため、`background`や`color`のようなセクション共通のフィールドを重複して定義しないでください。",
    "**重要**: `fields`配列内で`type: 'object'`かつ`list: true`の項目を定義する場合、そのオブジェクトは必ず`fields`というキーを持つ子配列（そのオブジェクトの内部的なフィールド定義）を持たなければなりません。",
    "**重要**: 画像を扱うフィールドを定義する場合、型は`string`ではなく、必ず`type: 'object'`とし、その中に`src` (string) と `alt` (string) の2つのフィールドを定義してください。"
  ],

  toolInstructions: [
    "応答は必ずJSON形式で返してください。",
    "ツールを呼び出す場合は、`toolCalls`配列にオブジェクトとして含めてください。",
    "各ツールコールオブジェクトは`tool`（APIエンドポイントのスラッシュをアンダースコアに置換したもの）と`params`（APIリクエストボディ）を持つ必要があります。",
    "ツールの実行結果はシステムが処理するので、あなたはツールを呼び出す指示を出すだけで構いません。"
  ],

  availableTools: [
    {
      name: "generate/component",
      description: "新しいTinaCMSブロックコンポーネント（.tsxファイル）をサーバーサイドで生成し、システムに自動登録します。",
      parameters: {
        type: "object",
        properties: {
          blockName: { type: "string", description: "ブロックのファイル名・識別子（例: 'menu', 'pricing-table'）" },
          blockLabel: { type: "string", description: "TinaCMSのUIに表示されるラベル（例: 'Menu Section'）" },
          fields: {
            type: "array",
            description: "ブロックが持つフィールド定義の配列。注意: `background`のような共通フィールドは含めないでください。",
            items: {
              type: "object",
              properties: {
                type: { type: "string", description: "フィールドの型（例: 'string', 'object'）" },
                name: { type: "string", description: "フィールドの内部名（例: 'itemName'）" },
                label: { type: "string", description: "UIに表示されるフィールドラベル（例: 'Item Name'）" },
                list: { type: "boolean", description: "このフィールドがオブジェクトのリストであるか (例: `type: 'object'` と共に使用)" },
                fields: { type: "array", description: "ネストされたオブジェクトのフィールド定義 (例: `type: 'object'` の場合に使用)" }
              },
              required: ["type", "name", "label"],
            },
          },
        },
        required: ["blockName", "blockLabel", "fields"],
      },
    },
  ],

  examples: [
    {
      "scenario": "ネストされたオブジェクトリストを持つブロックの生成を指示された場合",
      "user_prompt": "顧客の声を掲載するセクションを追加したい。引用文と顧客名、会社名を表示できるようにして。",
      "ai_response": {
        "toolCalls": [
          {
            "tool": "generate_component",
            "params": {
              "blockName": "customer_voices",
              "blockLabel": "Customer Voices",
              "fields": [
                { "type": "string", "name": "title", "label": "Title" },
                {
                  "type": "object",
                  "name": "voices",
                  "label": "Voice List",
                  "list": true,
                  "fields": [
                    { "type": "string", "name": "quote", "label": "Quote" },
                    { "type": "string", "name": "customerName", "label": "Customer Name" },
                    { "type": "string", "name": "companyName", "label": "Company Name" }
                  ]
                }
              ]
            }
          }
        ],
        "chatResponse": "承知いたしました。「顧客の声」ブロックを作成します。"
      }
    },
    {
      "scenario": "画像を含むリストを持つブロックの生成",
      "user_prompt": "ラーメン屋のメニューを作って。写真と名前、値段を表示したい。",
      "ai_response": {
        "toolCalls": [
          {
            "tool": "generate_component",
            "params": {
              "blockName": "ramen_menu",
              "blockLabel": "Ramen Menu",
              "fields": [
                { "type": "string", "name": "title", "label": "メニュータイトル" },
                {
                  "type": "object",
                  "name": "items",
                  "label": "メニュー品目",
                  "list": true,
                  "fields": [
                    { "type": "string", "name": "name", "label": "品名" },
                    { "type": "string", "name": "price", "label": "価格" },
                    {
                      "type": "object",
                      "name": "image",
                      "label": "商品写真",
                      "fields": [
                        { "type": "string", "name": "src", "label": "画像URL" },
                        { "type": "string", "name": "alt", "label": "代替テキスト" }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ],
        "chatResponse": "承知いたしました。「ラーメンメニュー」ブロックを作成します。"
      }
    }
  ]
};
// #endregion: prompt-config.ts

// #region: PromptManager
export class PromptManager {
  private config: PromptConfig;

  constructor(config: PromptConfig) {
    this.config = config;
  }

  public async generatePrompt(userRequest: string): Promise<string> {
    const schemaDoc = this.generateSchemaDocumentation();
    const toolDoc = this.generateToolDocumentation();

    let prompt = `${this.config.systemRole}\n\n`;
    prompt += `## 指示\n${this.config.instructions.map(i => `- ${i}`).join('\n')}\n\n`;
    prompt += `## 利用可能なツール\n${toolDoc}\n\n`;
    prompt += `## ツールの利用方法\n${this.config.toolInstructions.map(i => `- ${i}`).join('\n')}\n\n`;
    prompt += `## 応答フォーマットの例\n\`\`\`json\n${JSON.stringify(this.config.examples, null, 2)}\n\`\`\`\n\n`;
    prompt += `## 既存のブロック定義\n${schemaDoc}\n\n`;
    prompt += `## 制約事項\n${this.config.constraints.map(c => `- ${c}`).join('\n')}\n\n`;
    prompt += `---\n\n`;
    prompt += `ユーザーの現在のリクエスト: "${userRequest}"`;

    return prompt;
  }

  private generateToolDocumentation(): string {
    return this.config.availableTools.map(tool => {
      const params = Object.entries(tool.parameters.properties).map(([name, prop]: [string, any]) => {
        return `  - \`${name}\` (${prop.type}): ${prop.description}`;
      }).join('\n');
      return `### \`${tool.name}\`\n${tool.description}\n**パラメータ:**\n${params}`;
    }).join('\n\n');
  }

  private generateSchemaDocumentation(): string {
    try {
      const schemaFile = readFileSync(join(process.cwd(), 'prompts/block-schemas.json'), 'utf-8');
      const parsed = JSON.parse(schemaFile);
      const schemas = parsed.blocks;
      
      let markdown = `このドキュメントは自動生成されています。スキーマ定義に厳密に従ってください。\n\n`;
      Object.entries(schemas).forEach(([blockName, schema]: [string, any]) => {
        markdown += `#### \`${blockName}\` Block\n`;
        markdown += `${schema.description}\n`;
        markdown += `**フィールド:**\n`;
        Object.entries(schema.properties).forEach(([fieldName, fieldDef]: [string, any]) => {
          if (fieldName === '_template') return;
          markdown += `- \`${fieldName}\` (${fieldDef.type})\n`;
        });
        markdown += `\n`;
      });
      return markdown;
    } catch (error) {
      console.error('Schema読み込みエラー:', error);
      return "スキーマ定義を読み込めませんでした。";
    }
  }
  
  public updateConfig(newConfig: Partial<PromptConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const promptManager = new PromptManager(PROMPT_CONFIG);
// #endregion: PromptManager