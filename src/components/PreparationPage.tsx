import { Word } from '../types';
import { ChevronLeft, Play } from 'lucide-react';

interface Props {
  words: Word[];
  level: number;
  lesson: number;
  onStart: () => void;
  onBack: () => void;
}

export default function PreparationPage({ words, level, lesson, onStart, onBack }: Props) {
  const maxLsn = level >= 5 ? 15 : 12;
  const lessonTitle = lesson === maxLsn 
    ? (level >= 5 ? 'REVIEW 1' : 'REVIEW') 
    : `LESSON ${lesson}`;

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-6 bg-[#E0F2F1] overflow-hidden">
      <header className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
        <button 
          onClick={onBack}
          className="cartoon-button cartoon-border p-2 md:p-3 bg-white rounded-full text-[#333]"
        >
          <ChevronLeft size={24} className="md:w-8 md:h-8" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[clamp(1.25rem,4vh,2.5rem)] font-black text-[#546E7A] uppercase italic tracking-widest leading-none font-chinese">
            YCT{level} - {lessonTitle}
          </h2>
          <span className="text-[clamp(0.6rem,1.5vh,0.75rem)] font-black text-teal-600 uppercase tracking-[0.3em] mt-1 font-chinese">Vocabulary Prep</span>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-6">
          {words.map((word) => (
            <div 
              key={word.id} 
              className="flex flex-col items-center justify-center bg-white p-3 md:p-4 rounded-xl md:rounded-[24px] cartoon-border text-center overflow-hidden min-h-[120px] md:min-h-[160px]"
            >
              <div className="text-sm md:text-xl font-black text-blue-600 mb-1 truncate w-full italic font-chinese">
                {word.pinyin.toLowerCase()}
              </div>
              <div className="text-3xl md:text-5xl font-chinese text-black font-black leading-tight [text-shadow:_1px_1px_0_rgb(0_0_0_/_10%)]">
                {word.char}
              </div>
              <div className="text-[10px] md:text-base font-black text-[#546E7A] uppercase tracking-tight mt-1 md:mt-2 line-clamp-2 w-full leading-tight font-chinese">
                {word.translation.en}
              </div>
            </div>
          ))}
          {/* Placeholder if words are few to keep layout consistent visually */}
          {Array.from({ length: Math.max(0, 5 - words.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="hidden md:block bg-transparent border-2 md:border-4 border-dashed border-gray-300 rounded-xl md:rounded-[24px]"></div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#E0F2F1]/90 backdrop-blur-sm pt-4 pb-2 md:pt-8 flex justify-center shrink-0">
        <button
          onClick={onStart}
          className="cartoon-button cartoon-border px-10 md:px-20 py-3 md:py-4 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-2xl md:rounded-3xl text-xl md:text-3xl font-black uppercase tracking-widest flex items-center gap-3 md:gap-4 font-chinese"
        >
          <Play fill="currentColor" size={24} className="md:w-8 md:h-8" /> START GAME
        </button>
      </div>
    </div>
  );
}
