'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  getChatHistory, 
  saveChatHistory, 
  deleteChatHistory 
} from '../utils/chatHistory';

// キャラクター情報の型定義
interface Character {
  id: string;
  name: string;
  full_name: string;
  description: string;
  avatar: string;
}

// プロパティの型定義
interface ChatScreenProps {
  characterId: string;
  onBack: () => void;
}

export default function ChatScreen({ characterId, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // キャラクター情報を取得
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const response = await fetch(`${apiUrl}/characters/${characterId}`);
        if (response.ok) {
          const data = await response.json();
          setCharacter(data);
        }
      } catch (error) {
        console.error('キャラクター情報の取得に失敗しました:', error);
      }
    };

    fetchCharacter();
  }, [characterId]);

  // チャット履歴を読み込み
  useEffect(() => {
    const loadChatHistory = () => {
      const history = getChatHistory(characterId);
      setMessages(history);
    };

    loadChatHistory();
  }, [characterId]);

  // メッセージが変更された時に履歴を保存
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(characterId, messages);
    }
  }, [messages, characterId]);

  // メッセージが更新されるたびに一番下までスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // キャラクターアイコンの色を取得
  const getCharacterColor = (charId: string): string => {
    const colorMap: { [key: string]: string } = {
      reimu: 'bg-red-400',
      marisa: 'bg-yellow-400',
      sakuya: 'bg-blue-400',
      yuyuko: 'bg-pink-400'
    };
    return colorMap[charId] || 'bg-gray-400';
  };

  // キャラクターの絵文字を取得
  const getCharacterEmoji = (charId: string): string => {
    const emojiMap: { [key: string]: string } = {
      reimu: '🪡',
      marisa: '⭐',
      sakuya: '🔪',
      yuyuko: '🌸'
    };
    return emojiMap[charId] || '❓';
  };

  // メッセージ送信処理
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (input.trim() === '') return;

    const userMessage: Message = { 
      id: uuidv4(), 
      text: input, 
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.text,
          character_id: characterId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'APIからの応答に失敗しました。');
      }

      const data = await response.json();
      const characterMessage: Message = { 
        id: uuidv4(), 
        text: data.reply, 
        sender: 'character',
        timestamp: Date.now()
      };
      setMessages((prevMessages) => [...prevMessages, characterMessage]);

    } catch (error) {
      console.error('メッセージ送信中にエラーが発生しました:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        text: `エラーが発生しました…メッセージが届かなかったようです。 (${error instanceof Error ? error.message : String(error)})`,
        sender: 'character',
        timestamp: Date.now()
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // チャット履歴を削除
  const clearChatHistory = () => {
    if (window.confirm(`${character?.name}との会話履歴を削除しますか？`)) {
      setMessages([]);
      deleteChatHistory(characterId);
    }
  };

  if (!character) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">キャラクター情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-200 font-inter">
      {/* LINEライクなヘッダー */}
      <header className="bg-white text-gray-800 p-4 shadow-sm flex items-center border-b border-gray-200">
        {/* 戻るボタン */}
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* キャラクターアイコン */}
        <div className={`w-10 h-10 rounded-full ${getCharacterColor(characterId)} flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0`}>
          {getCharacterEmoji(characterId)}
        </div>

        {/* キャラクター情報 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold tracking-tight truncate">
            {character.name}
          </h1>
          <p className="text-sm text-gray-500 truncate">
            {character.description}
          </p>
        </div>

        {/* オプションボタン */}
        <button 
          onClick={clearChatHistory}
          className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
          title="チャット履歴を削除"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </header>

      {/* チャットメッセージ表示エリア */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-100 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <div className={`w-16 h-16 rounded-full ${getCharacterColor(characterId)} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                {getCharacterEmoji(characterId)}
              </div>
              <p className="text-lg">{character.name}が待ってるよ！</p>
              <p className="text-sm">何か話しかけてみてね！</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'character' && (
                <div className={`w-8 h-8 rounded-full ${getCharacterColor(characterId)} flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0`}>
                  {getCharacterEmoji(characterId)}
                </div>
              )}

              <div
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-green-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`w-8 h-8 rounded-full ${getCharacterColor(characterId)} flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0`}>
                {getCharacterEmoji(characterId)}
              </div>
              <div className="max-w-[75%] p-3 rounded-2xl shadow-sm bg-white text-gray-800 rounded-bl-md animate-pulse">
                {character.name}が考え中…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 入力フォーム */}
      <footer className="p-4 bg-white shadow-lg border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex max-w-3xl mx-auto space-x-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${character.name}にメッセージを送る…`}
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l4.453-1.48a1 1 0 00.67-.28l4.962-4.962a1 1 0 00-1.414-1.414L9 10.586V6a1 1 0 10-2 0v4.586L3.553 8.118a1 1 0 00-1.409 1.169l14 7a1 1 0 001.409-1.169l-7-14z" />
            </svg>
            <span className="ml-2 hidden sm:inline">送信</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
