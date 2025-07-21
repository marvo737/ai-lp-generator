import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Menu = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!} className="prose prose-lg">
      <div className="text-center">
        {data.menuTitle && (
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl" data-tina-field={tinaField(data, 'menuTitle')}>
            {data.menuTitle}
          </h2>
        )}
        {data.menuDescription && (
          <div className="mt-4" data-tina-field={tinaField(data, 'menuDescription')}>
            {/* Assuming rich-text content here */}
            <p>{data.menuDescription}</p>
          </div>
        )}
      </div>
      <div data-tina-field={tinaField(data, "items")} className="mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 not-prose">
          {data.items?.map((item: any, index: number) => (
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
                {item.itemDescription && <p>{item.itemDescription}</p>}
                {item.price && <p className="font-semibold">{item.price}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// --- Schema ---
export const menuBlockSchema: Template = {
  name: 'menu',
  label: 'Menu',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: "string",
      name: "menuTitle",
      label: "Title"
    },
    {
      type: "rich-text",
      name: "menuDescription",
      label: "Description"
    },
    {
      type: "object",
      name: "items",
      label: "Menu Items",
      list: true,
      fields: [
        {
          type: "string",
          name: "name",
          label: "Name"
        },
        {
          type: "string",
          name: "price",
          label: "Price"
        },
        {
          type: "string",
          name: "itemDescription",
          label: "Description"
        },
        {
          type: "object",
          name: "image",
          label: "Image",
          fields: [
            {
              type: "string",
              name: "src",
              label: "Image URL"
            },
            {
              type: "string",
              name: "alt",
              label: "Alt Text"
            }
          ]
        }
      ]
    }
  ],
};