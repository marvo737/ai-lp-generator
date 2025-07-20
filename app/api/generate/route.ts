import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promptManager, promptGenerator } from '../../../prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 改良されたAPI Route実装
export async function POST(request: Request) {
  try {
    const { prompt, config } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (config) {
      promptManager.updateConfig(config);
    }

    const fullPromptContext = await promptManager.generatePrompt(prompt);
    const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-pro-latest';
    const model = genAI.getGenerativeModel({
      model: modelName,
      // GeminiにJSONモードを強制する
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: fullPromptContext }],
        },
        {
          role: 'model',
          parts: [{ text: JSON.stringify({
            mdxContent: null,
            chatResponse: "承知いたしました。提供されたスキーマ定義とテンプレート構造を完全に理解しました。厳密なJSON形式に従って、新しいコンテンツを生成します。どのようなテーマで作成しますか？"
          }) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: process.env.GEMINI_MAX_OUTPUT_TOKENS ? parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 10) : 8192,
        temperature: process.env.GEMINI_TEMPERATURE ? parseFloat(process.env.GEMINI_TEMPERATURE) : 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const rawContent = response.text();

    let parsedResponse;
    try {
      // AIの応答がマークダウンのコードブロックで囲まれている場合を考慮して整形する
      const cleanedContent = rawContent.replace(/^```json\s*|```$/g, '').trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (e) {
      console.error("JSONのパースに失敗しました:", rawContent);
      return NextResponse.json({ error: "AIからの応答が不正な形式です。" }, { status: 500 });
    }
    
    const { mdxContent, chatResponse } = parsedResponse;

    // mdxContentが存在し、空でない場合のみファイルに書き込む
    if (mdxContent && typeof mdxContent === 'string' && mdxContent.trim() !== '') {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'content', 'pages', 'home.mdx');
      
      try {
        await fs.writeFile(filePath, mdxContent);
        console.log(`ファイルが正常に更新されました: ${filePath}`);
      } catch (writeError) {
        console.error(`ファイルの書き込みに失敗しました: ${filePath}`, writeError);
        // フロントエンドにはエラーを返すが、チャットの応答は続ける
        return NextResponse.json({
          error: 'ファイルの書き込みに失敗しました。',
          chatResponse: chatResponse || "ファイルの更新中にエラーが発生しました。"
        }, { status: 500 });
      }
    }

    const stats = promptManager.getStats();

    // フロントエンドには常にchatResponseを返す
    return NextResponse.json({
      success: true,
      chatResponse: chatResponse || "処理が完了しました。",
      stats,
      contentLength: mdxContent ? mdxContent.length : 0
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

// 設定管理エンドポイント
export async function GET() {
  const stats = promptManager.getStats();
  const availableTemplates = promptGenerator.generateSchemaDocumentation();
  
  return NextResponse.json({
    stats,
    availableBlocks: Object.keys(JSON.parse(
      require('fs').readFileSync(
        require('path').join(process.cwd(), 'prompts/block-schemas.json'),
        'utf-8'
      )
    ).blocks),
    schemaPreview: availableTemplates.substring(0, 500) + '...'
  });
}

// キャッシュクリア用エンドポイント
export async function DELETE() {
  promptManager.clearCache();
  return NextResponse.json({ success: true, message: 'Cache cleared' });
}