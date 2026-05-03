import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  onSelect: (level: number, lesson: number) => void;
}

export default function LevelSelection({ onSelect }: Props) {
  const [level, setLevel] = useState(1);
  const [lesson, setLesson] = useState(1);

  const levels = [1, 2, 3, 4, 5, 6];
  const lessonCount = (level >= 5) ? 15 : 12;
  const lessons = Array.from({ length: lessonCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 bg-[#E0F2F1] overflow-y-auto">
      {/* Level Section */}
      <div className="mb-8 md:mb-16 mt-4 md:mt-12">
        <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-black text-center mb-4 md:mb-8 text-[#333] italic uppercase tracking-widest font-chinese">Select Level</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-6 max-w-4xl mx-auto">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                // Reset lesson if it exceeds new count
                const max = lvl >= 5 ? 15 : 12;
                if (lesson > max) setLesson(1);
              }}
              className={`cartoon-button cartoon-border py-4 md:py-8 rounded-xl md:rounded-2xl text-xl md:text-3xl font-black transition-all ${
                level === lvl
                  ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-white text-[#333] hover:bg-gray-50'
              }`}
            >
              YCT {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Section */}
      <div className="flex-1 mb-8">
        <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-black text-center mb-4 md:mb-8 text-[#333] italic uppercase tracking-widest font-chinese">Select Lesson</h2>
        <div className={`grid ${lessonCount > 12 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-4 sm:grid-cols-6'} gap-3 md:gap-6 max-w-4xl mx-auto`}>
          {lessons.map((lsn) => (
            <button
              key={lsn}
              onClick={() => setLesson(lsn)}
              className={`cartoon-button cartoon-border py-3 md:py-7 rounded-xl md:rounded-2xl text-lg md:text-2xl font-black transition-all ${
                lesson === lsn
                  ? 'bg-[#4CAF50] text-white shadow-[0_0_20px_rgba(76,175,80,0.3)]'
                  : 'bg-white text-[#333] hover:bg-gray-50'
              }`}
            >
              {lsn === (level >= 5 ? 15 : 12) ? (level >= 5 ? 'REV 1' : 'REV') : `L${lsn}`}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#E0F2F1]/80 backdrop-blur-sm py-4 flex justify-center mt-auto">
        <button
          onClick={() => onSelect(level, lesson)}
          className="cartoon-button cartoon-border px-12 md:px-16 py-3 md:py-5 bg-[#FFD54F] hover:bg-[#FFCA28] text-black rounded-full text-xl md:text-3xl font-black uppercase tracking-widest font-chinese"
        >
          LET'S GO!
        </button>
      </div>
    </div>
  );
}
