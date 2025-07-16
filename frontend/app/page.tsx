// src/app/page.tsx
'use client'; // クライアントコンポーネントとしてマーク

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid'; // uuid ライブラリをインポート

// メッセージの型定義
interface Message {
  id: string; // IDを文字列型に変更 (UUIDのため)
  text: string;
  sender: 'user' | 'reimu'; // 送信者がユーザーか霊夢か
}

// メインのチャットページコンポーネント
export default function App() {
  // チャットメッセージの状態管理
  const [messages, setMessages] = useState<Message[]>([]);
  // ユーザー入力の状態管理
  const [input, setInput] = useState<string>('');
  // メッセージ送信中のローディング状態
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // チャットの一番下までスクロールするための参照
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが更新されるたびに一番下までスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // メッセージ送信処理
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ

    if (input.trim() === '') return; // 入力が空の場合は何もしない

    // UUID を使用してユニークなIDを生成
    const userMessage: Message = { id: uuidv4(), text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // ユーザーメッセージを追加
    setInput(''); // 入力フィールドをクリア
    setIsLoading(true); // ローディング開始

    try {
      // バックエンドAPIへのリクエスト
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }), // userMessage.text を送信
      });

      if (!response.ok) {
        // HTTPエラーの場合
        const errorData = await response.json();
        throw new Error(errorData.error || 'APIからの応答に失敗しました。');
      }

      const data = await response.json(); // レスポンスをJSONとして解析
      const reimuMessage: Message = { id: uuidv4(), text: data.reply, sender: 'reimu' }; // UUID を使用
      setMessages((prevMessages) => [...prevMessages, reimuMessage]); // 霊夢の返答を追加

    } catch (error) {
      console.error('メッセージ送信中にエラーが発生しました:', error);
      const errorMessage: Message = {
        id: uuidv4(), // UUID を使用
        text: `エラーが発生したわ…あんたのメッセージが届かなかったみたいね。 (${error instanceof Error ? error.message : String(error)})`,
        sender: 'reimu',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]); // エラーメッセージを表示
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-200 font-inter"> {/* 全体背景を明るいグレーに */}
      {/* ヘッダー */}
      <header className="bg-white text-gray-800 p-4 shadow-md flex items-center justify-center border-b border-gray-200">
        <h1 className="text-2xl font-semibold tracking-tight">博麗霊夢チャット</h1>
      </header>

      {/* チャットメッセージ表示エリア */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-100 custom-scrollbar"> {/* チャット背景をさらに明るいグレーに */}
        <div className="max-w-3xl mx-auto space-y-3"> {/* メッセージ間のスペースを調整 */}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">霊夢が待ってるわよ。</p>
              <p className="text-sm">何か話しかけてみてね！</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'reimu' && (
                // 霊夢のアイコン
                <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0">
                  {/* シンプルな霊夢のイニシャルまたは絵文字 */}
                  霊夢
                  {/* またはSVGアイコンの例（必要に応じて調整） */}
                  {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg> */}
                </div>
              )}

              <div
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${ // 角をより丸く、影を控えめに
                  msg.sender === 'user'
                    ? 'bg-lime-500 text-white rounded-br-md' // ユーザーメッセージの色と角
                    : 'bg-gray-100 text-gray-800 rounded-bl-md' // 霊夢メッセージの色と角
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] p-3 rounded-2xl shadow-sm bg-gray-100 text-gray-800 rounded-bl-md animate-pulse">
                霊夢が考え中…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* スクロールターゲット */}
        </div>
      </main>

      {/* 入力フォーム */}
      <footer className="p-4 bg-white shadow-lg border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex max-w-3xl mx-auto space-x-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="霊夢にメッセージを送る…"
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-400 text-gray-700" // フォーカス時のリング色とテキスト色
            disabled={isLoading} // 送信中は入力不可
          />
          <button
            type="submit"
            className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading} // 送信中はボタン無効
          >
            {/* 送信ボタンのアイコン（シンプルなSVGを使用） */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l4.453-1.48a1 1 0 00.67-.28l4.962-4.962a1 1 0 00-1.414-1.414L9 10.586V6a1 1 0 10-2 0v4.586L3.553 8.118a1 1 0 00-1.409 1.169l14 7a1 1 0 001.409-1.169l-7-14z" />
            </svg>
            <span className="ml-2 hidden sm:inline">送信</span> {/* 小画面ではテキスト非表示 */}
          </button>
        </form>
      </footer>
    </div>
  );
}
