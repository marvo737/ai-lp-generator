import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const pagesDirectory = path.join(process.cwd(), 'content', 'pages');
    const files = await fs.readdir(pagesDirectory);
    const mdxFiles = files.filter(
      (file) => path.extname(file) === '.mdx'
    );
    return NextResponse.json(mdxFiles);
  } catch (error) {
    console.error('Failed to read pages directory:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve page list.' },
      { status: 500 }
    );
  }
}