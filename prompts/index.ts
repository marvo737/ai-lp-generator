import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// #region: schema-types.ts
// TinaCMS Block Schema Types
export interface IconField {
  name: string;
  color: string;
  style: string;
}

export interface ActionField {
  label: string;
  type: 'button' | 'link';
  icon?: IconField;
  link: string;
}

export interface ImageField {
  src: string;
  alt: string;
  videoUrl?: string;
}

export interface HeroBlock {
  _template: 'hero';
  background?: string;
  headline: string;
  tagline?: string;
  actions?: ActionField[];
  image?: ImageField;
}

export interface ContentBlock {
  _template: 'content';
  background?: string;
  body: string; // rich-text
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

export interface TestimonialBlock {
  _template: 'testimonial';
  background?: string;
  title?: string;
  description?: string;
  testimonials: TestimonialItem[];
}

export interface FeatureItem {
  icon?: IconField;
  title: string;
  text: string; // rich-text
}

export interface FeaturesBlock {
  _template: 'features';
  background?: string;
  title?: string;
  description?: string;
  items: FeatureItem[];
}

export interface VideoBlock {
  _template: 'video';
  background?: string;
  color?: 'default' | 'tint' | 'primary';
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export interface CalloutBlock {
  _template: 'callout';
  background?: string;
  text: string;
  url: string;
}

export interface StatItem {
  stat: string;
  type: string;
}

export interface StatsBlock {
  _template: 'stats';
  background?: string;
  title?: string;
  description?: string;
  stats: StatItem[];
}

export interface CtaBlock {
  _template: 'cta';
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

// プロンプト設定の型定義
export interface PromptConfig {
  systemRole: string;
  instructions: string[];
  constraints: string[];
  examples?: Record<string, any>;
}
// #endregion: schema-types.ts

// #region: prompt-config.ts
// プロンプト設定の管理
export const PROMPT_CONFIG: PromptConfig = {
  systemRole: "あなたはTinaCMS用のWebサイトコンテンツを生成するプロのライターです。",

  instructions: [
    "ユーザーの指示に基づき、提供されるmdxファイルのテンプレート構造とスキーマ定義を完全に理解してください。",
    "各ブロックの内容を創造的に書き換える必要がありますが、mdxの構造と各ブロックのフィールド定義は絶対に変更しないでください。",
    "フィールド名、型、階層は厳密に従ってください。",
    "生成されたコンテンツは実用的で魅力的なものにしてください。"
  ],

  constraints: [
    "mdxの構造を変更してはいけません",
    "ブロックのフィールド定義（名前、型、階層）を変更してはいけません",
    "スキーマ定義に存在しないフィールドを追加してはいけません",
    "必須フィールドを省略してはいけません"
  ],

  examples: {
    heroBlock: {
      "_template": "hero",
      "headline": "革新的なソリューションで未来を築く",
      "tagline": "テクノロジーの力で、ビジネスの可能性を最大化します",
      "actions": [
        {
          "label": "今すぐ始める",
          "type": "button",
          "link": "/get-started"
        }
      ]
    }
  }
};
// #endregion: prompt-config.ts

// #region: schema-generator.ts
interface BlockSchema {
  type: string;
  properties: Record<string, any>;
  required: string[];
  description: string;
}

// JSON Schemaからプロンプトを自動生成
class PromptGenerator {
  private schemas: Record<string, BlockSchema> = {};

  constructor() {
    this.loadSchemas();
  }

  private loadSchemas() {
    try {
      const schemaFile = readFileSync(
        join(process.cwd(), 'prompts/block-schemas.json'),
        'utf-8'
      );
      const parsed = JSON.parse(schemaFile);
      this.schemas = parsed.blocks;
    } catch (error) {
      console.error('Schema読み込みエラー:', error);
      this.schemas = {};
    }
  }

  // Markdownドキュメントを自動生成
  generateSchemaDocumentation(): string {
    let markdown = `# TinaCMS Block Schema Definitions\n\n`;
    markdown += `このドキュメントは自動生成されています。スキーマ定義に厳密に従ってください。\n\n`;
    markdown += `---\n\n`;

    Object.entries(this.schemas).forEach(([blockName, schema], index) => {
      markdown += `## ${index + 1}. ${this.capitalize(blockName)} Block (\`${blockName}\`)\n\n`;
      markdown += `${schema.description}\n\n`;
      markdown += `**フィールド:**\n`;

      this.generateFieldDocumentation(schema.properties, markdown);
      markdown += `\n---\n\n`;
    });

    return markdown;
  }

