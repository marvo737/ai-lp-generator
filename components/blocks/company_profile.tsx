import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { PageBlocksCompany_Profile } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Company_profile = ({ data }: { data: PageBlocksCompany_Profile }) => {
  return (
    <Section background={data.background!}>
      <div className="container mx-auto">
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

        <div className="mt-12 overflow-hidden rounded-lg bg-white shadow">
          <div className="divide-y divide-gray-200" data-tina-field={tinaField(data, 'items')}>
            {data.items?.map((item, index) => {
              if (!item) return null;
              return (
                <div key={index} className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  {item.label && (
                    <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  )}
                  {item.value && (
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{item.value}</dd>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};

// --- Schema ---
export const company_profileBlockSchema: Template = {
  name: 'company_profile',
  label: '会社概要',
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
  {
    "type": "string",
    "name": "id",
    "label": "セクションID"
  },
  {
    "type": "object",
    "name": "items",
    "label": "概要項目",
    "list": true,
    "fields": [
      {
        "type": "string",
        "name": "label",
        "label": "項目名"
      },
      {
        "type": "string",
        "name": "value",
        "label": "内容"
      }
    ]
  }
  ],
};