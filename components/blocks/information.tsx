import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// --- Component ---
export const Information = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!}>
      <div className="container mx-auto py-12">
        {data.title && (
          <h1 data-tina-field={tinaField(data, 'title')} className="text-3xl font-bold text-center mb-8">
            {data.title}
          </h1>
        )}
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.address && (
                <div data-tina-field={tinaField(data, 'address')}>
                  <h3 className="font-semibold">Address</h3>
                  <p>{data.address}</p>
                </div>
              )}
              {data.access && (
                <div data-tina-field={tinaField(data, 'access')}>
                  <h3 className="font-semibold">Access</h3>
                  <p>{data.access}</p>
                </div>
              )}
              {data.hours && (
                <div data-tina-field={tinaField(data, 'hours')}>
                  <h3 className="font-semibold">Opening Hours</h3>
                  <p>{data.hours}</p>
                </div>
              )}
              {data.holidays && (
                <div data-tina-field={tinaField(data, 'holidays')}>
                  <h3 className="font-semibold">Holidays</h3>
                  <p>{data.holidays}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {data.googleMapEmbedUrl && (
            <div data-tina-field={tinaField(data, 'googleMapEmbedUrl')}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={data.googleMapEmbedUrl}
                      width="100%"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

// --- Schema ---
export const informationBlockSchema: Template = {
  name: 'information',
  label: 'Information',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'string',
      name: 'title',
      label: 'Title',
    },
    {
      type: 'string',
      name: 'address',
      label: 'Address',
    },
    {
      type: 'string',
      name: 'googleMapEmbedUrl',
      label: 'Google Map Embed URL',
    },
    {
      type: 'string',
      name: 'access',
      label: 'Access',
    },
    {
      type: 'string',
      name: 'hours',
      label: 'Opening Hours',
    },
    {
      type: 'string',
      name: 'holidays',
      label: 'Holidays',
    },
  ],
};