import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import QuizLayout from '@/Layouts/QuizLayout';
import QuizFooter from '@/Components/QuizFooter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TimerDisplay = memo(({ timeElapsed, reducedMotion }) => (
  <div className={`flex items-center rounded-2xl border px-4 py-2 text-white shadow-lg backdrop-blur-sm ${timeElapsed <= 15 ? 'border-rose-300 bg-rose-500/30' : 'border-white/20 bg-white/10'}`}>
    <span className="text-lg mr-2">⏰</span>
    <motion.span
      key={timeElapsed}
      initial={reducedMotion ? false : { opacity: 0.65, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="text-lg font-bold font-mono tabular-nums"
    >
      {formatTime(timeElapsed)}
    </motion.span>
  </div>
));

const optionColors = [
  'bg-violet-500 hover:bg-violet-400',
  'bg-cyan-600 hover:bg-cyan-500',
  'bg-amber-400 hover:bg-amber-300',
  'bg-pink-600 hover:bg-pink-500',
];

const QuestionOptions = memo(({ options, selectedOption, answer, disabled, handleOptionSelect, reducedMotion }) => (
  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
    {options.map((option, index) => {
      const isSelected = selectedOption === index;
      const isCorrectOption = answer && index === answer.correct_answer;
      const isWrongPick = answer && isSelected && !answer.correct;
      const tileColor = isCorrectOption
        ? 'bg-green-500 hover:bg-green-500'
        : isWrongPick
          ? 'bg-red-500 hover:bg-red-500'
          : optionColors[index % optionColors.length];

      return (
        <motion.button
          key={index}
          initial={reducedMotion ? false : { y: 22, opacity: 0, scale: 0.96 }}
          animate={reducedMotion
            ? { opacity: 1 }
            : isWrongPick
              ? { x: [0, -7, 7, -4, 0], y: 0, opacity: 1, scale: 1 }
              : isCorrectOption
                ? { x: 0, y: 0, opacity: 1, scale: [1, 1.045, 1] }
                : { x: 0, y: isSelected ? -4 : 0, opacity: 1, scale: isSelected ? 1.015 : 1 }}
          transition={{ delay: answer ? 0 : 0.08 + index * 0.065, duration: answer ? 0.38 : 0.3, ease: 'easeOut' }}
          whileHover={!disabled && !reducedMotion ? { y: -4, scale: 1.015 } : undefined}
          whileTap={!disabled && !reducedMotion ? { scale: 0.97 } : undefined}
          onClick={() => handleOptionSelect(index)}
          disabled={disabled}
          aria-pressed={isSelected}
          className={`group relative min-h-24 w-full rounded-2xl border-2 p-4 text-left shadow-[0_6px_0_rgba(20,10,55,0.28)] transition-colors duration-150 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-32 sm:p-5 ${tileColor} ${index % optionColors.length === 2 && !isCorrectOption && !isWrongPick ? 'text-[#241044]' : 'text-white'} ${isSelected ? 'border-white ring-4 ring-white/60 shadow-[0_10px_0_rgba(20,10,55,0.28)]' : 'border-white/15'}`}
        >
          <AnimatePresence>
            {isSelected && !answer && (
              <motion.span
                initial={reducedMotion ? false : { scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 19 }}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#241044] shadow-sm"
                aria-hidden="true"
              >✓</motion.span>
            )}
          </AnimatePresence>
          <div className="flex h-full items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-lg font-black sm:h-12 sm:w-12">
              {String.fromCharCode(65 + index)}
            </div>
            <div className="flex-1 text-base font-bold leading-snug sm:text-lg">{option}</div>
            {isCorrectOption && (
              <motion.div initial={reducedMotion ? false : { scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }} className="ml-2 text-xl">✅</motion.div>
            )}
            {isWrongPick && (
              <motion.div initial={reducedMotion ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }} className="ml-2 text-xl">❌</motion.div>
            )}
          </div>
        </motion.button>
      );
    })}
  </div>
));

// Memoized Confetti Component
const Confetti = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-50 flex justify-center">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          y: -50,
          x: Math.random() * window.innerWidth - window.innerWidth / 2,
          rotate: Math.random() * 360
        }}
        animate={{
          y: window.innerHeight + 50,
          x: (Math.random() - 0.5) * 100,
          rotate: Math.random() * 360,
          opacity: [1, 0.5, 0]
        }}
        transition={{ duration: 1.5, ease: "linear", delay: Math.random() * 0.3 }}
        style={{
          width: 8,
          height: 8,
          backgroundColor: ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B'][Math.floor(Math.random() * 4)],
          position: 'absolute',
          borderRadius: '50%'
        }}
      />
    ))}
  </div>
));

