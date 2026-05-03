import { Word, UserStats } from '../types';
import GameView from './GameView';

interface Props {
  words: Word[];
  onGameOver: (winnerId: string, stats1: UserStats, stats2: UserStats) => void;
  onBackToHome: () => void;
  onRestart: () => void;
}

export default function PKMode({ words, onGameOver, onBackToHome, onRestart }: Props) {
  const handleGameOver = (data: any) => {
    // data is { winnerId, s1, s2 } from our new GameView logic
    onGameOver(data.winnerId, data.s1, data.s2);
  };

  return (
    <div className="w-full h-full">
      <GameView 
        mode="pk" 
        words={words} 
        onGameOver={handleGameOver} 
        onBackToHome={onBackToHome} 
        onRestart={onRestart}
      />
    </div>
  );
}
