import type { Collection } from 'tinacms';
import { iconSchema } from '../fields/icon';
import { ColorPickerInput } from '../fields/color';
import { heroBlockSchema } from '@/components/blocks/hero';
import { contentBlockSchema } from '@/components/blocks/content';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { featureBlockSchema } from '@/components/blocks/features';
import { videoBlockSchema } from '@/components/blocks/video';
import { calloutBlockSchema } from '@/components/blocks/callout';
import { statsBlockSchema } from '@/components/blocks/stats';
import { ctaBlockSchema } from '@/components/blocks/call-to-action';
import { profileBlockSchema } from '@/components/blocks/profile'; // 手動で追加
import { company_profileBlockSchema } from '@/components/blocks/company_profile';
import { portfolioBlockSchema } from '@/components/blocks/portfolio';
import { pricing_planBlockSchema } from '@/components/blocks/pricing_plan';
import { galleryBlockSchema } from '@/components/blocks/gallery';
import { menuBlockSchema } from '@/components/blocks/menu';
import { informationBlockSchema } from '@/components/blocks/information';
import { access_infoBlockSchema } from '@/components/blocks/access_info';

const Page: Collection = {
  label: 'Home',
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  match: {
    include: 'home',
    exclude: 'uploads/**',
  },
  ui: {
    router: ({ document }) => {
      const filepath = document._sys.breadcrumbs.join('/');
      if (filepath === 'home') {
        return '/';
      }
      return `/${filepath}`;
    },
  },
  fields: [
    {
      type: 'object',
      label: 'Header',
      name: 'header',
      fields: [
        iconSchema as any,
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Color',
          name: 'color',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
          ],
        },
        {
          type: 'object',
          label: 'Nav Links',
          name: 'nav',
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label };
            },
            defaultItem: {
              href: 'home',
              label: 'Home',
            },
          },
          fields: [
            {
              type: 'string',
              label: 'Link',
              name: 'href',
            },
            {
              type: 'string',
              label: 'Label',
              name: 'label',
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Footer',
      name: 'footer',
      fields: [
        {
          type: 'object',
          label: 'Social Links',
          name: 'social',
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.icon?.name || 'undefined' };
            },
          },
          fields: [
            iconSchema as any,
            {
              type: 'string',
              label: 'Url',
              name: 'url',
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Theme',
      name: 'theme',
      // @ts-ignore
      fields: [
        {
          type: 'string',
          label: 'Primary Color',
          name: 'color',
          ui: {
            component: ColorPickerInput,
          },
        },
        {
          type: 'string',
          label: 'Text Color',
          name: 'textColor',
          ui: {
            component: ColorPickerInput,
          },
        },
        {
          type: 'string',
          label: 'Heading Color',
          name: 'headingColor',
          ui: {
            component: ColorPickerInput,
          },
        },
        {
          type: 'string',
          name: 'font',
          label: 'Font Family',
          options: [
            {
              label: 'System Sans',
              value: 'sans',
            },
            {
              label: 'Nunito',
              value: 'nunito',
            },
            {
              label: 'Lato',
              value: 'lato',
            },
          ],
        },
        {
          type: 'string',
          name: 'darkMode',
          label: 'Dark Mode',
          options: [
            {
              label: 'System',
              value: 'system',
            },
            {
              label: 'Light',
              value: 'light',
            },
            {
              label: 'Dark',
              value: 'dark',
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      list: true,
      name: 'blocks',
      label: 'Sections',
      ui: {
        visualSelector: true,
      },
      templates: [
        heroBlockSchema,
        calloutBlockSchema,
        featureBlockSchema,
        statsBlockSchema,
        ctaBlockSchema,
        contentBlockSchema,
        testimonialBlockSchema,
        videoBlockSchema,
        profileBlockSchema, // 手動で追加
        company_profileBlockSchema,
        portfolioBlockSchema,
        pricing_planBlockSchema,
        galleryBlockSchema,
        menuBlockSchema,
        informationBlockSchema,
        access_infoBlockSchema,
      ],
    },
  ],
};

export default Page;
