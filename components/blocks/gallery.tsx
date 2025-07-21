import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { PageBlocksGallery, PageBlocksGalleryImages } from '@/tina/__generated__/types';
import { Card } from '../ui/card';

// --- Component ---
export const Gallery = ({ data }: { data: PageBlocksGallery }) => {
  return (
    <Section background={data.background!}>
      <div className="container mx-auto py-12">
        {data.title && (
          <h1 data-tina-field={tinaField(data, 'title')} className="text-3xl font-bold text-center mb-2">
            {data.title}
          </h1>
        )}
        {data.description && (
          <p data-tina-field={tinaField(data, 'description')} className="text-lg text-center text-muted-foreground mb-8">
            {data.description}
          </p>
        )}
        <div data-tina-field={tinaField(data, 'images')} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.images?.map((image, index) => {
            if (!image) return null;
            return (
              <Card key={index} className="overflow-hidden">
                {image.src && (
                  <img
                    src={image.src}
                    alt={image.alt || ''}
                    className="w-full h-64 object-cover"
                    data-tina-field={tinaField(image)}
                  />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

// --- Schema ---
export const galleryBlockSchema: Template = {
  name: 'gallery',
  label: 'Image Gallery',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
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
    "name": "images",
    "label": "Image List",
    "list": true,
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
  ],
};