import React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';

export const colorOptions = ['blue', 'teal', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'white'];

export const ColorPickerInput = wrapFieldsWithMeta(({ input }) => {
  return (
    <input
      type='text'
      id={input.name}
      className='w-full h-10 px-3 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-blue-400'
      {...input}
    />
  );
});
