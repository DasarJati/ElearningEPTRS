// Components/QuizFooter.jsx - VERSI SIMPLIFIED
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function QuizFooter({
  showExplanation,
  currentQuestion,
  selectedOption,
  checking = false,
  onCheckAnswer,
  onNextQuestion,
  questions,
  onToggleCalculator,
  calculatorOpen = false
}) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const progress = questions.length > 0
    ? Math.round(((currentQuestion + 1) / questions.length) * 100)
    : 0;

  return (
    <footer className="sticky bottom-0 z-40 overflow-hidden border-t border-white/10 bg-[#1c103b]/95 text-white shadow-[0_-8px_30px_rgba(10,5,35,0.28)] backdrop-blur-xl">
      <div className="h-1 bg-white/10" aria-hidden="true">
        <motion.div
          className="h-full rounded-r-full bg-gradient-to-r from-fuchsia-400 to-amber-300"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 p-3 sm:px-5 sm:py-4">
        {/* Question info */}
        <div className="min-w-0">
          <div className="text-sm font-bold text-white sm:text-base">
            {t('question')} <span className="text-amber-300">{currentQuestion + 1}</span> / {questions.length}
          </div>
          <p className="hidden text-xs text-violet-200 sm:block">
            {t(showExplanation ? 'review_continue_quest' : 'choose_then_check')}
          </p>
        </div>
        
        {/* Action buttons - SIMPLIFIED VERSION */}
        <div className="ml-auto flex items-center space-x-2">
          {onToggleCalculator && (
            <motion.button
              whileHover={reducedMotion ? undefined : { y: -2, scale: 1.03 }}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              onClick={onToggleCalculator}
              aria-pressed={calculatorOpen}
              title={t('calculator')}
              className={`rounded-xl border p-2.5 text-white ${calculatorOpen ? 'border-amber-300 bg-white/20' : 'border-white/20 bg-white/10 hover:bg-white/20'}`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="sr-only">{t('calculator')}</span>
            </motion.button>
          )}
          {!showExplanation ? (
            <motion.button
              whileHover={reducedMotion || selectedOption === null || checking ? undefined : { y: -2, scale: 1.03 }}
              whileTap={reducedMotion || selectedOption === null || checking ? undefined : { scale: 0.96 }}
              onClick={onCheckAnswer}
              disabled={selectedOption === null || checking}
              className={`rounded-xl px-4 py-2.5 font-bold sm:px-6 ${selectedOption === null || checking ? 'cursor-not-allowed bg-white/20 text-violet-200 shadow-[0_4px_0_rgba(0,0,0,0.22)]' : 'bg-yellow-300 text-[#241044] shadow-[0_0_22px_rgba(253,224,71,0.65),0_4px_0_rgba(0,0,0,0.22)] hover:bg-yellow-200'}`}
            >
              {t(checking ? 'checking' : 'check_answer')}
            </motion.button>
          ) : (
            // TAMPILKAN LANGSUNG NEXT BUTTON TANPA TRY AGAIN
            <motion.button
              whileHover={reducedMotion ? undefined : { y: -2, scale: 1.03 }}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              onClick={onNextQuestion}
              className="rounded-xl bg-amber-300 px-4 py-2.5 font-bold text-[#241044] shadow-[0_4px_0_rgba(0,0,0,0.22)] hover:bg-amber-200 sm:px-6"
            >
              {t(currentQuestion < questions.length - 1 ? 'next_question' : 'finish_quiz')}
            </motion.button>
          )}
        </div>
      </div>
    </footer>
  );
}
