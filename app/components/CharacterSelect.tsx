'use client';

import React, { useState, useEffect } from 'react';
import { getAllChatHistories, clearAllChatHistories, type ChatHistory } from '../utils/chatHistory';
import { CHARACTERS, type Character } from '../constants/characters';

// プロパティの型定義
interface CharacterSelectProps {
  onCharacterSelect: (characterId: string) => void;
}

export default function CharacterSelect({ onCharacterSelect }: CharacterSelectProps) {
  const [characters] = useState<Character[]>(CHARACTERS); // 静的データで初期化
  const [loading] = useState(false); // 読み込み不要なのでfalse固定
  const [error] = useState<string | null>(null); // エラーも発生しないのでnull固定
  const [chatHistories, setChatHistories] = useState<{ [characterId: string]: ChatHistory }>({});

  // チャット履歴を取得（初期化時のみ）
  useEffect(() => {
    const loadChatHistories = () => {
      const historiesArray = getAllChatHistories();
      // 配列をオブジェクトに変換
      const historiesObject = historiesArray.reduce((acc, history) => {
        acc[history.characterId] = history;
        return acc;
      }, {} as { [characterId: string]: ChatHistory });
      setChatHistories(historiesObject);
    };

    loadChatHistories();
  }, []);

  // チャット履歴をクリア
  const handleClearHistory = () => {
    if (confirm('全てのチャット履歴を削除しますか？')) {
      clearAllChatHistories();
      setChatHistories({});
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white p-4 shadow-sm border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 text-center">
            チャット相手を選択
          </h1>
        </header>
        
        {/* ローディング画面 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">キャラクター情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white p-4 shadow-sm border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 text-center">
            チャット相手を選択
          </h1>
        </header>
        
        {/* エラー画面 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white p-4 shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            チャット相手を選択
          </h1>
          {Object.keys(chatHistories).length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              履歴をクリア
            </button>
          )}
        </div>
      </header>

      {/* キャラクター一覧 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {characters.map((character) => {
            const hasHistory = chatHistories[character.id];
            return (
              <div
                key={character.id}
                onClick={() => onCharacterSelect(character.id)}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 cursor-pointer transition-all duration-200 relative"
              >
                {/* 履歴アイコン */}
                {hasHistory && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                )}
                
                {/* アバター */}
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={character.avatar} 
                    alt={character.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-2xl">👤</span>';
                      }
                    }}
                  />
                </div>
                
                {/* キャラクター情報 */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">
                    {character.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {character.full_name}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {character.description}
                  </p>
                  
                  {/* 履歴情報 */}
                  {hasHistory && (
                    <div className="mt-2 text-xs text-green-600">
                      前回の会話: {new Date(hasHistory.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-white p-4 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500">
          キャラクターを選択してチャットを開始してください
        </p>
      </footer>
    </div>
  );
}
