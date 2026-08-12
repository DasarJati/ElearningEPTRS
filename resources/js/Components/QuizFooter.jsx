// Components/QuizFooter.jsx - VERSI SIMPLIFIED
import React from 'react';
import { motion } from 'framer-motion';

export default function QuizFooter({
  showExplanation,
  answeredQuestions,
  currentQuestion,
  selectedOption,
  isCorrect,
  firstAnswers,
  onCheckAnswer,
  onNextQuestion,
  onTryAgain,
  onSkipQuestion,
  showRetryOption,
  questions,
  onQuestionSelect
}) {
  const progress = questions.length > 0
    ? Math.round(((currentQuestion + 1) / questions.length) * 100)
    : 0;

  return (
    <footer className="sticky bottom-0 z-40 overflow-hidden border-t border-yellow-400/70 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shadow-[0_-4px_18px_rgba(15,23,42,0.28)]">
      <div className="h-1 bg-white/20" aria-hidden="true">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 p-3 sm:p-4">
        {/* Question info */}
        <div className="min-w-0">
          <div className="text-sm font-bold text-white sm:text-base">
            Question <span className="text-yellow-300">{currentQuestion + 1}</span> / {questions.length}
          </div>
          <p className="hidden text-xs text-blue-100/80 sm:block">
            {showExplanation ? 'Great effort—review and continue your quest!' : 'Choose carefully, then check your answer.'}
          </p>
        </div>
        
        {/* Action buttons - SIMPLIFIED VERSION */}
        <div className="ml-auto flex space-x-2">
          {!showExplanation ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheckAnswer}
              disabled={selectedOption === null}
              className={`rounded-xl border px-4 py-2.5 font-bold text-white shadow-lg sm:px-6 ${selectedOption === null ? 'cursor-not-allowed border-white/10 bg-slate-500/80' : 'border-emerald-300 bg-emerald-500 hover:bg-emerald-600'}`}
            >
              Check Answer
            </motion.button>
          ) : (
            // TAMPILKAN LANGSUNG NEXT BUTTON TANPA TRY AGAIN
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextQuestion}
              className="rounded-xl border border-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-400 px-4 py-2.5 font-bold text-slate-900 shadow-lg sm:px-6"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </motion.button>
          )}
        </div>
      </div>
    </footer>
  );
}
