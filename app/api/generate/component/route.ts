import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const toPascalCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function sanitizeFields(fields: any[]): any[] {
  const sanitized = JSON.parse(JSON.stringify(fields));
  const commonFields = ['background', 'color'];
  const filtered = sanitized.filter((field: any) => !commonFields.includes(field.name));

  return filtered.map((field: any) => {
    if (field.type === 'object' && field.list === true && !field.fields) {
      field.fields = [];
    }
    return field;
  });
}

// --- JSX生成ロジックの改良 ---
function generateFieldsJsx(fields: any[]): string {
  let jsx = '';
  const titleField = fields.find(f => f.name.toLowerCase().includes('title') || f.name.toLowerCase().includes('headline'));
  const otherFields = fields.filter(f => f !== titleField);

  if (titleField) {
    jsx += `<h1 data-tina-field={tinaField(data, "${titleField.name}")}>{data.${titleField.name}}</h1>\\n`;
  }

  otherFields.forEach(field => {
    const fieldAccessor = `data.${field.name}`;
    if (field.list === true && field.type === 'object') {
      jsx += `
        <div data-tina-field={tinaField(data, "${field.name}")}>
          <h2>${field.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 not-prose">
            {${fieldAccessor}?.map((item, index) => (
              <div key={index} className="card bg-base-100 shadow-xl">
                {item.image?.src && (
                  <figure>
                    <img
                      src={item.image.src}
                      alt={item.image.alt || ''}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  {item.name && <h3 className="card-title">{item.name}</h3>}
                  {item.description && <p>{item.description}</p>}
                  {item.price && <p className="font-semibold">{item.price}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      `;
    } else {
      const renderExpression = `typeof ${fieldAccessor} === 'object' ? JSON.stringify(${fieldAccessor}, null, 2) : String(${fieldAccessor})`;
      jsx += `
        <div data-tina-field={tinaField(data, "${field.name}")}>
          <h2>${field.label}</h2>
          <p>{${renderExpression}}</p>
        </div>
      `;
    }
  });

  return jsx;
}

export async function POST(request: Request) {
  try {
    const { blockName, blockLabel, fields } = await request.json();

    if (!blockName || !blockLabel || !fields) {
      return NextResponse.json(
        { error: 'Missing required fields: blockName, blockLabel, fields' },
        { status: 400 }
      );
    }

    const sanitizedFields = sanitizeFields(fields);

    const templatePath = path.join(process.cwd(), 'components', 'blocks', 'block-template.tsx');
    let templateContent = await fs.readFile(templatePath, 'utf8');

    const componentName = toPascalCase(blockName);
    const schemaName = `${blockName}BlockSchema`;

    templateContent = templateContent.replace(/__COMPONENT_NAME__/g, componentName);
    templateContent = templateContent.replace(/__SCHEMA_NAME__/g, schemaName);
    templateContent = templateContent.replace(/__BLOCK_NAME__/g, blockName);
    templateContent = templateContent.replace(/__BLOCK_LABEL__/g, blockLabel);

    // --- 改良されたJSX生成ロジックを呼び出す ---
    const fieldsJsx = generateFieldsJsx(sanitizedFields);
      
    const fieldsSchema = JSON.stringify(sanitizedFields, null, 2)
      .replace(/^\[\n/, '')
      .replace(/\n\]$/, '')
      .trim();

    templateContent = templateContent.replace('__FIELDS_JSX__', fieldsJsx);
    templateContent = templateContent.replace('// __FIELDS_SCHEMA__', fieldsSchema);

    const newBlockPath = path.join(process.cwd(), 'components', 'blocks', `${blockName}.tsx`);
    await fs.writeFile(newBlockPath, templateContent);

    // 自動登録処理... (変更なし)
    try {
      const indexPath = path.join(process.cwd(), 'components', 'blocks', 'index.tsx');
      let indexContent = await fs.readFile(indexPath, 'utf8');
      const newComponentEntry = `  PageBlocks${componentName}: dynamic(() => import('./${blockName}').then(mod => mod.${componentName})),`;
      const componentMarker = '// Note: New blocks will need to be added here manually for now.';
      if (indexContent.includes(componentMarker)) {
        indexContent = indexContent.replace(componentMarker, `${newComponentEntry}\n  ${componentMarker}`);
        await fs.writeFile(indexPath, indexContent);
      }
    } catch (e) {
      console.error(`Failed to update components/blocks/index.tsx: `, e);
    }

    try {
      const pagePath = path.join(process.cwd(), 'tina', 'collection', 'page.ts');
      let pageContent = await fs.readFile(pagePath, 'utf8');
      
      const importStatement = `import { ${schemaName} } from '@/components/blocks/${blockName}';`;
      const importAnchor = `import { profileBlockSchema } from '@/components/blocks/profile'; // 手動で追加`;
      if (!pageContent.includes(importStatement) && pageContent.includes(importAnchor)) {
        pageContent = pageContent.replace(importAnchor, `${importAnchor}\n${importStatement}`);
      }

      const templateStatement = `${schemaName},`;
      const templateAnchor = `profileBlockSchema, // 手動で追加`;
      if (!pageContent.includes(templateStatement) && pageContent.includes(templateAnchor)) {
        pageContent = pageContent.replace(templateAnchor, `${templateAnchor}\n        ${templateStatement}`);
      }
      
      await fs.writeFile(pagePath, pageContent);

    } catch (e) {
      console.error(`Failed to update tina/collection/page.ts: `, e);
    }

    return NextResponse.json({ success: true, path: newBlockPath, message: "Block generated and auto-registered." });
  } catch (error) {
    console.error('Failed to generate block:', error);
    return NextResponse.json(
      { error: 'Failed to generate block.' },
      { status: 500 }
    );
  }
}