  private generateFieldDocumentation(
    properties: Record<string, any>,
    markdown: string,
    indent = ''
  ): void {
    Object.entries(properties).forEach(([fieldName, fieldDef]) => {
      if (fieldName === '_template') return; // Skip template field

      const isRequired = this.schemas[Object.keys(this.schemas)[0]]?.required?.includes(fieldName);
      const requiredText = isRequired ? '' : ', optional';

      markdown += `${indent}- \`${fieldName}\` (${this.getFieldTypeText(fieldDef)}${requiredText}): ${this.getFieldDescription(fieldDef)}\n`;

      // ネストされたオブジェクトの場合
      if (fieldDef.type === 'object' && fieldDef.properties) {
        this.generateFieldDocumentation(fieldDef.properties, markdown, indent + '  ');
      }

      // 配列の場合
      if (fieldDef.type === 'array' && fieldDef.items?.properties) {
        this.generateFieldDocumentation(fieldDef.items.properties, markdown, indent + '  ');
      }
    });
  }

  private getFieldTypeText(fieldDef: any): string {
    if (fieldDef.type === 'array') {
      return `list of objects`;
    }
    if (fieldDef.contentType === 'rich-text') {
      return 'rich-text';
    }
    if (fieldDef.format === 'uri') {
      return 'image/URL';
    }
    if (fieldDef.enum) {
      return `string (${fieldDef.enum.join(', ')})`;
    }
    return fieldDef.type || 'string';
  }

  private getFieldDescription(fieldDef: any): string {
    if (fieldDef.description) return fieldDef.description;

    // デフォルトの説明を生成
    if (fieldDef.type === 'boolean') return 'True/Falseの値';
    if (fieldDef.format === 'uri') return 'URLまたは画像パス';
    if (fieldDef.contentType === 'rich-text') return 'Markdownとその他のコンポーネントをサポート';

    return 'フィールドの値';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // プロンプトコンテキスト生成
  generatePromptContext(mdxTemplate: string): string {
    const schemaDoc = this.generateSchemaDocumentation();

    return `
あなたはTinaCMS用のWebサイトコンテンツを生成するプロのライターです。

## 重要な制約事項:
- mdxの構造と各ブロックのフィールド定義（フィールド名、型、階層）は絶対に変更しないでください
- スキーマ定義に存在しないフィールドを追加してはいけません
- 必須フィールドを省略してはいけません
- 各ブロックの内容は創造的に書き換えてください

---mdxテンプレートここから---
${mdxTemplate}
---mdxテンプレートここまで---

---自動生成されたブロックスキーマ定義---
${schemaDoc}
---スキーマ定義終了---

以上の厳密な形式に従って、新しいコンテンツを生成してください。
`;
  }

  // バリデーション機能
  validateBlockContent(blockType: string, content: any): boolean {
    const schema = this.schemas[blockType];
    if (!schema) {
      console.error(`未知のブロックタイプ: ${blockType}`);
      return false;
    }

    // 必須フィールドのチェック
    for (const requiredField of schema.required) {
      if (!(requiredField in content)) {
        console.error(`必須フィールド '${requiredField}' が見つかりません`);
        return false;
      }
    }

    return true;
  }
}

export const promptGenerator = new PromptGenerator();
// #endregion: schema-generator.ts

// #region: template-system.ts
// テンプレート変数の型定義
interface TemplateVariables {
  [key: string]: string | number | boolean | object;
}

// プロンプトテンプレートの管理
class PromptTemplateSystem {
  private templates: Map<string, string> = new Map();
  private basePath: string;

  constructor(basePath = 'prompts/templates') {
    this.basePath = basePath;
    this.loadTemplates();
  }

  private loadTemplates() {
    const templateFiles = [
      'base-system.hbs',
      'content-generation.hbs',
      'schema-validation.hbs',
      'examples.hbs'
    ];

    templateFiles.forEach(filename => {
      const templatePath = join(process.cwd(), this.basePath, filename);
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8');
        const templateName = filename.replace('.hbs', '');
        this.templates.set(templateName, content);
      }
    });
  }

  // Handlebars風の変数置換
  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;

    // 単純な変数置換 {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });

    // 条件分岐 {{#if condition}}...{{/if}}
    result = this.processConditionals(result, variables);

    // ループ処理 {{#each array}}...{{/each}}
    result = this.processLoops(result, variables);

    return result;
  }

  private processConditionals(template: string, variables: TemplateVariables): string {
    const ifRegex = /{{#if\s+(\w+)}}(.*?){{\/if}}/gs;

    return template.replace(ifRegex, (match, condition, content) => {
      const value = variables[condition];
      return value ? content : '';
    });
  }

  private processLoops(template: string, variables: TemplateVariables): string {
    const eachRegex = /{{#each\s+(\w+)}}(.*?){{\/each}}/gs;

    return template.replace(eachRegex, (match, arrayName, content) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        let itemContent = content;

        // インデックスと項目データを変数として使用可能
        itemContent = itemContent.replace(/{{@index}}/g, String(index));

        if (typeof item === 'object') {
          Object.entries(item as object).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            itemContent = itemContent.replace(regex, String(value));
          });
        } else {
          itemContent = itemContent.replace(/{{this}}/g, String(item));
        }

        return itemContent;
      }).join('\n');
    });
  }

