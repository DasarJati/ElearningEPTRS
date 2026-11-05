import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function QuizFooter({ showExplanation, currentQuestion, checking, onNextQuestion, answeredCount = 0, points = 0, remainingSeconds = 120, durationSeconds = 120 }) {
  const reducedMotion = useReducedMotion();
  return (
    <footer className="sticky bottom-0 z-40 overflow-hidden border-t border-white/10 bg-[#1c103b]/95 text-white shadow-[0_-8px_30px_rgba(10,5,35,0.28)] backdrop-blur-xl">
      <div className="h-1 bg-white/10" aria-hidden="true">
        <motion.div className="h-full bg-gradient-to-r from-fuchsia-400 to-amber-300" initial={false} animate={{ width: `${100 * remainingSeconds / durationSeconds}%` }} transition={{ duration: reducedMotion ? 0 : 0.45 }} />
      </div>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 p-3 sm:px-5 sm:py-4">
        <div>
          <div className="font-bold">Soalan <span className="text-amber-300">{currentQuestion + 1}</span> · {answeredCount} dijawab</div>
          <p className="text-xs text-violet-200">{showExplanation ? 'Baca penerangan. Soalan seterusnya akan muncul secara automatik.' : 'Pilih jawapan untuk terus semak.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-bold text-amber-200">⭐ {points.toLocaleString()} mata</span>
          {showExplanation && <button type="button" onClick={onNextQuestion} disabled={checking} className="rounded-xl bg-amber-300 px-4 py-2.5 font-bold text-[#241044] disabled:opacity-50">Seterusnya →</button>}
        </div>
      </div>
    </footer>
  );
}
