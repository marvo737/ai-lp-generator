import type { Template } from 'tinacms';
import { iconSchema } from './icon';
import { sectionBlockSchemaField } from '@/components/layout/section';
import { scriptCopyBlockSchema } from '@/components/magicui/script-copy-btn';

// --- Hero Block Schema ---
export const heroBlockSchema: Template = {
  name: 'hero',
  label: 'Hero',
  fields: [
    sectionBlockSchemaField as any,
    { type: 'string', label: 'Headline', name: 'headline' },
    { type: 'string', label: 'Tagline', name: 'tagline' },
    {
      label: 'Actions', name: 'actions', type: 'object', list: true,
      fields: [
        { label: 'Label', name: 'label', type: 'string' },
        { label: 'Type', name: 'type', type: 'string', options: [{ label: 'Button', value: 'button' }, { label: 'Link', value: 'link' }] },
        iconSchema as any,
        { label: 'Link', name: 'link', type: 'string' },
      ],
    },
    {
      type: 'object', label: 'Image', name: 'image',
      fields: [
        { name: 'src', label: 'Image Source', type: 'image' },
        { name: 'alt', label: 'Alt Text', type: 'string' },
        { name: 'videoUrl', label: 'Video URL', type: 'string' },
      ],
    },
  ],
};

// --- Content Block Schema ---
export const contentBlockSchema: Template = {
  name: 'content',
  label: 'Content',
  fields: [
    sectionBlockSchemaField as any,
    { type: 'rich-text', label: 'Body', name: 'body', templates: [scriptCopyBlockSchema] },
  ],
};

// --- Testimonial Block Schema ---
export const testimonialBlockSchema: Template = {
  name: "testimonial",
  label: "Testimonial",
  fields: [
    sectionBlockSchemaField as any,
    { type: "string", label: "Title", name: "title" },
    { type: "string", label: "Description", name: "description", ui: { component: "textarea" } },
    {
      type: "object", list: true, label: "Testimonials", name: "testimonials",
      fields: [
        { type: "string", ui: { component: "textarea" }, label: "Quote", name: "quote" },
        { type: "string", label: "Author", name: "author" },
        { type: "string", label: "Role", name: "role" },
        { type: "image", label: "Avatar", name: "avatar" }
      ],
    },
  ],
};

// --- Feature Block Schema ---
export const featureBlockSchema: Template = {
  name: "features",
  label: "Features",
  fields: [
    sectionBlockSchemaField as any,
    { type: "string", label: "Title", name: "title" },
    { type: "string", label: "Description", name: "description" },
    {
      type: "object", label: "Feature Items", name: "items", list: true,
      fields: [
        iconSchema as any,
        { type: "string", label: "Title", name: "title" },
        { type: "rich-text", label: "Text", name: "text" },
      ],
    },
  ],
};

// --- Video Block Schema ---
export const videoBlockSchema: Template = {
  name: 'video',
  label: 'Video',
  fields: [
    sectionBlockSchemaField as any,
    { type: 'string', label: 'Color', name: 'color', options: [{ label: 'Default', value: 'default' }, { label: 'Tint', value: 'tint' }, { label: 'Primary', value: 'primary' }] },
    { type: 'string', label: 'Url', name: 'url' },
    { type: 'boolean', label: 'Auto Play', name: 'autoPlay' },
    { type: 'boolean', label: 'Loop', name: 'loop' },
  ],
};

// --- Callout Block Schema ---
export const calloutBlockSchema: Template = {
    name: 'callout',
    label: 'Callout',
    fields: [
        sectionBlockSchemaField as any,
        { type: 'string', label: 'Text', name: 'text' },
        { type: 'string', label: 'Url', name: 'url' },
    ],
};

// --- Stats Block Schema ---
export const statsBlockSchema: Template = {
    name: "stats",
    label: "Stats",
    fields: [
        sectionBlockSchemaField as any,
        { type: "string", label: "Title", name: "title" },
        { type: "string", label: "Description", name: "description" },
        {
            type: "object", label: "Stats", name: "stats", list: true,
            fields: [
                { type: "number", label: "Stat", name: "stat" },
                { type: "string", label: "Type", name: "type" },
            ],
        },
    ],
};

// --- Call to Action Block Schema ---
export const ctaBlockSchema: Template = {
    name: "cta",
    label: "CTA",
    fields: [
        { type: "string", label: "Title", name: "title" },
        { type: "string", label: "Description", name: "description", ui: { component: "textarea" } },
        {
            label: 'Actions', name: 'actions', type: 'object', list: true,
            fields: [
                { label: 'Label', name: 'label', type: 'string' },
                { label: 'Type', name: 'type', type: 'string', options: [{ label: 'Button', value: 'button' }, { label: 'Link', value: 'link' }] },
                iconSchema as any,
                { label: 'Link', name: 'link', type: 'string' },
            ],
        },
    ],
};