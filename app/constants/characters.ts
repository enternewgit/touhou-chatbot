// キャラクター情報の型定義
export interface Character {
  id: string;
  name: string;
  full_name: string;
  description: string;
  avatar: string;
}

// 静的キャラクターデータ - 即座読み込み用
export const CHARACTERS: Character[] = [
  {
    id: 'reimu',
    name: '博麗霊夢',
    full_name: '博麗 霊夢（はくれい れいむ）',
    description: '楽園の巫女。いつも気怠そうにしているが、実は強い責任感を持つ。',
    avatar: '/avatars/reimu.png'
  },
  {
    id: 'marisa',
    name: '霧雨魔理沙',
    full_name: '霧雨 魔理沙（きりさめ まりさ）',
    description: '普通の魔法使い。努力家で向上心が強く、常に新しい魔法を研究している。',
    avatar: '/avatars/marisa.png'
  },
  {
    id: 'sakuya',
    name: '十六夜咲夜',
    full_name: '十六夜 咲夜（いざよい さくや）',
    description: '紅魔館のメイド長。時を操る能力を持ち、完璧な仕事ぶりで知られる。',
    avatar: '/avatars/sakuya.png'
  },
  {
    id: 'yuyuko',
    name: '西行寺幽々子',
    full_name: '西行寺 幽々子（さいぎょうじ ゆゆこ）',
    description: '白玉楼の主。死を司る能力を持つが、おっとりとした性格で食いしん坊。',
    avatar: '/avatars/yuyuko.png'
  },
  {
    id: 'meiling',
    name: '紅美鈴',
    full_name: '紅 美鈴（ほん めいりん）',
    description: '紅魔館の門番。中国武術と気功を得意とし、真面目だが居眠りしがち。',
    avatar: '/avatars/meiling.png'
  },
  {
    id: 'remilia',
    name: 'レミリア・スカーレット',
    full_name: 'レミリア・スカーレット',
    description: '紅魔館の主。吸血鬼でありながら気まぐれで子供っぽい面もある。',
    avatar: '/avatars/remilia.png'
  },
  {
    id: 'koishi',
    name: '古明地こいし',
    full_name: '古明地 こいし（こめいじ こいし）',
    description: '無意識を操る能力を持つ少女。天真爛漫で予測不可能な行動を取る。',
    avatar: '/avatars/koishi.png'
  }
];
