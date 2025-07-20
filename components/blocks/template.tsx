import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import { Section } from '../layout/section';

export const Template = ({ data }: { data: any }) => {
  return (
    <Section background={data.background!}>
      <div data-tina-field={tinaField(data, "message")}>
        {data.message}
      </div>
    </Section>
  );
};