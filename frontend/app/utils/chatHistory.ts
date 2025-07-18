// チャット履歴管理のためのユーティリティ関数

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
  timestamp: number; // 送信時刻を追加
}

export interface ChatHistory {
  characterId: string;
  messages: Message[];
  lastUpdated: number;
}

// ローカルストレージのキー
const CHAT_HISTORY_KEY = 'touhou_chat_history';

// 全てのチャット履歴を取得
export const getAllChatHistories = (): ChatHistory[] => {
  if (typeof window === 'undefined') return []; // SSR対応
  
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('チャット履歴の読み込みに失敗しました:', error);
    return [];
  }
};

// 特定のキャラクターのチャット履歴を取得
export const getChatHistory = (characterId: string): Message[] => {
  const histories = getAllChatHistories();
  const history = histories.find(h => h.characterId === characterId);
  return history ? history.messages : [];
};

// チャット履歴を保存
export const saveChatHistory = (characterId: string, messages: Message[]): void => {
  if (typeof window === 'undefined') return; // SSR対応
  
  try {
    const histories = getAllChatHistories();
    const existingIndex = histories.findIndex(h => h.characterId === characterId);
    
    const chatHistory: ChatHistory = {
      characterId,
      messages,
      lastUpdated: Date.now()
    };
    
    if (existingIndex >= 0) {
      histories[existingIndex] = chatHistory;
    } else {
      histories.push(chatHistory);
    }
    
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(histories));
  } catch (error) {
    console.error('チャット履歴の保存に失敗しました:', error);
  }
};

// 特定のキャラクターのチャット履歴を削除
export const deleteChatHistory = (characterId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const histories = getAllChatHistories();
    const filteredHistories = histories.filter(h => h.characterId !== characterId);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filteredHistories));
  } catch (error) {
    console.error('チャット履歴の削除に失敗しました:', error);
  }
};

// 全てのチャット履歴を削除
export const clearAllChatHistories = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('全チャット履歴の削除に失敗しました:', error);
  }
};

// 最後のメッセージを取得（プレビュー用）
export const getLastMessage = (characterId: string): string => {
  const messages = getChatHistory(characterId);
  if (messages.length === 0) return '';
  
  const lastMessage = messages[messages.length - 1];
  const maxLength = 30;
  
  if (lastMessage.text.length > maxLength) {
    return lastMessage.text.substring(0, maxLength) + '...';
  }
  
  return lastMessage.text;
};

// 未読メッセージ数を取得（将来の拡張用）
export const getUnreadCount = (characterId: string): number => {
  // 現在は常に0を返すが、将来的に未読機能を追加する際に使用
  return 0;
};
