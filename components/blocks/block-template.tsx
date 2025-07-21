// このファイルは新規ブロック作成機能が無効化されたため、使用されていません。
// 新規ブロック作成機能を再有効化する場合のみ必要です。

import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const __COMPONENT_NAME__ = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!} className="prose prose-lg">
      <div className="text-center">
        {data.title && (
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl" data-tina-field={tinaField(data, 'title')}>
            {data.title}
          </h2>
        )}
        {data.description && (
          <p className="mt-4" data-tina-field={tinaField(data, 'description')}>
            {data.description}
          </p>
        )}
      </div>
      {/* __FIELDS_JSX__ */}
    </Section>
  );
};

// --- Schema ---
export const __SCHEMA_NAME__: Template = {
  name: '__BLOCK_NAME__',
  label: '__BLOCK_LABEL__',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: "string",
      label: "タイトル",
      name: "title",
    },
    {
      type: "string",
      label: "説明文",
      name: "description",
      ui: {
        component: "textarea",
      },
    },
    // __FIELDS_SCHEMA__
  ],
};