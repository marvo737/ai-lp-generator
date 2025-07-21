import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { PageBlocksPricing_Plan } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Pricing_plan = ({ data }: { data: PageBlocksPricing_Plan }) => {
  return (
    <Section background={data.background!}>
      <div className="text-center">
        {data.title && (
          <h2
            className="text-balance text-4xl font-semibold lg:text-5xl"
            data-tina-field={tinaField(data, 'title')}
          >
            {data.title}
          </h2>
        )}
        {data.description && (
          <p
            className="mt-4"
            data-tina-field={tinaField(data, 'description')}
          >
            {data.description}
          </p>
        )}
      </div>

      <div data-tina-field={tinaField(data, "plans")} className="mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 not-prose">
          {data.plans?.map((item, index) =>
            item ? (
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
                  {item.duration && <p className="text-sm text-gray-500">{item.duration}</p>}
                  {item.price && <p className="font-semibold text-xl mt-2">{item.price}</p>}
                  {item.description && <p className="mt-4 text-gray-700">{item.description}</p>}
                  {item.isFeatured && (
                    <div className="badge badge-secondary absolute top-4 right-4">おすすめ</div>
                  )}
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </Section>
  );
};

// --- Schema ---
export const pricing_planBlockSchema: Template = {
  name: 'pricing_plan',
  label: '料金プラン',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
    "type": "string",
    "name": "title",
    "label": "タイトル"
  },
  {
    "type": "string",
    "name": "description",
    "label": "説明文"
  },
  {
    "type": "string",
    "name": "id",
    "label": "セクションID"
  },
  {
    "type": "object",
    "name": "plans",
    "label": "プランリスト",
    "list": true,
    "fields": [
      {
        "type": "string",
        "name": "name",
        "label": "プラン名"
      },
      {
        "type": "string",
        "name": "duration",
        "label": "時間"
      },
      {
        "type": "string",
        "name": "price",
        "label": "料金"
      },
      {
        "type": "string",
        "name": "description",
        "label": "補足説明"
      },
      {
        "type": "boolean",
        "name": "isFeatured",
        "label": "おすすめプラン"
      },
      {
        "type": "object",
        "label": "画像",
        "name": "image",
        "fields": [
          {
            "name": "src",
            "label": "画像ソース",
            "type": "string",
            "description": "外部画像URL (例: https://example.com/image.jpg) を入力するか、TinaCMSメディアライブラリから選択してください",
            "ui": {
              "component": "image"
            }
          },
          {
            "name": "alt",
            "label": "代替テキスト",
            "type": "string"
          }
        ]
      }
    ]
  }
  ],
};