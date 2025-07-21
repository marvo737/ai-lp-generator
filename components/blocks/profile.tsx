import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import type { Template } from 'tinacms';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { PageBlocksProfile } from '@/tina/__generated__/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

// --- Component ---
export const Profile = ({ data }: { data: PageBlocksProfile }) => {
  return (
    <Section background={data.background!}>
      <div className="container mx-auto flex justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {data.avatar && (
              <Avatar className="w-24 h-24 mx-auto mb-4" data-tina-field={tinaField(data, 'avatar')}>
                <AvatarImage src={data.avatar} alt={data.name || 'User Avatar'} />
                <AvatarFallback>{data.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            {data.name && (
              <CardTitle data-tina-field={tinaField(data, 'name')} className="text-2xl font-bold">
                {data.name}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {data.bio && (
              <p data-tina-field={tinaField(data, 'bio')} className="text-muted-foreground text-center">
                {data.bio}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
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