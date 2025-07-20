import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';

// --- Component ---
export const Profile = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!}>
            <div data-tina-field={tinaField(data, "name")}>{data.name}</div>
      <div data-tina-field={tinaField(data, "bio")}>{data.bio}</div>
      <div data-tina-field={tinaField(data, "avatar")}>{data.avatar}</div>
    </Section>
  );
};

// --- Schema ---
export const profileBlockSchema: Template = {
  name: 'profile',
  label: 'Profile',
  ui: {
    previewSrc: '/blocks/new-block.png',
  },
  fields: [
    sectionBlockSchemaField as any,
    { type: 'string', name: 'name', label: 'Name' },
    { type: 'string', name: 'bio', label: 'Biography' },
    { type: 'string', name: 'avatar', label: 'Avatar URL' }
  ],
};