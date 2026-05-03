/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameState, GameMode, Word, UserStats } from './types';
import { VOCABULARY } from './data/vocabulary';
import LandingPage from './components/LandingPage';
import LevelSelection from './components/LevelSelection';
import Introduction from './components/Introduction';
import PreparationPage from './components/PreparationPage';
import GameView from './components/GameView';
import ResultPage from './components/ResultPage';
import PKMode from './components/PKMode';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState<number>(0);

  const getMaxLessons = (level: number) => (level >= 5 ? 15 : 12);

  // Filter words based on selection
  const filterWords = (level: number, lesson: number) => {
    const maxLsn = getMaxLessons(level);
    let filtered: Word[] = [];

    if (lesson === maxLsn) {
      // Review lesson: Randomly pick 10 words from all previous lessons
      const previousWords = VOCABULARY.filter(w => w.level === level && w.lesson < maxLsn);
      // Remove duplicates by character
      const uniqueWords = Array.from(new Map(previousWords.map(w => [w.char, w])).values());
      const shuffled = [...uniqueWords].sort(() => Math.random() - 0.5);
      filtered = shuffled.slice(0, 10);
    } else {
      // Normal lesson
      filtered = VOCABULARY.filter(w => w.level === level && w.lesson === lesson);
      
      // Requirement: if not enough words (10), fill from previous lessons in the same level
      if (filtered.length < 10) {
        const others = VOCABULARY.filter(w => w.level === level && w.lesson < lesson);
        const uniqueOthers = Array.from(new Map(others.map(w => [w.char, w])).values())
                                .filter(w => !filtered.some(f => f.char === w.char));
        const additional = uniqueOthers.sort(() => Math.random() - 0.5);
        filtered = [...filtered, ...additional].slice(0, 10);
      }
    }
    
    // If still not enough (e.g. Level 1 Lesson 1), just take any from the level
    if (filtered.length < 10) {
      const anyFromLevel = VOCABULARY.filter(w => w.level === level)
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 10);
      filtered = anyFromLevel;
    }

    setCurrentWords(filtered);
  };

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('selection');
  };

  const handleSelectionDone = (level: number, lesson: number) => {
    setSelectedLevel(level);
    setSelectedLesson(lesson);
    filterWords(level, lesson);
    setGameState('preparation');
  };

  const handleFinishPreparation = () => {
    setGameState('playing');
  };

  const handleGameOver = (stats: UserStats) => {
    setUserStats(stats);
    setWinner(null);
    setGameState('result');
  };

  const handlePKGameOver = (win: string, s1: UserStats, s2: UserStats) => {
    setUserStats(s1); 
    setWinner(win);
    setGameState('result');
  };

  const handleReturnHome = () => {
    setGameState('start');
    setUserStats(null);
    setWinner(null);
    setGameKey(0);
  };

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
  };

  const handleNextLevel = () => {
    const maxLsn = getMaxLessons(selectedLevel);
    if (selectedLesson < maxLsn) {
      const nextLesson = selectedLesson + 1;
      setSelectedLesson(nextLesson);
      filterWords(selectedLevel, nextLesson);
      setGameState('preparation');
    } else if (selectedLevel < 6) {
      const nextLevel = selectedLevel + 1;
      setSelectedLevel(nextLevel);
      setSelectedLesson(1);
      filterWords(nextLevel, 1);
      setGameState('preparation');
    } else {
      handleReturnHome();
    }
  };

  return (
    <div className="w-screen h-screen bg-[#FFF8E1] text-[#4E342E] relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <LandingPage 
              onStartSolo={() => handleStartGame('solo')} 
              onStartPK={() => handleStartGame('pk')}
              onShowIntro={() => setGameState('introduction')}
            />
          </motion.div>
        )}

        {gameState === 'introduction' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full h-full"
          >
            <Introduction onBack={() => setGameState('start')} />
          </motion.div>
        )}

        {gameState === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full"
          >
            <LevelSelection onSelect={handleSelectionDone} />
          </motion.div>
        )}

        {gameState === 'preparation' && (
          <motion.div
            key="preparation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full h-full"
          >
            <PreparationPage 
              words={currentWords} 
              level={selectedLevel}
              lesson={selectedLesson}
              onStart={handleFinishPreparation} 
              onBack={() => setGameState('selection')}
            />
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {gameMode === 'solo' ? (
              <div key={`solo-${gameKey}`} className="w-full h-full">
                <GameView 
                  mode={gameMode} 
                  words={currentWords} 
                  onGameOver={handleGameOver}
                  onBackToHome={handleReturnHome}
                  onRestart={handleRestart}
                />
              </div>
            ) : (
              <div key={`pk-${gameKey}`} className="w-full h-full">
                <PKMode 
                  words={currentWords}
                  onGameOver={handlePKGameOver}
                  onBackToHome={handleReturnHome}
                  onRestart={handleRestart}
                />
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <ResultPage 
              stats={userStats!} 
              words={currentWords}
              winner={winner}
              onHome={handleReturnHome}
              onReplay={() => setGameState('preparation')}
              onNext={handleNextLevel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
