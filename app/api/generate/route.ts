import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promptManager } from '../../../prompts';
import client from '../../../tina/__generated__/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// APIのベースURLを環境変数から取得、なければローカルホストを想定
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

async function callApi(tool: string, params: any) {
  const endpoint = `${API_BASE_URL}/api/${tool.replace(/_/g, '/')}`;
  console.log(`Calling tool API: ${endpoint} with params:`, params);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API call to ${endpoint} failed with status ${response.status}: ${errorBody}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error calling tool API ${endpoint}:`, error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, history = [], filePath: relativeFilePath } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { data: pageData } = await client.queries.page({
      relativePath: "home.mdx",
    });

    let fullPromptContext = await promptManager.generatePrompt(prompt, pageData.page.theme);

    if (relativeFilePath) {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), relativeFilePath);
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8');
        fullPromptContext += `\n\n以下は編集対象の現在のファイル（${relativeFilePath}）の内容です。この内容を考慮して、指示に従ってください。\n\n\`\`\`markdown\n${existingContent}\n\`\`\``;
      } catch (e) {
        console.log(`File not found: ${filePath}, proceeding without existing content.`);
      }
    }

    const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-pro-latest';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(fullPromptContext);
    const response = await result.response;
    const rawContent = response.text();

    let parsedResponse;
    try {
      const cleanedContent = rawContent.replace(/^```json\s*|```$/g, '').trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (e) {
      console.error("JSONのパースに失敗しました:", rawContent);
      return NextResponse.json({ error: "AIからの応答が不正な形式です。" }, { status: 500 });
    }
    
    const { toolCalls, mdxContent, chatResponse } = parsedResponse;

    // --- Tool Calling Logic ---
    if (toolCalls && Array.isArray(toolCalls)) {
      console.warn(`Tool calls detected but no tools are available:`, toolCalls);
      
      for (const call of toolCalls) {
        // 新規ブロック作成ツールは拒否
        if (call.tool === 'generate_component' || call.tool === 'generate/component') {
          console.error(`Blocked tool call: ${call.tool}`);
          return NextResponse.json({
            error: `新規ブロック作成は禁止されています。`,
            chatResponse: chatResponse || `新規ブロックの作成はできません。既存の16種類のブロック（hero、content、testimonial、features、video、callout、stats、cta、profile、gallery、information、pricing_plan、portfolio、company_profile、menu、access_info）を使用してページを構築してください。`,
            history: await chat.getHistory(),
          }, { status: 403 });
        }

        // 存在しないツールの呼び出しをブロック
        if (call.tool === 'update_page_content' || call.tool === 'update/page/content') {
          console.warn(`Blocked unknown tool call: ${call.tool}. Content will be updated via mdxContent field instead.`);
          // ツール呼び出しをスキップして処理を継続
          continue;
        }

        // その他の定義されていないツールもブロック
        console.warn(`Skipping undefined tool call: ${call.tool}`);
      }
    }

    if (mdxContent && typeof mdxContent === 'string' && mdxContent.trim() !== '' && relativeFilePath) {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), relativeFilePath);
      try {
        await fs.writeFile(filePath, mdxContent);
        console.log(`ファイルが正常に更新されました: ${filePath}`);
      } catch (writeError) {
        console.error(`ファイルの書き込みに失敗しました: ${filePath}`, writeError);
        return NextResponse.json({
          error: 'ファイルの書き込みに失敗しました。',
          chatResponse: chatResponse || "ファイルの更新中にエラーが発生しました。"
        }, { status: 500 });
      }
    }

    const newHistory = await chat.getHistory();

    return NextResponse.json({
      success: true,
      chatResponse: chatResponse || "処理が完了しました。",
      contentLength: mdxContent ? mdxContent.length : 0,
      history: newHistory,
    });

  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      return NextResponse.json(
        { error: 'Gemini API key is not valid. Please check your .env.local file.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}