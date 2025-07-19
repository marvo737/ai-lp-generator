"use client";

import React, { useState, FormEvent, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
}

const AiEditorPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'admin'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load messages from local storage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error("Failed to parse chat history from local storage", error);
    }
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to local storage", error);
    }
  }, [messages]);

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      setMessages((prev) => [...prev, { role: 'system', text: 'コンテンツが正常に更新されました。プレビューをリロードします。' }]);
      
      // Reload the iframe to show the updated content
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      setMessages((prev) => [...prev, { role: 'system', text: `エラー: ${errorMessage}` }]);
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
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
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