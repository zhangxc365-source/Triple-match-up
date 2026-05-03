import { motion } from 'motion/react';
import { Play, Swords, Info } from 'lucide-react';

interface Props {
  onStartSolo: () => void;
  onStartPK: () => void;
  onShowIntro: () => void;
}

export default function LandingPage({ onStartSolo, onStartPK, onShowIntro }: Props) {
  return (
    <div className="relative flex flex-col w-full h-full bg-[#E0F2F1] overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start pt-32 md:pt-48 overflow-y-auto px-6 py-8 md:py-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black mb-1 md:mb-2 text-[#333] tracking-tighter uppercase italic font-chinese leading-none">
            Triple Match-Up
          </h1>
          <h2 className="text-[clamp(4rem,15vw,8.5rem)] font-chinese text-[#1B5E20] font-black drop-shadow-sm leading-tight">
            单词连连看
          </h2>
        </motion.div>

        {/* Informational Hint (Visible but non-critical) */}
        <motion.div 
          className="hidden sm:block text-xs md:text-sm text-teal-800 font-black uppercase tracking-widest opacity-60 mb-8"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Master your vocabulary through play
        </motion.div>
      </div>

      {/* Sticky Bottom Button Section */}
      <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#E0F2F1] via-[#E0F2F1] to-transparent pt-8 pb-40 px-6">
        <div className="max-w-sm mx-auto flex flex-col gap-3 md:gap-5">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3 md:gap-4"
          >
            <button
              onClick={onStartSolo}
              className="cartoon-button cartoon-border w-full bg-[#4CAF50] hover:bg-[#43A047] text-white py-4 md:py-6 rounded-2xl text-xl md:text-2xl font-black flex items-center justify-center gap-3 font-chinese"
            >
              <Play fill="currentColor" className="w-5 h-5 md:w-6 md:h-6" /> Solo Mode
            </button>

            <button
              onClick={onStartPK}
              className="cartoon-button cartoon-border w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black py-4 md:py-6 rounded-2xl text-xl md:text-2xl font-black flex items-center justify-center gap-3 font-chinese"
            >
              <Swords className="w-6 h-6 md:w-7 md:h-7" /> PK Mode
            </button>
            <button
              onClick={onShowIntro}
              className="cartoon-button cartoon-border w-full bg-white hover:bg-gray-100 text-[#333] py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold flex items-center justify-center gap-3"
            >
              <Info className="w-5 h-5 md:w-6 md:h-6" /> HOW TO PLAY
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
