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
  console.warn('Blocked attempt to create new component');
  
  return NextResponse.json(
    {
      error: 'Component generation is disabled',
      message: '新規ブロック作成機能は無効化されています。既存の8種類のブロック（hero、content、testimonial、features、video、callout、stats、cta）を使用してください。'
    },
    { status: 403 }
  );
}