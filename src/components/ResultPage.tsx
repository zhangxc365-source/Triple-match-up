import { motion } from 'motion/react';
import { UserStats, Word } from '../types';
import { Home, RotateCcw, ChevronRight, Check, X, Star } from 'lucide-react';

interface Props {
  stats: UserStats;
  words: Word[];
  winner?: string | null;
  onHome: () => void;
  onReplay: () => void;
  onNext: () => void;
}

export default function ResultPage({ stats, words, winner, onHome, onReplay, onNext }: Props) {
  const finalScore = stats.score;
  
  const getTitle = () => {
    if (winner === 'TIE') return { text: "IT'S A DRAW!", color: '#FFB74D', sub: '势均力敌' };
    if (winner) return { text: `${winner} VICTORIOUS!`, color: '#66BB6A', sub: '恭喜获胜' };
    if (stats.matches >= 9) return { text: 'Vocabulary Expert', color: '#4CAF50', sub: '词汇达人' };
    if (stats.matches >= 5) return { text: 'Super Star', color: '#FFB74D', sub: '超级明星' };
    return { text: 'Keep Trying', color: '#FF7043', sub: '继续努力' };
  };

  const title = getTitle();

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 bg-[#E0F2F1] overflow-hidden">
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="text-center mb-4 md:mb-8 shrink-0"
      >
        <div className="inline-block relative">
          <Star className="text-orange-400 absolute -top-6 -right-6 md:-top-8 md:-right-8 animate-bounce" size={window.innerWidth < 768 ? 32 : 48} fill="currentColor" />
          <h1 className="text-[clamp(1.75rem,5vh,3.75rem)] font-black text-[#333] mb-1 tracking-tighter uppercase italic font-chinese leading-none">
            {title.text}
          </h1>
          <h2 className="text-[clamp(1rem,3vh,1.5rem)] font-black text-blue-600 font-chinese tracking-widest leading-none">{title.sub}</h2>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8 max-w-xl mx-auto w-full shrink-0">
        <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-[32px] cartoon-border text-center">
          <span className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-1">TOTAL SCORE</span>
          <span className="text-2xl md:text-4xl font-black text-blue-600">{finalScore}</span>
        </div>
        <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-[32px] cartoon-border text-center">
          <span className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-1">MATCHES</span>
          <span className="text-2xl md:text-4xl font-black text-green-500">{stats.matches}</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl md:rounded-[40px] cartoon-border overflow-hidden flex flex-col min-h-0">
        <div className="bg-teal-50/50 px-4 md:px-8 py-3 md:py-5 border-b-4 border-[#333] flex font-black text-[10px] md:text-xs text-gray-500 uppercase tracking-widest shrink-0">
          <span className="w-8 md:w-12"></span>
          <span className="flex-1">WORD UNIT</span>
          <span className="flex-1 text-center">PINYIN GUIDE</span>
          <span className="flex-1 text-right">ENGLISH MEANING</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 md:px-8 divide-y-2 divide-gray-100 custom-scrollbar">
          {words.map((word, i) => (
            <div key={word.id} className="py-3 md:py-5 flex items-center">
              <span className="w-8 md:w-12">
                {i < stats.matches ? <Check className="text-green-500 shrink-0" size={window.innerWidth < 768 ? 16 : 24} strokeWidth={4} /> : <X className="text-red-400 shrink-0" size={window.innerWidth < 768 ? 16 : 24} strokeWidth={4} />}
              </span>
              <span className="flex-1 font-black font-chinese text-xl md:text-3xl text-blue-900">{word.char}</span>
              <span className="flex-1 text-center text-sm md:text-xl font-black text-blue-600 tracking-widest font-chinese">{word.pinyin.toLowerCase()}</span>
              <span className="flex-1 text-[10px] md:text-sm font-black text-teal-950 text-right uppercase italic font-chinese">{word.translation.en}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 md:mt-8 flex justify-center gap-3 md:gap-8 pb-2 md:pb-4 shrink-0">
        <button
          onClick={onHome}
          className="cartoon-button cartoon-border h-12 w-20 md:h-16 md:w-32 bg-white text-[#333] rounded-xl md:rounded-3xl flex items-center justify-center"
        >
          <Home size={24} className="md:w-8 md:h-8" />
        </button>
        <button
          onClick={onReplay}
          className="cartoon-button cartoon-border h-12 w-20 md:h-16 md:w-32 bg-[#FFD54F] text-black rounded-xl md:rounded-3xl flex items-center justify-center"
        >
          <RotateCcw size={24} className="md:w-8 md:h-8" />
        </button>
        <button
          onClick={onNext}
          className="cartoon-button cartoon-border h-12 px-6 md:h-16 md:px-16 bg-[#4CAF50] text-white rounded-xl md:rounded-3xl flex items-center justify-center gap-2 md:gap-3 text-sm md:text-2xl font-black uppercase tracking-widest"
        >
          NEXT <ChevronRight size={20} className="md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
}
