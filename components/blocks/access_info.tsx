import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Access_info = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!} className="prose prose-lg">
      <div className="text-center">
        {data.accessTitle && (
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl" data-tina-field={tinaField(data, 'accessTitle')}>
            {data.accessTitle}
          </h2>
        )}
      </div>
      
      <div className="mt-8">
        {data.address && <p data-tina-field={tinaField(data, 'address')}><strong>Address:</strong> {data.address}</p>}
        {data.opening_hours && <div data-tina-field={tinaField(data, 'opening_hours')}><strong>Opening Hours:</strong> <p>{data.opening_hours}</p></div>}
        {data.contact_info && <p data-tina-field={tinaField(data, 'contact_info')}><strong>Contact:</strong> {data.contact_info}</p>}
        {data.map_url && (
          <div className="mt-4" data-tina-field={tinaField(data, 'map_url')}>
            <iframe
              src={data.map_url}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    </Section>
  );
};

// --- Schema ---
export const access_infoBlockSchema: Template = {
  name: 'access_info',
  label: 'Access Information',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: "string",
      name: "accessTitle",
      label: "Title"
    },
    {
      type: "string",
      name: "address",
      label: "Address"
    },
    {
      type: "rich-text",
      name: "opening_hours",
      label: "Opening Hours"
    },
    {
      type: "string",
      name: "map_url",
      label: "Google Maps Embed URL"
    },
    {
      type: "string",
      name: "contact_info",
      label: "Contact Info"
    }
  ],
};