  // プロンプト生成
  generatePrompt(templateName: string, variables: TemplateVariables): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`テンプレート '${templateName}' が見つかりません`);
    }

    return this.replaceVariables(template, variables);
  }

  // テンプレートの存在確認
  hasTemplate(templateName: string): boolean {
    return this.templates.has(templateName);
  }
}

// プロンプト生成のヘルパー関数
function createContentGenerationPrompt(
  mdxTemplate: string,
  schemaMarkdown: string,
  userPrompt: string
): string {
  const templateSystem = new PromptTemplateSystem();

  const variables: TemplateVariables = {
    mdxTemplate,
    schemaMarkdown,
    userPrompt,
    timestamp: new Date().toISOString(),
    constraints: [
      "mdxの構造を変更してはいけません",
      "ブロックのフィールド定義を変更してはいけません",
      "スキーマに存在しないフィールドを追加してはいけません"
    ]
  };

  if (templateSystem.hasTemplate('content-generation')) {
    return templateSystem.generatePrompt('content-generation', variables);
  }

  // フォールバック：基本テンプレート
  return `
あなたはTinaCMS用のWebサイトコンテンツを生成するプロのライターです。

## ユーザーリクエスト:
${userPrompt}

## 制約事項:
- mdxの構造と各ブロックのフィールド定義は絶対に変更しないでください
- スキーマ定義に存在しないフィールドを追加してはいけません

---mdxテンプレート---
${mdxTemplate}

---スキーマ定義---
${schemaMarkdown}
`;
}
// #endregion: template-system.ts


// #region: prompt-manager.ts
// プロンプト管理の統合インターface
export interface PromptManagerConfig {
  useAutoGeneration?: boolean;
  templateEngine?: 'handlebars' | 'simple';
  cachePrompts?: boolean;
  validateSchema?: boolean;
}

export class PromptManager {
  private config: PromptManagerConfig;
  private promptCache = new Map<string, string>();
  private promptGenerator: PromptGenerator;

  constructor(config: PromptManagerConfig = {}) {
    this.config = {
      useAutoGeneration: true,
      templateEngine: 'handlebars',
      cachePrompts: true,
      validateSchema: true,
      ...config
    };
    this.promptGenerator = new PromptGenerator();
  }

  // メインのプロンプト生成メソッド
  async generatePrompt(userRequest: string): Promise<string> {
    const cacheKey = this.createCacheKey(userRequest);

    // キャッシュ確認
    if (this.config.cachePrompts && this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!;
    }

    // テンプレートファイルの読み込み
    const mdxTemplate = this.readFileSafely(
      join(process.cwd(), 'content', 'pages', 'home.mdx')
    );

    // JSON Schemaからプロンプトを自動生成
    const schemaContent = this.promptGenerator.generateSchemaDocumentation();
    let fullPrompt = this.promptGenerator.generatePromptContext(mdxTemplate);

    // テンプレートエンジンを使用してプロンプトを生成
    if (this.config.templateEngine === 'handlebars') {
      fullPrompt = createContentGenerationPrompt(mdxTemplate, schemaContent, userRequest);
    }

    // バリデーション
    if (this.config.validateSchema) {
      this.validatePromptStructure(fullPrompt);
    }

    // キャッシュに保存
    if (this.config.cachePrompts) {
      this.promptCache.set(cacheKey, fullPrompt);
    }

    return fullPrompt;
  }

  // プロンプト構造の基本バリデーション
  private validatePromptStructure(prompt: string): boolean {
    const requiredSections = [
      'mdxテンプレート',
      'スキーマ定義',
      'TinaCMS'
    ];

    const hasAllSections = requiredSections.every(section =>
      prompt.includes(section)
    );

    if (!hasAllSections) {
      console.warn('プロンプト構造に不足があります');
    }

    return hasAllSections;
  }

  private readFileSafely(filePath: string): string {
    try {
      return readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error(`ファイル読み込みエラー: ${filePath}`, error);
      return '';
    }
  }

  private createCacheKey(userRequest: string): string {
    // Node.jsのBufferに依存しないように簡易的な実装に変更
    return `prompt_${userRequest.substring(0, 16)}`;
  }

  // キャッシュクリア
  clearCache(): void {
    this.promptCache.clear();
  }

  // 設定更新
  updateConfig(newConfig: Partial<PromptManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.clearCache(); // 設定変更時はキャッシュをクリア
  }

  // 統計情報
  getStats() {
    return {
      cacheSize: this.promptCache.size,
      config: this.config
    };
  }
}

// シングルトンインスタンス
export const promptManager = new PromptManager({
  useAutoGeneration: true,
  templateEngine: 'handlebars',
  cachePrompts: true,
  validateSchema: true
});
// #endregion: prompt-manager.ts