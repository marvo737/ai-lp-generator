import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MenuItem {
  name?: string | null;
  price?: string | null;
  description?: string | null;
  image?: {
    src?: string | null;
    alt?: string | null;
  } | null;
}

interface MenuCategory {
  categoryTitle?: string | null;
  items?: (MenuItem | null)[] | null;
}

interface MenuData {
  background?: string | null;
  id?: string | null;
  title?: string | null;
  description?: string | null;
  categories?: (MenuCategory | null)[] | null;
}

// --- Component ---
export const Menu = ({ data }: { data: MenuData }) => {
  return (
    <Section background={data.background!} id={data.id || undefined}>
      <div className="container mx-auto py-12">
        {data.title && (
          <h2 data-tina-field={tinaField(data as any, 'title')} className="text-3xl font-bold text-center mb-2">
            {data.title}
          </h2>
        )}
        {data.description && (
          <p data-tina-field={tinaField(data as any, 'description')} className="text-lg text-center text-muted-foreground mb-8">
            {data.description}
          </p>
        )}

        <div className="space-y-8">
          {data.categories?.map((category, categoryIndex) => {
            if (!category) return null;
            return (
              <div key={categoryIndex} data-tina-field={tinaField(category as any)}>
                {category.categoryTitle && (
                  <h3 className="text-2xl font-semibold mb-4">{category.categoryTitle}</h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {category.items?.map((item, itemIndex) => {
                    if (!item) return null;
                    return (
                      <Card key={itemIndex} data-tina-field={tinaField(item as any)} className="flex flex-col">
                        {item.image?.src && (
                          <img
                            src={item.image.src}
                            alt={item.image.alt || ''}
                            className="w-full h-48 object-cover rounded-t-xl"
                            data-tina-field={tinaField(item as any, 'image')}
                          />
                        )}
                        <CardHeader>
                          {item.name && <CardTitle data-tina-field={tinaField(item as any, 'name')}>{item.name}</CardTitle>}
                        </CardHeader>
                        <CardContent className="flex-grow">
                          {item.description && <p data-tina-field={tinaField(item as any, 'description')} className="text-muted-foreground mb-2">{item.description}</p>}
                          {item.price && <p data-tina-field={tinaField(item as any, 'price')} className="font-semibold text-lg">{item.price}</p>}
                        </CardContent>
                      </Card>
                    );
                  })}
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
export const menuBlockSchema: Template = {
  name: 'menu',
  label: 'Menu',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      "type": "string",
      "name": "id",
      "label": "ID (for anchor links)"
    },
    {
      "type": "string",
      "name": "title",
      "label": "Title"
    },
    {
      "type": "string",
      "name": "description",
      "label": "Description"
    },
    {
      "type": "object",
      "name": "categories",
      "label": "Menu Categories",
      "list": true,
      "fields": [
        {
          "type": "string",
          "name": "categoryTitle",
          "label": "Category Title"
        },
        {
          "type": "object",
          "name": "items",
          "label": "Menu Items",
          "list": true,
          "fields": [
            {
              "type": "string",
              "name": "name",
              "label": "Item Name"
            },
            {
              "type": "string",
              "name": "price",
              "label": "Price"
            },
            {
              "type": "string",
              "name": "description",
              "label": "Item Description"
            },
            {
              "type": "object",
              "name": "image",
              "label": "Item Image",
              "fields": [
                {
                  "type": "string",
                  "name": "src",
                  "label": "Image URL"
                },
                {
                  "type": "string",
                  "name": "alt",
                  "label": "Alt Text"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
};