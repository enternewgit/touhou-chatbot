// app/page.tsx
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
    console.log('handleCharacterSelect called with:', characterId);
    console.log('Current state before:', currentState);
    setSelectedCharacter(characterId);
    setCurrentState('chat');
    console.log('State updated to chat');
  };

  // 戻るボタンが押された時の処理
  const handleBack = () => {
    setCurrentState('character-select');
    setSelectedCharacter('');
  };

  // 現在の状態に応じて表示するコンポーネントを切り替え
  console.log('Rendering with currentState:', currentState, 'selectedCharacter:', selectedCharacter);
  
  switch (currentState) {
    case 'character-select':
      return <CharacterSelect onCharacterSelect={handleCharacterSelect} />;
    case 'chat':
      return <ChatScreen characterId={selectedCharacter} onBack={handleBack} />;
    default:
      return <CharacterSelect onCharacterSelect={handleCharacterSelect} />;
  }
}
