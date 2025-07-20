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

const AiEditorPage = () => {
  const [history, setHistory] = useState<Message[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'admin'>('preview');
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // ページ一覧を取得
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/pages');
        if (!response.ok) {
          throw new Error('Failed to fetch pages');
        }
        const data = await response.json();
        setPages(data);
        if (data.length > 0) {
          setSelectedPage(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pages.');
      }
    };
    fetchPages();

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
    if (!input.trim() || isLoading || !selectedPage) return;

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
          filePath: `content/pages/${selectedPage}`
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
        setDisplayMessages(prev => [...prev, { role: 'system', text: `「${selectedPage}」が更新されました。プレビューをリロードします。` }]);
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
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Content Generator</h1>
          <button
            onClick={handleClearHistory}
            className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
            title="Clear chat history"
          >
            Clear
          </button>
        </div>
        <div className="p-4 border-b">
          <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-1">
            編集するページ
          </label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || pages.length === 0}
          >
            {pages.length > 0 ? (
              pages.map(page => <option key={page} value={page}>{page}</option>)
            ) : (
              <option>Loading pages...</option>
            )}
          </select>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
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
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Live Preview</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              TinaCMS Admin
            </button>
          </div>
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

export default AiEditorPage;