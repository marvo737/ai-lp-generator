import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { PageBlocksPortfolio } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Portfolio = ({ data }: { data: PageBlocksPortfolio }) => {
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

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" data-tina-field={tinaField(data, 'items')}>
          {data.items?.map((item, index) => {
            if (!item) return null;
            return (
              <div key={index} className="overflow-hidden rounded-lg bg-white shadow-lg">
                {item.image?.src && (
                  <img src={item.image.src} alt={item.image.alt || ''} className="h-56 w-full object-cover" />
                )}
                <div className="p-6">
                  {item.title && <h3 className="text-xl font-semibold">{item.title}</h3>}
                  {item.description && <p className="mt-2 text-gray-600">{item.description}</p>}
                  <div className="mt-4">
                    {item.tags && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.url && (
                    <div className="mt-6">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                      >
                        詳細を見る &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

// --- Schema ---
export const portfolioBlockSchema: Template = {
  name: 'portfolio',
  label: 'ポートフォリオ',
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
      "label": "ポートフォリオ項目",
      "list": true,
      "fields": [
        {
          "type": "string",
          "name": "title",
          "label": "タイトル"
        },
        {
          "type": "string",
          "name": "description",
          "label": "説明",
          "ui": {
            "component": "textarea"
          }
        },
        {
          "type": "object",
          "name": "image",
          "label": "画像",
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
        },
        {
          "type": "string",
          "name": "url",
          "label": "リンク先URL"
        },
        {
          "type": "string",
          "name": "tags",
          "label": "タグ",
          "list": true
        }
      ]
    }
  ],
};