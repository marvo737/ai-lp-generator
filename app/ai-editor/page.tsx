import { Metadata } from 'next';
import EditorClient from './editor-client';

export const metadata: Metadata = {
  title: 'AI LP Generator',
};

const AiEditorPage = () => {
  return <EditorClient />;
};

export default AiEditorPage;