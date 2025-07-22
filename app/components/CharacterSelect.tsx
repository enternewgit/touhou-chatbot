'use client';

import React, { useState, useEffect } from 'react';
import { getAllChatHistories, clearAllChatHistories, type ChatHistory } from '../utils/chatHistory';

// キャラクター情報の型定義
interface Character {
  id: string;
  name: string;
  full_name: string;
  description: string;
  avatar: string;
}

// 静的ファイル用のキャラクター型定義
interface StaticCharacter {
  id: string;
  name: string;
  description: string;
  avatar: string;
}

// プロパティの型定義
interface CharacterSelectProps {
  onCharacterSelect: (characterId: string) => void;
}

export default function CharacterSelect({ onCharacterSelect }: CharacterSelectProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<{ [characterId: string]: ChatHistory }>({});

  // キャラクター一覧を取得
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // まず内蔵データを即座に表示
        const builtInCharacters = [
          {
            id: 'reimu',
            name: '博麗霊夢',
            full_name: '博麗 霊夢（はくれい れいむ）',
            description: '楽園の巫女。いつも気怠そうにしているが、実は強い責任感を持つ。',
            avatar: '/characters/reimu.png'
          },
          {
            id: 'marisa',
            name: '霧雨魔理沙',
            full_name: '霧雨 魔理沙（きりさめ まりさ）',
            description: '普通の魔法使い。努力家で向上心が強く、常に新しい魔法を研究している。',
            avatar: '/characters/marisa.png'
          },
          {
            id: 'sakuya',
            name: '十六夜咲夜',
            full_name: '十六夜 咲夜（いざよい さくや）',
            description: '紅魔館のメイド長。時を操る能力を持ち、完璧な仕事ぶりで知られる。',
            avatar: '/characters/sakuya.png'
          },
          {
            id: 'yuyuko',
            name: '西行寺幽々子',
            full_name: '西行寺 幽々子（さいぎょうじ ゆゆこ）',
            description: '白玉楼の主。死を司る能力を持つが、おっとりとした性格で食いしん坊。',
            avatar: '/characters/yuyuko.png'
          }
        ];
        
        // 即座に表示
        setCharacters(builtInCharacters);
        setLoading(false);
        
        // バックグラウンドで外部データを試行（オプション）
        try {
          const response = await fetch('/characters.json', {
            headers: {
              'Cache-Control': 'max-age=3600'
            }
          });
          
          if (response.ok) {
            const charactersData: Record<string, StaticCharacter> = await response.json();
            const charactersArray = Object.values(charactersData).map((char: StaticCharacter) => ({
              id: char.id,
              name: char.name,
              full_name: char.name,
              description: char.description,
              avatar: char.avatar
            }));
            
            // 外部データで更新（あれば）
            setCharacters(charactersArray);
          }
        } catch (err) {
          // 外部データの読み込みが失敗しても、既に内蔵データで表示済み
          console.log('外部データの読み込みに失敗しましたが、内蔵データで動作中です');
        }
        
      } catch (err) {
        console.error('予期しないエラー:', err);
        // 上記で既に内蔵データは設定済みなので、特に追加処理は不要
      }
    };

    fetchCharacters();
  }, []);

  // チャット履歴を取得
  useEffect(() => {
    const loadChatHistories = () => {
      const histories = getAllChatHistories();
      // 配列を辞書形式に変換
      const historyMap: { [characterId: string]: ChatHistory } = {};
      histories.forEach(history => {
        historyMap[history.characterId] = history;
      });
      setChatHistories(historyMap);
    };

    loadChatHistories();
  }, []);

  // キャラクターアイコンの色を取得
  const getCharacterColor = (characterId: string): string => {
    const colorMap: { [key: string]: string } = {
      reimu: 'bg-red-400',
      marisa: 'bg-yellow-400',
      sakuya: 'bg-blue-400',
      yuyuko: 'bg-pink-400'
    };
    return colorMap[characterId] || 'bg-gray-400';
  };

  // キャラクターの絵文字を取得
  const getCharacterEmoji = (characterId: string): string => {
    const emojiMap: { [key: string]: string } = {
      reimu: '🪡', // 巫女の針
      marisa: '⭐', // 魔法使いの星
      sakuya: '🔪', // メイドのナイフ
      yuyuko: '🌸'  // 桜
    };
    return emojiMap[characterId] || '❓';
  };

  // 最後のメッセージを取得
  const getLastMessage = (characterId: string): string | null => {
    const history = chatHistories[characterId];
    if (!history || history.messages.length === 0) {
      return null;
    }
    const lastMessage = history.messages[history.messages.length - 1];
    return lastMessage.text;
  };

  // 最後のメッセージ時間を取得
  const getLastMessageTime = (characterId: string): string => {
    const history = chatHistories[characterId];
    if (!history || history.messages.length === 0) return '';
    
    const lastTimestamp = history.lastUpdated;
    const now = Date.now();
    const diff = now - lastTimestamp;
    
    if (diff < 60000) return '今';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}日前`;
    
    const date = new Date(lastTimestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 全てのチャット履歴を削除
  const clearAllHistories = () => {
    if (window.confirm('全てのキャラクターとの会話履歴を削除しますか？この操作は取り消せません。')) {
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
        <header className="bg-white p-4 shadow-sm border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 text-center">
            チャット相手を選択
          </h1>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-lg mb-2">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* LINEライクなヘッダー */}
      <header className="bg-white p-4 shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800 text-center">
              チャット相手を選択
            </h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              話したいキャラクターをタップしてください
            </p>
          </div>
          
          {/* 全履歴削除ボタン（履歴がある場合のみ表示） */}
          {Object.keys(chatHistories).length > 0 && (
            <button
              onClick={clearAllHistories}
              className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
              title="全ての会話履歴を削除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* キャラクター一覧 */}
      <main className="flex-1 bg-white">
        <div className="divide-y divide-gray-100">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => onCharacterSelect(character.id)}
              className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors duration-150"
            >
              {/* キャラクターアイコン */}
              <div className={`w-12 h-12 rounded-full ${getCharacterColor(character.id)} flex items-center justify-center text-white text-lg font-bold mr-4 flex-shrink-0 shadow-sm`}>
                {getCharacterEmoji(character.id)}
              </div>

              {/* キャラクター情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {character.name}
                  </h3>
                  <div className="text-xs text-gray-400 ml-2">
                    {getLastMessageTime(character.id)}
                  </div>
                </div>
                
                {/* 最後のメッセージまたは説明を表示 */}
                <p className="text-sm text-gray-500 truncate mt-1">
                  {getLastMessage(character.id) || character.description}
                </p>
                
                <p className="text-xs text-gray-400 mt-1">
                  {character.full_name}
                </p>
              </div>

              {/* 右矢印アイコン */}
              <div className="text-gray-400 ml-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* 空きスペースを埋めるための要素 */}
        <div className="bg-gray-50 h-full"></div>
      </main>

      {/* フッター情報 */}
      <footer className="bg-white p-4 border-t border-gray-200">
        <p className="text-center text-xs text-gray-500">
          東方Project チャットボット
        </p>
      </footer>
    </div>
  );
}
