import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const __COMPONENT_NAME__ = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!}>
      __FIELDS_JSX__
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
    // __FIELDS_SCHEMA__
  ],
};