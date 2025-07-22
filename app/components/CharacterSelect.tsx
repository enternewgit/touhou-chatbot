'use client';

import React, { useState, useEffect } from 'react';
import { getAllChatHistories, clearAllChatHistories, type ChatHistory } from '../utils/chatHistory';
import { CHARACTERS, type Character } from '../constants/characters';

// プロパティの型定義
interface CharacterSelectProps {
  onCharacterSelect: (characterId: string) => void;
}

export default function CharacterSelect({ onCharacterSelect }: CharacterSelectProps) {
  // 即座に利用可能な静的データ
  const characters = CHARACTERS;
  const [chatHistories, setChatHistories] = useState<{ [characterId: string]: ChatHistory }>({});

  // チャット履歴のみを非同期で取得
  useEffect(() => {
    try {
      const historiesArray = getAllChatHistories();
      const historiesObject = historiesArray.reduce((acc, history) => {
        acc[history.characterId] = history;
        return acc;
      }, {} as { [characterId: string]: ChatHistory });
      setChatHistories(historiesObject);
    } catch (error) {
      console.error('チャット履歴の読み込みエラー:', error);
      // エラーが発生してもキャラクター選択は表示される
    }
  }, []);

  // チャット履歴をクリア
  const handleClearHistory = () => {
    if (confirm('全てのチャット履歴を削除しますか？')) {
      clearAllChatHistories();
      setChatHistories({});
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-50">
      {/* ヘッダー - LINEライク */}
      <header className="bg-green-500 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">チャット相手を選択</h1>
          {Object.keys(chatHistories).length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full transition-colors"
            >
              履歴削除
            </button>
          )}
        </div>
      </header>

      {/* キャラクター一覧 - LINEの連絡先リストライク */}
      <div className="flex-1 overflow-y-auto bg-white">
        {characters.map((character, index) => {
          const hasHistory = chatHistories[character.id];
          return (
            <div
              key={character.id}
              onClick={() => {
                console.log('Character clicked:', character.id);
                onCharacterSelect(character.id);
              }}
              className={`flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                index === 0 ? '' : 'border-t-0'
              }`}
            >
              {/* アバター - LINEライク */}
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                <img 
                  src={character.avatar} 
                  alt={character.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-xl">👤</span>';
                    }
                  }}
                />
              </div>
              
              {/* キャラクター情報 - LINEライク */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {character.name}
                  </h3>
                  {hasHistory && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-500">
                        {new Date(hasHistory.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {character.description}
                </p>
              </div>
              
              {/* 右矢印アイコン */}
              <div className="ml-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* フッター */}
      <footer className="bg-gray-100 p-3 border-t border-gray-200">
        <p className="text-center text-xs text-gray-500">
          Touhou Project チャットボット v2.0
        </p>
      </footer>
    </div>
  );
}