const SubmittingScreen = ({ correct, total, points, timeElapsed }) => {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    <motion.div
      initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-3xl border-2 border-yellow-400 shadow-2xl p-8 max-w-md w-full text-center"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl mb-6"
      >
        🏆
      </motion.div>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        {t('calculating_victory')}
      </h2>
      <div className="bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: reducedMotion ? 0 : 2, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="text-blue-300 mb-6 text-lg font-semibold">🎮 {t('securing_rank')}</p>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-green-400 font-bold">✓ {t('correct_answers')}</div>
          <div className="text-white">{correct}/{total}</div>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-blue-400 font-bold">⏱️ {t('time')}</div>
          <div className="text-white">{formatTime(timeElapsed)}</div>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-yellow-400 font-bold">🎯 {t('score')}</div>
          <div className="text-white">{points.toLocaleString()} pts</div>
        </div>
      </div>
    </motion.div>
  </div>
  );
};

/**
 * Plays a Quiz Arena game started on the server. The server holds the correct
 * answers and the start time; this component only sends the player's choices.
 */
export default function QuizInterface({ quiz, onSubmit, onAnswered, submitting = false, submitError = null }) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [game, setGame] = useState(quiz);
  const { questions, answers } = game;
  const currentQuestion = game.current_index;
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checking, setChecking] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const advanceRef = useRef(false);
  const submitRef = useRef(false);

  // Display-only timer; the server measures the real time from its own start time.
  const startedAtRef = useRef(Date.now() - quiz.elapsed_seconds * 1000);
  const [timeElapsed, setTimeElapsed] = useState(Math.min(quiz.duration_seconds, quiz.elapsed_seconds));

  useEffect(() => {
    if (submitting) return;
    const intervalId = setInterval(() => {
      setTimeElapsed(Math.min(game.duration_seconds, Math.floor((Date.now() - startedAtRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [submitting, game.duration_seconds]);

  useEffect(() => {
    if (timeElapsed >= game.duration_seconds && !submitRef.current && !submitting) {
      submitRef.current = true;
      onSubmit();
    }
  }, [timeElapsed, game.duration_seconds, submitting, onSubmit]);

  useEffect(() => {
    onAnswered?.(answers.filter(Boolean).length);
  }, [answers, onAnswered]);

  const currentAnswer = answers[currentQuestion] ?? null;
  const showExplanation = currentAnswer !== null;
  const firstAnswers = useMemo(() => answers.map(answer => (answer ? answer.correct : null)), [answers]);
  const correctAnswersCount = firstAnswers.filter(answer => answer === true).length;

  const handleOptionSelect = async (optionIndex) => {
    if (showExplanation || checking || advancing || timeElapsed >= game.duration_seconds) return;

    setSelectedOption(optionIndex);
    setChecking(true);
    setAnswerError(null);

    try {
      const { data } = await axios.post('/quiz/answer', { index: currentQuestion, option: optionIndex });
      setGame(data.quiz);

      if (data.answer.correct) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    } catch (error) {
      if (error.response?.data?.expired) {
        submitRef.current = true;
        onSubmit();
        return;
      }
      setAnswerError(error.response?.data?.message || t('check_answer_failed'));
    } finally {
      setChecking(false);
    }
  };

  const nextQuestion = async () => {
    if (advanceRef.current || submitRef.current) return;
    advanceRef.current = true;
    setAdvancing(true);
    try {
      const { data } = await axios.post('/quiz/next');
      setGame(data.quiz);
      setSelectedOption(null);
      setAnswerError(null);
    } catch (error) {
      if (error.response?.data?.expired) {
        submitRef.current = true;
        onSubmit();
      } else {
        setAnswerError(error.response?.data?.message || 'Gagal memuat soalan seterusnya. Cuba lagi.');
      }
    } finally {
      advanceRef.current = false;
      setAdvancing(false);
    }
  };

  useEffect(() => {
    if (!showExplanation || submitting || timeElapsed >= game.duration_seconds) return;
    const timeout = setTimeout(nextQuestion, reducedMotion ? 1900 : 2800);
    return () => clearTimeout(timeout);
  }, [currentQuestion, showExplanation, submitting, game.duration_seconds]);

  if (submitting) {
    return (
      <QuizLayout title={t('submitting_results')}>
        <Head title={t('submitting_results')} />
        <SubmittingScreen correct={correctAnswersCount} total={game.answered_count} points={game.points} timeElapsed={timeElapsed} />
      </QuizLayout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <QuizLayout
      title={`${t('random_quiz')} · 2 minit`}
      firstAnswers={[]}
      footer={
        <QuizFooter
          showExplanation={showExplanation}
          currentQuestion={currentQuestion}
          selectedOption={showExplanation ? currentAnswer.selected : selectedOption}
          checking={checking || advancing}
          onNextQuestion={nextQuestion}
          answeredCount={game.answered_count}
          points={game.points}
          remainingSeconds={Math.max(0, game.duration_seconds - timeElapsed)}
          durationSeconds={game.duration_seconds}
        />
      }
    >
      <Head title={t('random_quiz')} />

      <AnimatePresence>
        {showConfetti && !reducedMotion && <Confetti />}
      </AnimatePresence>

      <div
        className="relative min-h-[calc(100dvh-160px)] overflow-hidden bg-gradient-to-br from-[#241044] via-[#341568] to-[#16103d]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px), radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px, 48px 48px',
            backgroundPosition: '0 0, 24px 24px',
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl"
          animate={reducedMotion ? undefined : { x: [0, 22, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -right-12 bottom-8 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
          animate={reducedMotion ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-3 py-5 sm:px-5 sm:py-7">
          {/* Compact Header */}
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-white shadow-md backdrop-blur-sm sm:px-5">
              <span className="font-bold">🎯 {t('quiz_quest')}</span>
              <span className="ml-2 hidden text-xs text-violet-200 sm:inline">Jawab sebanyak mungkin dalam 2 minit</span>
            </div>

            <TimerDisplay timeElapsed={Math.max(0, game.duration_seconds - timeElapsed)} reducedMotion={reducedMotion} />
          </div>

          {(submitError || answerError) && (
            <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {submitError || answerError}
              {submitError && <button type="button" onClick={onSubmit} className="ml-3 rounded bg-red-700 px-3 py-1 text-white">Cuba simpan semula</button>}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentQuestion}
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -18, scale: 0.985 }}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
            className="overflow-hidden rounded-3xl border border-white/15 bg-[#2c1757] shadow-2xl shadow-black/30"
          >
            {/* Compact Progress Header */}
            <div className="border-b border-white/10 bg-white/5 p-4 sm:px-6 sm:py-5">
              <div className="flex justify-between items-center">
                <div className="min-w-0 text-white font-bold">
                  <span>{t('question')} {currentQuestion + 1}</span>
                  <span className="ml-2 inline-block max-w-[150px] truncate rounded-full bg-violet-500 px-2.5 py-1 align-middle text-xs text-white sm:max-w-none">
                    {question.category}
                  </span>
                </div>
                <div className="shrink-0 text-right text-xs font-bold text-amber-300">
                  ⭐ <motion.span
                    key={game.points}
                    initial={reducedMotion ? false : { scale: 1.4, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                    className="inline-block"
                  >{game.points.toLocaleString()}</motion.span> pts
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15" aria-label="Masa berbaki">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400 transition-[width] duration-1000" style={{ width: `${Math.max(0, 100 * (game.duration_seconds - timeElapsed) / game.duration_seconds)}%` }} />
              </div>
              <p className="mt-2 text-xs text-violet-200">Bonus kelajuan untuk jawapan betul dalam 10 saat pertama</p>
            </div>

            <div className="p-4 sm:p-7">
              <motion.h2
                className="mb-6 rounded-2xl border border-white/10 bg-white/10 p-6 text-center text-xl font-extrabold leading-relaxed text-white shadow-inner sm:mb-7 sm:p-8 sm:text-3xl"
                initial={reducedMotion ? false : { y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.08, duration: 0.28 }}
              >
                {question.question}
              </motion.h2>

              <div className="mb-4 text-center text-sm font-semibold text-violet-200">{t('choose_answer')}</div>

              <QuestionOptions
                options={question.options}
                selectedOption={showExplanation ? currentAnswer.selected : selectedOption}
                answer={currentAnswer}
                disabled={showExplanation || checking || advancing}
                handleOptionSelect={handleOptionSelect}
                reducedMotion={reducedMotion}
              />

              {showExplanation && (
                <motion.div
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.25 }}
                  className={`mt-4 rounded-xl border-2 p-4 ${currentAnswer.correct ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg mr-3 ${
                      currentAnswer.correct ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {currentAnswer.correct ? "✓" : "!"}
                    </div>
                    <div>
                      <h3 className={`font-bold ${currentAnswer.correct ? "text-green-800" : "text-red-800"}`}>
                        {currentAnswer.correct ? `${t('correct_feedback')} 🎉` : `${t('learn')}: `}
                      </h3>
                      <p className="text-gray-700 mt-1 text-sm">{currentAnswer.explanation}</p>
                      <p className="mt-2 text-xs font-bold text-gray-600">+{currentAnswer.points} mata · bonus {currentAnswer.bonus_points} · Soalan seterusnya sebentar lagi…</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </QuizLayout>
  );
}
