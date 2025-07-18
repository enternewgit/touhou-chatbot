// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import CharacterSelect from './components/CharacterSelect';
import ChatScreen from './components/ChatScreen';

// アプリの状態タイプ
type AppState = 'character-select' | 'chat';

// メインアプリケーションコンポーネント
export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('character-select');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');

  // キャラクター選択時の処理
  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
    setCurrentState('chat');
  };

  // 戻るボタンが押された時の処理
  const handleBack = () => {
    setCurrentState('character-select');
    setSelectedCharacter('');
  };

  // 現在の状態に応じて表示するコンポーネントを切り替え
  switch (currentState) {
    case 'character-select':
      return <CharacterSelect onCharacterSelect={handleCharacterSelect} />;
    case 'chat':
      return <ChatScreen characterId={selectedCharacter} onBack={handleBack} />;
    default:
      return <CharacterSelect onCharacterSelect={handleCharacterSelect} />;
  }
}
