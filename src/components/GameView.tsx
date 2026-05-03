import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Word, GameMode, UserStats, Card as CardType } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { Pause, RotateCcw, Home, Play, Shuffle, ExternalLink, Zap } from 'lucide-react';

interface Props {
  mode: GameMode;
  words: Word[];
  onGameOver: (stats: UserStats) => void;
  onBackToHome: () => void;
  onRestart: () => void;
}

export default function GameView({ mode, words, onGameOver, onBackToHome, onRestart }: Props) {
  const {
    cards,
    slots1,
    slots2,
    score1,
    score2,
    timeRemaining,
    matched1,
    matched2,
    totalWords,
    isGameOver,
    isPaused,
    isShuffling,
    eliminated,
    earnedTools,
    usedTools,
    currentLevelWords,
    setIsPaused,
    selectCard,
    props,
    initCards
  } = useGameLogic(words, 150, mode);

  const [quizData, setQuizData] = useState<{
    tool: 'shuffle' | 'moveOut' | 'autoMatch';
    question: string;
    options: string[];
    correctIndex: number;
    questionType: 'pinyin-char' | 'char-trans' | 'pinyin-trans';
  } | null>(null);

  const hasCalledGameOver = useRef(false);

  useEffect(() => {
    if (isGameOver && !hasCalledGameOver.current) {
      hasCalledGameOver.current = true;
      // In PK mode, determine winner and send both stats
      const s1 = { score: score1, matches: matched1, timeRemaining, totalTime: 150, isEliminated: eliminated.p1 };
      const s2 = { score: score2, matches: matched2, timeRemaining, totalTime: 150, isEliminated: eliminated.p2 };
      
      let winnerId: string | null = 'P1';
      if (score2 > score1) {
        winnerId = 'P2';
      } else if (score1 > score2) {
        winnerId = 'P1';
      } else {
        // Scores are equal, compare matches
        if (matched2 > matched1) {
          winnerId = 'P2';
        } else if (matched1 > matched2) {
          winnerId = 'P1';
        } else {
          // Everything equal
          winnerId = 'TIE';
        }
      }

      onGameOver(mode === 'pk' ? ({ winnerId, s1, s2 } as any) : { score: score1, matches: matched1, timeRemaining, totalTime: 150 });
    }
  }, [isGameOver, score1, score2, matched1, matched2, timeRemaining, eliminated, onGameOver, mode]);

  const handleToolClick = (tool: 'shuffle' | 'moveOut' | 'autoMatch', player: 'p1' | 'p2' = 'p1') => {
    if (usedTools[tool]) return;

    if (!earnedTools[tool]) {
      // Create a quiz
      const correctWord = currentLevelWords[Math.floor(Math.random() * currentLevelWords.length)];
      const decoys = currentLevelWords
        .filter(w => w.id !== correctWord.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const optionsWords = [correctWord, ...decoys].sort(() => Math.random() - 0.5);
      
      let question = '';
      let options: string[] = [];
      let questionType: any = '';

      if (tool === 'shuffle') {
        question = correctWord.pinyin;
        options = optionsWords.map(w => w.char);
        questionType = 'pinyin-char';
      } else if (tool === 'moveOut') {
        question = correctWord.char;
        options = optionsWords.map(w => w.translation.en);
        questionType = 'char-trans';
      } else {
        question = correctWord.pinyin;
        options = optionsWords.map(w => w.translation.en);
        questionType = 'pinyin-trans';
      }

      setQuizData({
        tool,
        question,
        options,
        correctIndex: options.indexOf(tool === 'shuffle' ? correctWord.char : correctWord.translation.en),
        questionType
      });
      return;
    }

    if (tool === 'shuffle') props.shuffle();
    if (tool === 'moveOut') props.moveOut(player);
    if (tool === 'autoMatch') props.autoMatch(player);
  };

  const handleQuizAnswer = (index: number) => {
    if (!quizData) return;
    if (index === quizData.correctIndex) {
      props.earnTool(quizData.tool);
      setQuizData(null);
    } else {
      // Wrong answer - close quiz, try again later
      setQuizData(null);
    }
  };

  const renderCardContent = (content: string, type: 'char' | 'pinyin' | 'translation') => {
    const text = content.toLowerCase();
    if (type !== 'translation') return text;
    
    const words = text.split(' ');
    if (words.length > 1) {
      return (
        <div className="flex flex-col items-center leading-tight">
          {words.map((w, i) => <span key={i}>{w}</span>)}
        </div>
      );
    }
    return text;
  };

  const getCardFontSize = (content: string, type: string, isSlot: boolean) => {
    if (type === 'char') return isSlot ? 'text-xl sm:text-2xl font-chinese font-black' : 'text-4xl font-black';
    if (type === 'pinyin') return isSlot ? 'text-base sm:text-lg tracking-tighter font-black font-chinese' : 'text-3xl font-black font-chinese';
    
    // English Translation Scaling
    const words = content.split(' ');
    const maxWordLength = Math.max(...words.map(w => w.length));
    const totalLength = content.length;

    if (isSlot) {
      if (maxWordLength >= 9 || words.length > 1) return 'text-[11px] sm:text-xs leading-[1.1] font-bold';
      if (maxWordLength === 8) return 'text-[13px] sm:text-sm font-bold';
      return 'text-sm sm:text-base font-bold';
    } else {
      if (words.length > 1) {
        if (maxWordLength >= 9) return 'text-lg leading-tight font-black';
        if (maxWordLength === 8) return 'text-xl leading-tight font-black';
        return 'text-2xl leading-tight font-black';
      }
      if (totalLength >= 9) return 'text-xl font-black';
      if (totalLength === 8) return 'text-2xl font-black';
      return 'text-3xl font-black';
    }
  };

  const renderSlots = (playerSlots: CardType[], player: 'p1' | 'p2') => {
    const isP2 = player === 'p2';
    return (
      <div className={`flex flex-col items-center gap-2`}>
        <div className={`cartoon-border ${eliminated[player] ? 'bg-red-200' : 'bg-teal-50/80'} p-1 sm:p-2 rounded-[28px] flex flex-col gap-1 shadow-inner max-h-[80vh] overflow-y-auto`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`slot-dashed rounded-xl flex items-center justify-center overflow-hidden w-[60px] h-[75px] sm:w-[85px] sm:h-[100px]`}>
              {playerSlots[i] && (
                <motion.div
                  key={playerSlots[i].id}
                  layoutId={playerSlots[i].id}
                  animate={
                    cards.filter(c => c.wordId === playerSlots[i].wordId && c.isInSlot && c.slotOwner === player).length === 3 
                      ? { backgroundColor: '#4CAF50', color: '#FFFFFF' } 
                      : { backgroundColor: '#FFFFFF', color: '#1E3A8A' }
                  }
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                  className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-1 border-2 border-[#333] shadow-[2px_2px_0px_#333]"
                >
                  <span className={`leading-tight ${getCardFontSize(playerSlots[i].content, playerSlots[i].type, true)}`}>
                    {renderCardContent(playerSlots[i].content, playerSlots[i].type)}
                  </span>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStats = (player: 'p1' | 'p2', alignment: 'left' | 'right') => {
    const isP2 = player === 'p2';
    const score = isP2 ? score2 : score1;
    const matched = isP2 ? matched2 : matched1;
    return (
      <div className={`flex items-center gap-2 ${alignment === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="cartoon-border bg-white rounded-xl px-4 py-1 flex flex-col items-center min-w-[70px]">
          <span className={`text-[8px] font-black ${player === 'p1' ? 'text-red-600' : 'text-blue-600'}`}>{player.toUpperCase()} SCORE</span>
          <span className="text-xl font-black">{score.toString().padStart(3, '0')}</span>
        </div>
        <div className="cartoon-border bg-white rounded-xl px-3 py-1 flex flex-col items-center">
          <span className="text-[8px] font-black text-orange-500 uppercase">SETS</span>
          <span className="text-xl font-black">{matched} / {totalWords}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col w-full h-full relative overflow-hidden ${mode === 'pk' ? 'bg-white' : 'bg-[#E0F2F1] pb-8 pt-4 px-8'}`}>
      
      {/* PK Background Split */}
      {mode === 'pk' && (
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="flex-1 bg-red-50/30" />
          <div className="flex-1 bg-blue-50/30" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-gray-200 border-l border-dashed border-gray-300" />
        </div>
      )}

      {/* Top Header Section */}
      <div className={`flex items-center justify-between z-50 px-8 ${mode === 'pk' ? 'h-24 bg-white/20' : 'h-16 mb-4'}`}>
        {/* P1 Stats (Top Left) */}
        {renderStats('p1', 'left')}

        {/* Global Timer (Center) */}
        <div className="flex flex-col items-center gap-1 w-full max-w-[240px] mx-4">
          <div className="w-full h-5 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
            <motion.div
              className={`h-full ${timeRemaining < 30 ? 'bg-red-500' : 'bg-teal-500'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / 150) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <span className="text-xs font-black text-teal-800 uppercase tracking-widest bg-white/50 px-3 py-0.5 rounded-full">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* P2 Stats or Pause Button (Top Right) */}
        <div className={`flex items-center gap-4 ${mode === 'pk' ? 'flex-row-reverse' : ''}`}>
          {mode === 'pk' ? (
            renderStats('p2', 'right')
          ) : (
            <div className="w-[150px] flex justify-end" />
          )}
          
          <button 
            onClick={() => setIsPaused(true)}
            className="w-10 h-10 rounded-xl bg-white cartoon-border flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="Pause Game"
          >
            <Pause size={20} className="text-teal-600 fill-teal-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative items-start pt-0 md:pt-0 -mt-16 md:-mt-12 px-4 mb-2 overflow-hidden">
        
        {/* PK MODE: P1 SIDEBAR (LEFT) */}
        {mode === 'pk' && (
          <div className="w-24 sm:w-32 bg-red-50/30 border-r-2 border-dashed border-red-200 flex flex-col items-center justify-center p-1 sm:p-2 h-full z-10">
            {renderSlots(slots1, 'p1')}
          </div>
        )}

        {/* Shared Board (Center) */}
        <div className={`flex-1 relative overflow-hidden flex items-center justify-center min-h-0 h-full ${mode === 'pk' ? 'bg-white/40' : ''}`}>
          <div className={`relative ${mode === 'pk' ? 'w-[800px] h-[500px] scale-[0.6] sm:scale-[0.8] lg:scale-100' : 'w-full max-w-4xl h-full mx-auto'}`}>
            {cards.map((card) => (
              !card.isInSlot && !card.isMatched && !card.isOut && (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  className={`card cartoon-border absolute ${card.isBlocked ? 'card-blocked' : 'card-playable active:scale-95'} bg-white overflow-hidden`}
                  animate={{
                    x: card.x,
                    y: card.y,
                    rotate: card.rotation,
                    scale: 1,
                    opacity: 1
                  }}
                  style={{
                    width: '120px',
                    height: '155px',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: card.layer,
                  }}
                >
                  {/* Absolute positioning touch zones to overlay everything inside the card */}
                  <div className="absolute inset-0 flex flex-row z-50">
                    <div 
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if(!card.isBlocked) selectCard(card.id, 'p1');
                      }}
                      className="flex-1 hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="P1 (LEFT)"
                    />
                    {mode === 'pk' && (
                      <div 
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if(!card.isBlocked) selectCard(card.id, 'p2');
                        }}
                        className="flex-1 border-l border-dashed border-gray-200 hover:bg-blue-500/10 cursor-pointer transition-colors"
                        title="P2 (RIGHT)"
                      />
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center h-full p-2 text-center pointer-events-none">
                    <div className={`leading-tight text-blue-900 ${getCardFontSize(card.content, card.type, false)}`}>
                      {renderCardContent(card.content, card.type)}
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* PK MODE: P2 SIDEBAR (RIGHT) */}
        {mode === 'pk' && (
          <div className="w-24 sm:w-32 bg-blue-50/30 border-l-2 border-dashed border-blue-200 flex flex-col items-center justify-center p-1 sm:p-2 h-full z-10">
            {renderSlots(slots2, 'p2')}
          </div>
        )}
      </div>

      {/* Solo Bottom Bar */}
      {mode === 'solo' && (
         <div className="flex flex-col gap-4 items-center w-full max-w-6xl mx-auto mt-4 mb-4 z-50 relative">
            <div className="flex items-end gap-6">
               {/* Storage Area (Moved Out Cards) */}
               <div className="relative cartoon-border bg-orange-50/80 p-2 rounded-[24px] flex gap-1 shadow-inner ring-4 ring-orange-200/50">
                  <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-[60]">
                     STORAGE
                  </div>
                  {Array.from({ length: 3 }).map((_, i) => {
                     const outCards = cards.filter(c => c.isOut);
                     const card = outCards[i];
                     return (
                        <div key={i} className="slot-dashed rounded-xl w-[65px] h-[85px] border-orange-300 flex items-center justify-center overflow-hidden">
                           {card && (
                              <motion.div
                                 key={card.id}
                                 layoutId={card.id}
                                 onClick={() => selectCard(card.id, 'p1')}
                                 className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-1 border-2 border-[#333] cursor-pointer hover:scale-105 shadow-sm"
                                 style={{ backgroundColor: '#FFFFFF' }}
                              >
                                 <span className={`leading-tight ${getCardFontSize(card.content, card.type, true)} font-black`}>
                                    {renderCardContent(card.content, card.type)}
                                 </span>
                              </motion.div>
                           )}
                        </div>
                     );
                  })}
               </div>

               {/* Main Slot Area */}
               <div className="cartoon-border bg-teal-50/80 p-2 rounded-[28px] flex gap-1 shadow-inner">
               {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="slot-dashed rounded-xl w-[85px] h-[110px] flex items-center justify-center overflow-hidden">
                     {slots1[i] && (
                        <motion.div
                           key={slots1[i].id}
                           layoutId={slots1[i].id}
                           animate={
                            cards.filter(c => c.wordId === slots1[i].wordId && c.isInSlot).length === 3 
                              ? { backgroundColor: '#4CAF50', color: '#FFFFFF' } 
                              : { backgroundColor: '#FFFFFF', color: '#1E3A8A' }
                           }
                           className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-1 border-2 border-[#333]"
                        >
                           <span className={`leading-tight ${getCardFontSize(slots1[i].content, slots1[i].type, true)}`}>
                              {renderCardContent(slots1[i].content, slots1[i].type)}
                           </span>
                        </motion.div>
                     )}
                  </div>
               ))}
               </div>
            </div>
            
            <div className="flex gap-10">
               <button 
                  onClick={() => handleToolClick('shuffle')} 
                  disabled={usedTools.shuffle}
                  className={`prop-btn-base cartoon-button cartoon-border flex flex-col items-center justify-center gap-1 transition-all ${
                    usedTools.shuffle 
                      ? 'bg-gray-300 opacity-50 cursor-not-allowed grayscale' 
                      : 'bg-[#FFD54F]'
                  }`}
               >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">🔄 SHUFFLE</span>
                    <span className="bg-white/40 px-2 rounded-full text-xs font-black min-w-[20px]">
                      {usedTools.shuffle ? '0' : (earnedTools.shuffle ? '1' : '0')}
                    </span>
                  </div>
               </button>
               <button 
                  onClick={() => handleToolClick('moveOut')} 
                  disabled={usedTools.moveOut}
                  className={`prop-btn-base cartoon-button cartoon-border flex flex-col items-center justify-center gap-1 transition-all ${
                    usedTools.moveOut 
                      ? 'bg-gray-300 opacity-50 cursor-not-allowed grayscale' 
                      : 'bg-purple-300'
                  }`}
               >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">📤 MOVE OUT</span>
                    <span className="bg-white/40 px-2 rounded-full text-xs font-black min-w-[20px]">
                      {usedTools.moveOut ? '0' : (earnedTools.moveOut ? '1' : '0')}
                    </span>
                  </div>
               </button>
               <button 
                  onClick={() => handleToolClick('autoMatch')} 
                  disabled={usedTools.autoMatch}
                  className={`prop-btn-base cartoon-button cartoon-border flex flex-col items-center justify-center gap-1 transition-all ${
                    usedTools.autoMatch 
                      ? 'bg-gray-300 opacity-50 cursor-not-allowed grayscale' 
                      : 'bg-green-300'
                  }`}
               >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">✨ AUTO FILL</span>
                    <span className="bg-white/40 px-2 rounded-full text-xs font-black min-w-[20px]">
                      {usedTools.autoMatch ? '0' : (earnedTools.autoMatch ? '1' : '0')}
                    </span>
                  </div>
               </button>
            </div>
         </div>
      )}

      {/* Quiz Modal */}
      <AnimatePresence>
        {quizData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-teal-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white cartoon-border p-8 rounded-[40px] max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-8">
                <span className="text-sm font-black text-teal-600 tracking-widest uppercase mb-2 block">TOOL CHALLENGE</span>
                <h3 className="text-2xl font-black italic text-gray-800">
                  {quizData.tool === 'shuffle' && 'Identfy the Character'}
                  {quizData.tool === 'moveOut' && 'What does it mean?'}
                  {quizData.tool === 'autoMatch' && 'Choose the Translation'}
                </h3>
              </div>

              <div className="bg-teal-50 rounded-3xl p-8 mb-8 text-center border-4 border-teal-100">
                <div className={`font-black ${quizData.questionType === 'char-trans' ? 'text-6xl font-chinese' : 'text-4xl'}`}>
                  {quizData.question}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {quizData.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    className="cartoon-button cartoon-border bg-white hover:bg-teal-50 py-6 rounded-2xl font-black transition-all text-2xl sm:text-3xl"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setQuizData(null)}
                className="mt-8 text-gray-400 hover:text-gray-600 font-bold transition-colors w-full"
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared/Universal Pause/Practice Modal */}
      <AnimatePresence>
        {isPaused && (
           <div className="absolute inset-0 z-[100] bg-teal-900/60 backdrop-blur-md flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white cartoon-border p-10 rounded-[40px] text-center shadow-2xl max-w-sm w-full"
              >
                 <h2 className="text-4xl font-black mb-10 italic text-teal-800 tracking-tight">PAUSED</h2>
                 
                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => setIsPaused(false)} 
                      className="cartoon-button cartoon-border bg-teal-500 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                      <Play className="w-6 h-6 fill-current" />
                      <span>CONTINUE</span>
                    </button>

                    <button 
                      onClick={onRestart} 
                      className="cartoon-button cartoon-border bg-[#FFD54F] text-[#333] py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>RESTART</span>
                    </button>

                    <button 
                      onClick={onBackToHome} 
                      className="cartoon-button cartoon-border bg-white text-gray-500 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                      <Home className="w-5 h-5" />
                      <span>HOME</span>
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
