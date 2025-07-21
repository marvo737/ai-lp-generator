import { readFileSync, existsSync } from "fs";
import { join } from "path";

// #region: schema-types.ts
export interface IconField {
  name: string;
  color: string;
  style: string;
}
export interface ActionField {
  label: string;
  type: "button" | "link";
  icon?: IconField;
  link: string;
}
export interface ImageField {
  src: string;
  alt: string;
  videoUrl?: string;
}
export interface HeroBlock {
  _template: "hero";
  background?: string;
  headline: string;
  tagline?: string;
  actions?: ActionField[];
  image?: ImageField;
}
export interface ContentBlock {
  _template: "content";
  background?: string;
  body: string;
}
export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}
export interface TestimonialBlock {
  _template: "testimonial";
  background?: string;
  title?: string;
  description?: string;
  testimonials: TestimonialItem[];
}
export interface FeatureItem {
  icon?: IconField;
  title: string;
  text: string;
}
export interface FeaturesBlock {
  _template: "features";
  background?: string;
  title?: string;
  description?: string;
  items: FeatureItem[];
}
export interface VideoBlock {
  _template: "video";
  background?: string;
  color?: "default" | "tint" | "primary";
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
}
export interface CalloutBlock {
  _template: "callout";
  background?: string;
  text: string;
  url: string;
}
export interface StatItem {
  stat: string;
  type: string;
}
export interface StatsBlock {
  _template: "stats";
  background?: string;
  title?: string;
  description?: string;
  stats: StatItem[];
}
export interface CtaBlock {
  _template: "cta";
  background?: string;
  title?: string;
  description?: string;
  actions?: ActionField[];
}
export type BlockType =
  | HeroBlock
  | ContentBlock
  | TestimonialBlock
  | FeaturesBlock
  | VideoBlock
  | CalloutBlock
  | StatsBlock
  | CtaBlock;

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
  systemRole:
    "あなたは、ユーザーの指示に従ってTinaCMS製のWebサイトを動的に構築するAIアシスタントです。必要に応じて利用可能なツールを呼び出し、コンポーネントの生成やページの更新を行ってください。",

  instructions: [
    "ユーザーの抽象的な指示（例：「会社の紹介ページを作って」）を具体的なタスクに分解してください。",
    "既存の16種類のブロック（hero、content、testimonial、features、video、callout、stats、cta、profile、gallery、information、pricing_plan、portfolio、company_profile、menu、access_info）を組み合わせて要件を満たす構成を提案してください。",
    "どのような要求でも新しいブロックは作成せず、既存ブロックの設定やコンテンツを調整して対応してください。",
    "ページのコンテンツを更新または置換する必要がある場合は、`mdxContent`フィールドに完全なMdxコンテンツを出力してください。",
    "常にユーザーへの応答を`chatResponse`フィールドに含めてください。",
  ],

  constraints: [
    "mdxの構造を変更してはいけません。",
    "スキーマ定義に存在しないフィールドを追加してはいけません。",
    "必須フィールドを省略してはいけません。",
    "**重要**: 新規ブロックの作成は一切禁止されています。既存の16種類のブロック（hero、content、testimonial、features、video、callout、stats、cta、profile、gallery、information、pricing_plan、portfolio、company_profile、menu、access_info）のみを使用してください。",
    "**重要**: どのような場合でも新しいコンポーネントを生成してはいけません。既存ブロックの組み合わせと設定で要件を満たすよう提案してください。",
    "**重要**: 画像を扱う場合は、既存ブロック（hero、features等）の画像フィールドを使用してください。",
  ],

  toolInstructions: [
    "応答は必ずJSON形式で返してください。",
    "**重要**: 現在、利用可能なツールは定義されていません。`toolCalls`配列は空にするか、省略してください。",
    "すべての処理は`mdxContent`フィールドに完全なMDXコンテンツを出力することで行ってください。",
    "ツールを呼び出さず、直接的なコンテンツ生成・更新のみを行ってください。",
  ],

  availableTools: [],
};
// #endregion: prompt-config.ts

// #region: PromptManager
export class PromptManager {
  private config: PromptConfig;

  constructor(config: PromptConfig) {
    this.config = config;
  }

  public async generatePrompt(
    userRequest: string,
    theme?: any
  ): Promise<string> {
    const schemaDoc = this.generateSchemaDocumentation();
    const toolDoc = this.generateToolDocumentation();

    let prompt = `${this.config.systemRole}\n\n`;
    prompt += `## 指示\n${this.config.instructions
      .map((i) => `- ${i}`)
      .join("\n")}\n\n`;
    prompt += `## 利用可能なツール\n${toolDoc}\n\n`;
    prompt += `## ツールの利用方法\n${this.config.toolInstructions
      .map((i) => `- ${i}`)
      .join("\n")}\n\n`;
    prompt += `## 応答フォーマットの例\n\`\`\`json\n${JSON.stringify(
      this.config.examples,
      null,
      2
    )}\n\`\`\`\n\n`;
    if (theme) {
      prompt += `## 現在のテーマ設定\n以下のテーマ設定を考慮して、コンテンツやスタイルを生成してください。\n\`\`\`json\n${JSON.stringify(
        theme,
        null,
        2
      )}\n\`\`\`\n\n`;
    }
    prompt += `## 既存のブロック定義\n${schemaDoc}\n\n`;
    prompt += `## 制約事項\n${this.config.constraints
      .map((c) => `- ${c}`)
      .join("\n")}\n\n`;
    prompt += `---\n\n`;
    prompt += `ユーザーの現在のリクエスト: "${userRequest}"`;

    return prompt;
  }

  private generateToolDocumentation(): string {
    return this.config.availableTools
      .map((tool) => {
        const params = Object.entries(tool.parameters.properties)
          .map(([name, prop]: [string, any]) => {
            return `  - \`${name}\` (${prop.type}): ${prop.description}`;
          })
          .join("\n");
        return `### \`${tool.name}\`\n${tool.description}\n**パラメータ:**\n${params}`;
      })
      .join("\n\n");
  }

  private generateSchemaDocumentation(): string {
    try {
      const schemaFile = readFileSync(
        join(process.cwd(), "prompts/block-schemas.json"),
        "utf-8"
      );
      const parsed = JSON.parse(schemaFile);
      const schemas = parsed.blocks;

      let markdown = `このドキュメントは自動生成されています。スキーマ定義に厳密に従ってください。\n\n`;
      Object.entries(schemas).forEach(([blockName, schema]: [string, any]) => {
        markdown += `#### \`${blockName}\` Block\n`;
        markdown += `${schema.description}\n`;
        markdown += `**フィールド:**\n`;
        Object.entries(schema.properties).forEach(
          ([fieldName, fieldDef]: [string, any]) => {
            if (fieldName === "_template") return;
            markdown += `- \`${fieldName}\` (${fieldDef.type})\n`;
          }
        );
        markdown += `\n`;
      });
      return markdown;
    } catch (error) {
      console.error("Schema読み込みエラー:", error);
      return "スキーマ定義を読み込めませんでした。";
    }
  }

  public updateConfig(newConfig: Partial<PromptConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const promptManager = new PromptManager(PROMPT_CONFIG);
// #endregion: PromptManager
