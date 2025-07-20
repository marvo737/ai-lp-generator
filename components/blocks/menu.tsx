import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Menu = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!}>
            <div data-tina-field={tinaField(data, "id")}>
        <strong>セクションID:</strong>
        <pre><code>{typeof data.id === 'object' ? JSON.stringify(data.id, null, 2) : data.id}</code></pre>
      </div>
      <div data-tina-field={tinaField(data, "title")}>
        <strong>タイトル:</strong>
        <pre><code>{typeof data.title === 'object' ? JSON.stringify(data.title, null, 2) : data.title}</code></pre>
      </div>
      <div data-tina-field={tinaField(data, "description")}>
        <strong>説明文:</strong>
        <pre><code>{typeof data.description === 'object' ? JSON.stringify(data.description, null, 2) : data.description}</code></pre>
      </div>
      <div data-tina-field={tinaField(data, "items")}>
        <strong>メニュー品目:</strong>
        <pre><code>{typeof data.items === 'object' ? JSON.stringify(data.items, null, 2) : data.items}</code></pre>
      </div>
    </Section>
  );
};

// --- Schema ---
export const menuBlockSchema: Template = {
  name: 'menu',
  label: 'Menu Section',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
    "type": "string",
    "name": "id",
    "label": "セクションID"
  },
  {
    "type": "string",
    "name": "title",
    "label": "タイトル"
  },
  {
    "type": "string",
    "name": "description",
    "label": "説明文",
    "ui": {
      "component": "textarea"
    }
  },
  {
    "type": "object",
    "name": "items",
    "label": "メニュー品目",
    "list": true,
    "fields": [
      {
        "type": "string",
        "name": "name",
        "label": "品名"
      },
      {
        "type": "string",
        "name": "price",
        "label": "価格"
      },
      {
        "type": "string",
        "name": "description",
        "label": "品目説明"
      },
      {
        "type": "object",
        "name": "image",
        "label": "商品写真",
        "fields": [
          {
            "type": "string",
            "name": "src",
            "label": "画像URL"
          },
          {
            "type": "string",
            "name": "alt",
            "label": "代替テキスト"
          }
        ]
      }
    ]
  }
  ],
};