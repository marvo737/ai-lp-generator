"use client";

import React, { useState, FormEvent, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface DisplayMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

const EditorClient = () => {
  const [history, setHistory] = useState<Message[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'admin'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const targetPage = 'home.mdx';

  useEffect(() => {
    // ローカルストレージからチャット履歴を読み込む
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      const savedDisplayMessages = localStorage.getItem('chatDisplayMessages');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      if (savedDisplayMessages) {
        setDisplayMessages(JSON.parse(savedDisplayMessages));
      }
    } catch (error) {
      console.error("Failed to parse chat history from local storage", error);
    }
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(history));
      localStorage.setItem('chatDisplayMessages', JSON.stringify(displayMessages));
    } catch (error) {
      console.error("Failed to save chat history to local storage", error);
    }
  }, [history, displayMessages]);

  const handleClearHistory = () => {
    setHistory([]);
    setDisplayMessages([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userDisplayMessage: DisplayMessage = { role: 'user', text: input };
    setDisplayMessages((prev) => [...prev, userDisplayMessage]);
    
    const newHistory: Message[] = [...history, { role: 'user', parts: [{ text: input }] }];

    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          history: newHistory,
          filePath: `content/pages/${targetPage}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      const data = await response.json();

      setHistory(data.history);
      setDisplayMessages(prev => [...prev, { role: 'model', text: data.chatResponse }]);

      if (data.contentLength > 0) {
        setDisplayMessages(prev => [...prev, { role: 'system', text: `レイアウトが更新されました。プレビューをリロードします。` }]);
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      setDisplayMessages((prev) => [...prev, { role: 'system', text: `エラー: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Left Column: Chat UI */}
      <div className="w-1/3 flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">AI LP Generator</h1>
        </div>
        <div className="flex-grow flex flex-col overflow-y-auto">
          {/* History Control Area */}
          <div className="p-2 border-gray-100 flex justify-end bg-white">
            <button
              onClick={handleClearHistory}
              className="px-3 py-1 text-xs rounded-md bg-red-400 text-white hover:bg-red-500 transition-colors"
              title="Clear chat history"
            >
              履歴を削除
            </button>
          </div>
          <div className="flex-grow p-4">
            <div className="space-y-4">
            {displayMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs ${
                  msg.role === 'user' ? 'bg-blue-500 text-white' :
                  msg.role === 'system' ? 'bg-yellow-200 text-gray-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-gray-200 text-gray-500">
                  生成中...
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="生成したいランディングページの内容を指示してください..."
              rows={4}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? '生成中...' : '送信'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="w-2/3 flex flex-col">
        <div className="bg-gray-100 px-4 pt-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white text-gray-900 border-gray-300 shadow-sm'
                  : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors ${
                viewMode === 'admin'
                  ? 'bg-white text-gray-900 border-gray-300 shadow-sm'
                  : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'
              }`}
            >
              Visual Editor
            </button>
          </div>
          <div className="border-b border-gray-300"></div>
        </div>
        <div className="flex-grow p-4">
          <div className="w-full h-full bg-white rounded-lg shadow-md">
            <iframe
              ref={iframeRef}
              src={viewMode === 'preview' ? '/' : '/admin/index.html'}
              className="w-full h-full border-0"
              title="Live Preview"
              key={viewMode} // Add key to force iframe re-creation on src change
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorClient;