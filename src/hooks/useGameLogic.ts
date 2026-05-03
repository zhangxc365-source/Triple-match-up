import { useState, useEffect, useCallback } from 'react';
import { Word, Card, GameMode } from '../types';

const CARD_WIDTH = 120;
const CARD_HEIGHT = 155;
const MIN_X = 40;
const MAX_X = 830;
const MIN_Y = 30;
const MAX_Y = 420;

export const useGameLogic = (words: Word[], totalTime: number, mode: GameMode = 'solo') => {
  const [cards, setCards] = useState<Card[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [eliminated, setEliminated] = useState<{p1: boolean, p2: boolean}>({ p1: false, p2: false });
  const [earnedTools, setEarnedTools] = useState<Record<string, boolean>>({
    shuffle: false,
    moveOut: false,
    autoMatch: false
  });
  const [usedTools, setUsedTools] = useState<Record<string, boolean>>({
    shuffle: false,
    moveOut: false,
    autoMatch: false
  });

  const [currentLevelWords, setCurrentLevelWords] = useState<Word[]>([]);

  // Adjust boundaries for PK container (800x500) vs Solo container (max-w-4xl ~900x600)
  const effectiveMinX = mode === 'pk' ? 40 : MIN_X;
  const effectiveMaxX = mode === 'pk' ? 640 : MAX_X; // 800 - 120 - 40 = 640
  const effectiveMinY = mode === 'pk' ? 30 : MIN_Y;
  const effectiveMaxY = mode === 'pk' ? 315 : MAX_Y; // 500 - 155 - 30 = 315

  // Helper to update blocked status without re-creating every object if unnecessary
  const updateBlockedStatus = useCallback((allCards: Card[]) => {
    const margin = 8; 

    return allCards.map(target => {
      if (target.isInSlot || target.isMatched || target.isOut) {
        return target.isBlocked ? { ...target, isBlocked: false } : target;
      }

      const blockingCard = allCards.find(other => 
        !other.isInSlot && 
        !other.isMatched &&
        !other.isOut &&
        other.layer > target.layer &&
        other.x < target.x + CARD_WIDTH - margin &&
        other.x + CARD_WIDTH > target.x + margin &&
        other.y < target.y + CARD_HEIGHT - margin &&
        other.y + CARD_HEIGHT > target.y + margin
      );
      
      const shouldBeBlocked = !!blockingCard;
      return target.isBlocked === shouldBeBlocked ? target : { ...target, isBlocked: shouldBeBlocked };
    });
  }, []);

  const initCards = useCallback(() => {
    if (words.length === 0) return;
    
    const types: ('char' | 'pinyin' | 'translation')[] = ['char', 'pinyin', 'translation'];
    // In PK mode, use more words for a bigger board
    const wordCount = mode === 'pk' ? Math.min(words.length, 18) : 10;
    setTotalWords(wordCount);
    const uniqueWords = words.slice(0, wordCount);
    setCurrentLevelWords(uniqueWords);
    const rawCards: Partial<Card>[] = [];
    
    uniqueWords.forEach(word => {
      types.forEach(type => {
        rawCards.push({
          wordId: word.id,
          type,
          content: type === 'char' ? word.char : type === 'pinyin' ? word.pinyin : word.translation.en,
          isInSlot: false,
          slotOwner: null,
          isMatched: false,
          isOut: false,
        });
      });
    });

    const shuffledRaw = [...rawCards].sort(() => Math.random() - 0.5);
    const finalCards: Card[] = [];
    
    // Layer count is strictly 3 as requested
    const layerCount = 3;
    const totalCards = shuffledRaw.length;
    
    // Select 2 words to be "delivery points" (completely on top layer, easy to match)
    const deliveryWordIds = uniqueWords.slice(0, 2).map(w => w.id);
    const deliveryCards = shuffledRaw.filter(c => deliveryWordIds.includes(c.wordId!));
    const nonDeliveryCards = shuffledRaw.filter(c => !deliveryWordIds.includes(c.wordId!));

    const cardsPerLayer = Math.ceil(nonDeliveryCards.length / layerCount);

    const processCard = (raw: Partial<Card>, idx: number, forceLayer?: number) => {
      const layerValue = forceLayer !== undefined ? forceLayer : Math.min(layerCount - 1, Math.floor(idx / cardsPerLayer));
      
      let x = 0, y = 0, rotation = 0;
      let attempts = 0;
      let foundSpot = false;

      while (!foundSpot && attempts < 100) {
        attempts++;
        rotation = (Math.random() - 0.5) * 12;

        if (layerValue === 0) {
          x = Math.round(effectiveMinX + Math.random() * (effectiveMaxX - effectiveMinX));
          y = Math.round(effectiveMinY + Math.random() * (effectiveMaxY - effectiveMinY));
          const overlap = finalCards.filter(c => c.layer === 0).some(c => 
            Math.abs(c.x - x) < CARD_WIDTH * 0.7 && Math.abs(c.y - y) < CARD_HEIGHT * 0.7
          );
          if (!overlap) foundSpot = true;
        } else {
          // For higher layers, try to partially overlap bottom cards OR find empty space
          const pool = finalCards.filter(c => c.layer === layerValue - 1);
          if (Math.random() < 0.7 && pool.length > 0) {
            const target = pool[Math.floor(Math.random() * pool.length)];
            const offX = (Math.random() > 0.5 ? 1 : -1) * (CARD_WIDTH * (0.1 + Math.random() * 0.3));
            const offY = (Math.random() > 0.5 ? 1 : -1) * (CARD_HEIGHT * (0.1 + Math.random() * 0.3));
            x = Math.round(Math.max(effectiveMinX, Math.min(effectiveMaxX, target.x + offX)));
            y = Math.round(Math.max(effectiveMinY, Math.min(effectiveMaxY, target.y + offY)));
          } else {
            x = Math.round(effectiveMinX + Math.random() * (effectiveMaxX - effectiveMinX));
            y = Math.round(effectiveMinY + Math.random() * (effectiveMaxY - effectiveMinY));
          }

          // Ensure no excessive overlap in the same layer
          const overlapSameLayer = finalCards.filter(c => c.layer === layerValue).some(c => 
            Math.abs(c.x - x) < CARD_WIDTH * 0.5 && Math.abs(c.y - y) < CARD_HEIGHT * 0.5
          );
          if (!overlapSameLayer) foundSpot = true;
        }
      }

      finalCards.push({
        ...raw,
        id: `card-${finalCards.length}`,
        layer: layerValue, 
        side: 'both',
        x: Math.round(x),
        y: Math.round(y),
        rotation: Math.round(rotation),
        isBlocked: false,
      } as Card);
    };

    // First, place non-delivery cards in layers 0, 1, 2
    nonDeliveryCards.forEach((raw, idx) => processCard(raw, idx));
    
    // Then, place delivery cards on the top layer (layer 2) to ensure they are visible and easy
    deliveryCards.forEach((raw, idx) => processCard(raw, idx, 2));

    const initialTools = { shuffle: false, moveOut: false, autoMatch: false };
    setEarnedTools(initialTools);
    setUsedTools({ shuffle: false, moveOut: false, autoMatch: false });
    setEliminated({ p1: false, p2: false });
    setCards(updateBlockedStatus(finalCards));
  }, [words, mode, updateBlockedStatus]);

  useEffect(() => {
    initCards();
  }, [words, mode, initCards]); 

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
  }, []);

  useEffect(() => {
    if (isGameOver || isPaused) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isPaused, handleGameOver]);

  const slots1 = cards
    .filter(c => c.isInSlot && c.slotOwner === 'p1')
    .sort((a, b) => a.wordId.localeCompare(b.wordId));

  const slots2 = cards
    .filter(c => c.isInSlot && c.slotOwner === 'p2')
    .sort((a, b) => a.wordId.localeCompare(b.wordId));

  const matched1 = cards.filter(c => c.isMatched && c.slotOwner === 'p1').length / 3;
  const matched2 = cards.filter(c => c.isMatched && c.slotOwner === 'p2').length / 3;

  const matchedWordIds1 = Array.from(new Set(cards.filter(c => c.isMatched && c.slotOwner === 'p1').map(c => c.wordId)));
  const matchedWordIds2 = Array.from(new Set(cards.filter(c => c.isMatched && c.slotOwner === 'p2').map(c => c.wordId)));

  // 提取当前所有卡牌中包含的单词 ID（即本局实际出现的词）
  const actuallyAppearedWordIds = Array.from(new Set(cards.map(c => c.wordId)));

  const score1 = matched1 * 10;
  const score2 = matched2 * 10;

  const selectCard = (cardId: string, player: 'p1' | 'p2' = 'p1') => {
    if (isPaused || isGameOver || isShuffling || eliminated[player]) return;
    
    setCards(prevCards => {
      const card = prevCards.find(c => c.id === cardId);
      if (!card || card.isBlocked || card.isInSlot || card.isMatched) return prevCards;

      const currentSlots = prevCards.filter(c => c.isInSlot && c.slotOwner === player);
      if (currentSlots.length >= 6) return prevCards;

      // Update basic state
      const updatedCards = prevCards.map(c => 
        c.id === cardId ? { ...c, isInSlot: true, slotOwner: player, isOut: false } : c
      );

      return updateBlockedStatus(updatedCards);
    });
  };

  // Match logic with delay
  useEffect(() => {
    const checkMatchForPlayer = (player: 'p1' | 'p2') => {
      const inSlots = cards.filter(c => c.isInSlot && c.slotOwner === player);
      const counts: Record<string, number> = {};
      inSlots.forEach(c => counts[c.wordId] = (counts[c.wordId] || 0) + 1);

      const matchedId = Object.keys(counts).find(id => counts[id] === 3);

      if (matchedId) {
        const timer = setTimeout(() => {
          setCards(prev => {
            const matchIds = prev
              .filter(c => c.wordId === matchedId && c.isInSlot && c.slotOwner === player)
              .map(c => c.id);

            const next = prev.map(c => 
              matchIds.includes(c.id) ? { ...c, isMatched: true, isInSlot: false, isOut: false } : c
            );
            return updateBlockedStatus(next);
          });
        }, 600); 
        return () => clearTimeout(timer);
      } else if (inSlots.length === 6) {
        // Elimination logic
        setEliminated(prev => {
          const next = { ...prev, [player]: true };
          if (mode === 'solo' || (next.p1 && next.p2)) {
             handleGameOver();
          }
          return next;
        });
      }
    };

    checkMatchForPlayer('p1');
    checkMatchForPlayer('p2');
  }, [cards, updateBlockedStatus, handleGameOver]);

  // Game over conditions
  useEffect(() => {
    const totalPossible = cards.length / 3;
    const totalMatched = (cards.filter(c => c.isMatched).length / 3);
    
    if (totalMatched === totalPossible && totalPossible > 0 && !isGameOver) {
      setTimeout(handleGameOver, 500);
    }
  }, [cards, isGameOver, handleGameOver]);

  const props = {
    earnTool: (tool: 'shuffle' | 'moveOut' | 'autoMatch') => {
      setEarnedTools(prev => ({ ...prev, [tool]: true }));
    },
    shuffle: () => {
      if (usedTools.shuffle || !earnedTools.shuffle) return;
      setIsShuffling(true);
      setUsedTools(prev => ({ ...prev, shuffle: true }));
      
      // Step 1: Converge to a central point (roughly)
      setCards(prev => {
        const remaining = prev.filter(c => !c.isInSlot && !c.isMatched && !c.isOut);
        const immobile = prev.filter(c => c.isInSlot || c.isMatched || c.isOut);
        
        // Use a generic center based on boundaries
        const midX = (effectiveMinX + effectiveMaxX) / 2;
        const midY = (effectiveMinY + effectiveMaxY) / 2;

        const convergeCards = remaining.map(c => ({
          ...c,
          x: midX - 60, // card width / 2
          y: midY - 77.5, // card height / 2
          rotation: 0,
          isBlocked: false
        }));
        return [...immobile, ...convergeCards];
      });

      // Step 2: Scatter after a short delay
      setTimeout(() => {
        setCards(prev => {
          const remaining = prev.filter(c => !c.isInSlot && !c.isMatched && !c.isOut);
          const immobile = prev.filter(c => c.isInSlot || c.isMatched || c.isOut);
          
          // Generate new random positions for the scatter phase
          const newRemaining = remaining.map((c, i) => {
            const randomX = Math.random() * (effectiveMaxX - effectiveMinX) + effectiveMinX;
            const randomY = Math.random() * (effectiveMaxY - effectiveMinY) + effectiveMinY;

            return {
              ...c,
              x: Math.round(randomX),
              y: Math.round(randomY),
              layer: i, // Reset layers slightly
              rotation: Math.round((Math.random() - 0.5) * 40), // Increased rotation for "messy" shuffle look
            };
          });

          const result = [...immobile, ...newRemaining];
          return updateBlockedStatus(result);
        });
        setIsShuffling(false);
      }, 600);
    },
    moveOut: (player: 'p1' | 'p2' = 'p1') => {
      if (usedTools.moveOut || !earnedTools.moveOut) return;
      setUsedTools(prev => ({ ...prev, moveOut: true }));
      setCards(prev => {
        const inSlots = prev
          .filter(c => c.isInSlot && c.slotOwner === player)
          .sort((a, b) => a.wordId.localeCompare(b.wordId));
          
        if (inSlots.length === 0) return prev;
        
        const count = Math.min(inSlots.length, 3);
        const toMoveIds = inSlots.slice(0, count).map(c => c.id);
        
        const next = prev.map(c => 
          toMoveIds.includes(c.id) ? { ...c, isInSlot: false, isOut: true } : c
        );
        return updateBlockedStatus(next);
      });
      if (eliminated[player]) {
        setEliminated(prev => ({ ...prev, [player]: false }));
      }
    },
    autoMatch: (player: 'p1' | 'p2' = 'p1') => {
      if (isShuffling || isGameOver || usedTools.autoMatch || !earnedTools.autoMatch || eliminated[player]) return;
      setUsedTools(prev => ({ ...prev, autoMatch: true }));

      setCards(prev => {
        const inSlots = prev.filter(c => c.isInSlot && c.slotOwner === player);
        let targetWordId: string | null = null;
        let needed = 3;

        if (inSlots.length > 0) {
          const counts: Record<string, number> = {};
          inSlots.forEach(c => counts[c.wordId] = (counts[c.wordId] || 0) + 1);
          targetWordId = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0];
          needed = 3 - counts[targetWordId];
        } else {
          const pile = prev.filter(c => !c.isInSlot && !c.isMatched && !c.isOut);
          const pileCounts: Record<string, number> = {};
          pile.forEach(c => pileCounts[c.wordId] = (pileCounts[c.wordId] || 0) + 1);
          targetWordId = Object.keys(pileCounts).find(id => pileCounts[id] >= 3) || null;
        }
        
        if (targetWordId && needed > 0) {
          const inSlotsCount = prev.filter(c => c.isInSlot && c.slotOwner === player).length;
          if (inSlotsCount + needed > 6) return prev; // No room

          const available = prev.filter(c => 
            c.wordId === targetWordId && !c.isInSlot && !c.isMatched && !c.isOut
          );
          
          if (available.length >= needed) {
            const toPickIds = available.slice(0, needed).map(c => c.id);
            const next = prev.map(c => 
              toPickIds.includes(c.id) ? { ...c, isInSlot: true, slotOwner: player, isOut: false } : c
            );
            return updateBlockedStatus(next);
          }
        }
        return prev;
      });
    }
  };

  const togglePause = () => setIsPaused(prev => !prev);

  return {
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
    actuallyAppearedWordIds,
    matchedWordIds1,
    matchedWordIds2,
    setIsPaused,
    selectCard,
    props,
    initCards,
    togglePause
  };
};
