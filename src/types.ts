
export type Language = 'en' | 'mn';

export interface Word {
  id: string;
  char: string;
  pinyin: string;
  translation: {
    en: string;
    mn: string;
  };
  level: number;
  lesson: number;
}

export type GameMode = 'solo' | 'pk';

export interface Card {
  id: string; // unique card instance id
  wordId: string;
  type: 'char' | 'pinyin' | 'translation';
  content: string;
  layer: number;
  x: number;
  y: number;
  rotation: number;
  isBlocked: boolean;
  isMatched: boolean;
  isInSlot: boolean;
  slotOwner: 'p1' | 'p2' | null;
  side: 'p1' | 'p2' | 'both';
  isOut: boolean;
}

export type GameState = 'start' | 'selection' | 'preparation' | 'playing' | 'result' | 'introduction';

export interface UserStats {
  score: number;
  matches: number;
  timeRemaining: number;
  totalTime: number;
  isEliminated?: boolean;
  usedWords?: Word[];
  matchedWordIds?: string[];
}
