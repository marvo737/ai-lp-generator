import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 新しいブロック（コンポーネントとスキーマ）を生成するAPI
export async function POST(request: Request) {
  try {
    const { blockName, blockLabel, fields } = await request.json();

    if (!blockName || !blockLabel || !fields) {
      return NextResponse.json(
        { error: 'Missing required fields: blockName, blockLabel, fields' },
        { status: 400 }
      );
    }

    // 1. テンプレートファイルを読み込む
    const templatePath = path.join(process.cwd(), 'components', 'blocks', 'block-template.tsx');
    let templateContent = await fs.readFile(templatePath, 'utf8');

    // 2. 変数名を準備
    const componentName = blockName.charAt(0).toUpperCase() + blockName.slice(1);
    const schemaName = `${blockName}BlockSchema`;

    // 3. プレースホルダーを置換
    templateContent = templateContent.replace(/__COMPONENT_NAME__/g, componentName);
    templateContent = templateContent.replace(/__SCHEMA_NAME__/g, schemaName);
    templateContent = templateContent.replace(/__BLOCK_NAME__/g, blockName);
    templateContent = templateContent.replace(/__BLOCK_LABEL__/g, blockLabel);

    // 4. フィールド定義（JSXとスキーマ）を生成
    const fieldsJsx = fields
      .map((field: any) => `      <div data-tina-field={tinaField(data, "${field.name}")}>{data.${field.name}}</div>`)
      .join('\n');
    const fieldsSchema = fields
      .map((field: any) => `{ type: '${field.type}', name: '${field.name}', label: '${field.label}' }`)
      .join(',\n    ');
      
    templateContent = templateContent.replace('__FIELDS_JSX__', fieldsJsx);
    templateContent = templateContent.replace('// __FIELDS_SCHEMA__', fieldsSchema);

    // 5. 新しいブロックファイルを作成
    const newBlockPath = path.join(process.cwd(), 'components', 'blocks', `${blockName}.tsx`);
    await fs.writeFile(newBlockPath, templateContent);

    return NextResponse.json({ success: true, path: newBlockPath });
  } catch (error) {
    console.error('Failed to generate block:', error);
    return NextResponse.json(
      { error: 'Failed to generate block.' },
      { status: 500 }
    );
  }
}