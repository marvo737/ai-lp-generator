import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'あなたはWebサイトのコンテンツを生成するプロのライターです。TinaCMSで利用可能なMarkdown形式でコンテンツを生成してください。フロントマターも必ず含めてください。' }],
        },
        {
          role: 'model',
          parts: [{ text: '承知いたしました。どのようなコンテンツを生成しますか？' }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const generatedContent = response.text();

    // 生成されたコンテンツをファイルに書き込む
    const filePath = path.join(process.cwd(), 'content', 'pages', 'home.mdx');
    fs.writeFileSync(filePath, generatedContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      return NextResponse.json({ error: 'Gemini API key is not valid. Please check your .env.local file.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}