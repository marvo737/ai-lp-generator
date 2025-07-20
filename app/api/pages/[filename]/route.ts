import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const pagesDirectory = path.join(process.cwd(), 'content', 'pages');

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const filePath = path.join(pagesDirectory, `${filename}.mdx`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data: frontmatter } = matter(fileContent);

    return NextResponse.json(frontmatter);
  } catch (error) {
    console.error(`Failed to read page: ${params.filename}`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve page data.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const filePath = path.join(pagesDirectory, `${filename}.mdx`);
    const body = await request.json();

    const fileContent = await fs.readFile(filePath, 'utf8');
    const { content } = matter(fileContent);
    
    const newContent = matter.stringify(content, body);

    await fs.writeFile(filePath, newContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to update page: ${params.filename}`, error);
    return NextResponse.json(
      { error: 'Failed to update page data.' },
      { status: 500 }
    );
  }
}