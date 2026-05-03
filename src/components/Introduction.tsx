import { motion } from 'motion/react';
import { ChevronLeft, Languages } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onBack: () => void;
}

type Lang = 'en' | 'mn';

const CONTENT = {
  en: {
    mission: "Mission Brief",
    linkText: "Link the CHARACTERS, PINYIN, and TRANSLATIONS to clear the field!",
    scoreText: "Complete the set of 3 to score 10 points.",
    tools: "Tactical Tools",
    shuffle: "Shuffle",
    eject: "Eject 3",
    auto: "Auto Fill",
    recharge: "⚡ Complete practice phrases to recharge tools! ⚡",
    chars: "CHARACTERS",
    pinyin: "PINYIN",
    trans: "TRANSLATIONS"
  },
  mn: {
    mission: "ТОГЛООМЫН ЗААВАР",
    linkText: "Хятад ХАНЗ, ПИНИНЬ болон ОРЧУУЛГЫГ хооронд нь холбож талбайг цэвэрлэнэ үү!",
    scoreText: "3 картыг нэгтгэж 10 оноо цуглуулаарай.",
    tools: "ТАКТИКИЙН ХЭРЭГСЭЛ",
    shuffle: "Холих",
    eject: "3-ыг гаргах",
    auto: "Авто нөхөх",
    recharge: "⚡ Хэрэгслийг цэнэглэхийн тулд дасгал үгсээ гүйцээгээрэй! ⚡",
    chars: "ХАНЗ",
    pinyin: "ПИНИНЬ",
    trans: "ОРЧУУЛГА"
  }
};

export default function Introduction({ onBack }: Props) {
  const [lang, setLang] = useState<Lang>('mn');
  const t = CONTENT[lang];

  return (
    <div className="flex flex-col w-full h-full p-8 bg-[#E0F2F1] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="cartoon-button cartoon-border p-3 bg-white rounded-full text-[#333]"
        >
          <ChevronLeft size={36} />
        </button>

        <div className="flex gap-2 bg-white/50 p-2 rounded-full cartoon-border">
          {(['en', 'mn'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-full font-black text-sm uppercase transition-all ${
                lang === l ? 'bg-[#FF7043] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {l === 'en' ? 'EN' : '🇲🇳 МОН'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-12 pb-16 w-full">
        <section className="space-y-4 md:space-y-6">
          <h2 className="text-[clamp(1.75rem,5vh,3rem)] font-black text-[#333] italic uppercase tracking-tighter leading-none">{t.mission}</h2>
          <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[40px] cartoon-border space-y-4 md:space-y-6 shadow-inner">
            <p className="text-xl md:text-2xl font-black leading-tight text-blue-600">
              {lang === 'en' ? (
                <>Link the <span className="text-orange-500 underline decoration-4">CHARACTERS</span>, <span className="text-green-500 underline decoration-4 underline-offset-4"> PINYIN</span>, and <span className="text-blue-400 underline decoration-4"> TRANSLATIONS</span> to clear the field!</>
              ) : (
                <>Хятад <span className="text-orange-500 underline decoration-4">ХАНЗ</span>, <span className="text-green-500 underline decoration-4 underline-offset-4">ПИНИНЬ</span> болон <span className="text-blue-400 underline decoration-4">ОРЧУУЛГЫГ</span> хооронд нь холбож талбайг цэвэрлэнэ үү!</>
              )}
            </p>
            <div className="bg-teal-50 p-4 md:p-6 rounded-2xl border-4 border-dashed border-teal-200">
              <p className="text-lg md:text-xl font-bold text-teal-800">
                {t.scoreText.split('10').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="text-2xl md:text-3xl font-black mx-1 text-orange-500">10</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 md:space-y-6">
          <h2 className="text-[clamp(1.75rem,5vh,3rem)] font-black text-[#333] italic uppercase tracking-tighter leading-none">{t.tools}</h2>
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            <div className="bg-[#FFD54F] p-4 md:p-8 rounded-2xl md:rounded-[32px] cartoon-border text-center space-y-2">
              <span className="text-2xl md:text-4xl block">🔄</span>
              <span className="font-black text-[10px] md:text-sm uppercase tracking-widest block">{t.shuffle}</span>
            </div>
            <div className="bg-purple-300 p-4 md:p-8 rounded-2xl md:rounded-[32px] cartoon-border text-center space-y-2">
              <span className="text-2xl md:text-4xl block">📤</span>
              <span className="font-black text-[10px] md:text-sm uppercase tracking-widest block">{t.eject}</span>
            </div>
            <div className="bg-green-300 p-4 md:p-8 rounded-2xl md:rounded-[32px] cartoon-border text-center space-y-2">
              <span className="text-2xl md:text-4xl block">✨</span>
              <span className="font-black text-[10px] md:text-sm uppercase tracking-widest block">{t.auto}</span>
            </div>
          </div>
          <p className="text-center text-[10px] md:text-sm font-black text-teal-800 uppercase tracking-[0.1em] md:tracking-[0.2em] italic">
            {t.recharge}
          </p>
        </section>
      </div>
    </div>
  );
}
