import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import QuizLayout from '@/Layouts/QuizLayout';
import QuizFooter from '@/Components/QuizFooter';
import ComicArt from '@/Components/ComicArt';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';
import '../../../css/quiz-comic.css';

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TimerDisplay = memo(({ remainingSeconds, reducedMotion }) => (
  <div className="comic-timer" data-urgent={remainingSeconds <= 15} role="timer" aria-label="Masa berbaki">
    <span aria-hidden="true">⏱</span>
    <motion.span
      key={remainingSeconds}
      initial={reducedMotion ? false : { opacity: 0.65, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="font-mono text-sm font-bold tabular-nums sm:text-base"
    >
      {formatTime(remainingSeconds)}
    </motion.span>
  </div>
));

const QuestionOptions = memo(({ options, selectedOption, answer, disabled, handleOptionSelect, reducedMotion }) => (
  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:gap-5 2xl:gap-6">
    {options.map((option, index) => {
      const isSelected = selectedOption === index;
      const isCorrectOption = answer && index === answer.correct_answer;
      const isWrongPick = answer && isSelected && !answer.correct;
      const optionState = isCorrectOption ? 'correct' : isWrongPick ? 'wrong' : undefined;

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
          data-state={optionState}
          className="comic-option min-h-[4.5rem] w-full p-3 text-left sm:min-h-24 sm:p-4"
        >
          <div className="flex h-full items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center comic-letter text-lg font-black sm:h-12 sm:w-12 2xl:h-14 2xl:w-14 2xl:text-2xl">
              {String.fromCharCode(65 + index)}
            </div>
            <div className="min-w-0 flex-1 break-words text-base font-bold leading-snug sm:text-lg xl:text-[clamp(1.125rem,1.15vw,1.75rem)]">{option}</div>
            <AnimatePresence>
              {isSelected && !answer && (
                <motion.span
                  initial={reducedMotion ? false : { scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 19 }}
                  className="comic-option-check flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  aria-hidden="true"
                >✓</motion.span>
              )}
            </AnimatePresence>
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
  <div className="comic-stage min-h-screen flex items-center justify-center p-4">
    <motion.div
      initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="comic-card comic-form p-5 sm:p-8 max-w-md w-full text-center"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl mb-6"
      >
        🏆
      </motion.div>
      <h2 className="comic-display text-3xl mb-4">
        {t('calculating_victory')}
      </h2>
      <div className="bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: reducedMotion ? 0 : 2, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="text-amber-100 mb-6 text-lg font-semibold">🎮 {t('securing_rank')}</p>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-green-400 font-bold">✓ {t('correct_answers')}</div>
          <div className="text-white">{correct}/{total}</div>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-amber-200 font-bold">⏱️ {t('time')}</div>
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
  const [scoreFx, setScoreFx] = useState(null);
  const [checking, setChecking] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const advanceRef = useRef(false);
  const pendingNextRef = useRef(null);
  const gameRef = useRef(quiz);
  gameRef.current = game;
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

  const handleOptionSelect = (optionIndex) => {
    if (showExplanation || checking || advancing || timeElapsed >= game.duration_seconds) return;
    setSelectedOption(optionIndex);
    setAnswerError(null);
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null || showExplanation || checking || advancing || timeElapsed >= game.duration_seconds) return;

    setChecking(true);
    setAnswerError(null);

    try {
      // The server must have moved to this question before it can take the answer.
      if (pendingNextRef.current) await pendingNextRef.current;
      const { data } = await axios.post('/quiz/answer', { index: currentQuestion, option: selectedOption });
      setGame(data.quiz);

      const delta = data.answer.applied_points ?? data.answer.points;
      if (delta !== 0) {
        const id = Date.now();
        setScoreFx({ id, value: delta });
        setTimeout(() => setScoreFx(current => (current?.id === id ? null : current)), 1600);
      }

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

  // Questions are already in the browser, so move to the next one instantly and
  // tell the server in the background instead of waiting for its response.
  const nextQuestion = async () => {
    if (advanceRef.current || submitRef.current) return;
    const current = gameRef.current;
    const fromIndex = current.current_index;
    if (current.answers[fromIndex] === null) return;

    advanceRef.current = true;
    const hasNext = fromIndex + 1 < current.questions.length;

    if (hasNext) {
      setGame(prev => ({ ...prev, current_index: fromIndex + 1 }));
      setSelectedOption(null);
      setAnswerError(null);
    } else {
      setAdvancing(true);
    }

    const run = async () => {
      try {
        const { data } = await axios.post('/quiz/next');
        setGame(data.quiz);
        if (!hasNext) {
          setSelectedOption(null);
          setAnswerError(null);
        }
      } catch (error) {
        if (error.response?.data?.expired) {
          submitRef.current = true;
          onSubmit();
        } else {
          setAnswerError(error.response?.data?.message || 'Gagal memuat soalan seterusnya. Cuba lagi.');
          if (hasNext) setGame(prev => ({ ...prev, current_index: fromIndex }));
        }
      } finally {
        advanceRef.current = false;
        pendingNextRef.current = null;
        if (!hasNext) setAdvancing(false);
      }
    };

    pendingNextRef.current = run();
    await pendingNextRef.current;
  };

  if (submitting) {
    return (
      <QuizLayout title={t('submitting_results')} bgColor="quiz-comic">
        <Head title={t('submitting_results')} />
        <SubmittingScreen correct={correctAnswersCount} total={game.answered_count} points={game.points} timeElapsed={timeElapsed} />
      </QuizLayout>
    );
  }

  const question = questions[currentQuestion];
  const remainingSeconds = Math.max(0, game.duration_seconds - timeElapsed);

  return (
    <QuizLayout
      title="Misi Buku · 2 minit"
      bgColor="quiz-comic comic-reading"
      firstAnswers={[]}
      footer={
        <QuizFooter
          showExplanation={showExplanation}
          currentQuestion={currentQuestion}
          selectedOption={showExplanation ? currentAnswer.selected : selectedOption}
          checking={checking || advancing}
          onCheckAnswer={handleCheckAnswer}
          onNextQuestion={nextQuestion}
          answeredCount={game.answered_count}
          points={game.points}
          remainingSeconds={remainingSeconds}
          durationSeconds={game.duration_seconds}
        />
      }
    >
      <Head title="Quiz Arena – Misi Buku" />

      <AnimatePresence>
        {showConfetti && !reducedMotion && <Confetti />}
      </AnimatePresence>

      <div className="comic-stage comic-reading-stage relative min-h-[calc(100dvh-160px)]">
        <div className="quiz-responsive-content relative z-10 px-3 py-5 sm:px-5 sm:py-7 xl:px-7 xl:py-[clamp(1.75rem,3.5vh,3rem)]">
          {(submitError || answerError) && (
            <div className="comic-card comic-quiz-alert mb-3 px-4 py-3 text-sm font-bold" role="alert">
              {submitError || answerError}
              {submitError && <button type="button" onClick={onSubmit} className="ml-3 px-3 py-1">Cuba simpan semula</button>}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentQuestion}
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -18, scale: 0.985 }}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
            className="comic-card comic-reading-panel"
          >
            {/* Compact Progress Header */}
            <div className="comic-question-header p-4 sm:px-6 sm:py-5 2xl:px-9 2xl:py-6">
              <div className="flex justify-between items-center">
                <div className="min-w-0 font-bold 2xl:text-xl">
                  <span>{t('question')} {currentQuestion + 1}</span>
                  <span className="comic-category">
                    {question.category}
                  </span>
                </div>
                <div className="comic-score relative shrink-0 text-right text-sm font-extrabold">
                  ⭐ <motion.span
                    key={game.points}
                    initial={reducedMotion ? false : { scale: scoreFx?.value < 0 ? 0.7 : 1.4, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                    className="inline-block"
                  >{game.points.toLocaleString()}</motion.span> pts
                  <AnimatePresence>
                    {scoreFx && (
                      <motion.span
                        key={scoreFx.id}
                        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.8 }}
                        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 22, scale: 1.1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
                        className="comic-card pointer-events-none absolute right-0 top-full z-20 whitespace-nowrap px-3 py-1 text-sm font-black"
                        role="status"
                      >
                        {scoreFx.value < 0 ? '−' : '+'}{Math.abs(scoreFx.value).toLocaleString()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="comic-progress min-w-0 flex-1" aria-hidden="true">
                  <div className="h-full bg-[#1E5BD8] transition-[width] duration-1000" style={{ width: `${100 * remainingSeconds / game.duration_seconds}%` }} />
                </div>
                <TimerDisplay remainingSeconds={remainingSeconds} reducedMotion={reducedMotion} />
              </div>
              <p className="mt-2 text-xs font-bold">Betul +1,000 (bonus kelajuan dalam 10 saat pertama) · Salah −333</p>
            </div>

            <div className="p-4 sm:p-7 xl:p-[clamp(1.75rem,2vh,2.75rem)]">
              <motion.h2
                className="comic-question mb-4 p-4 text-left text-xl font-extrabold leading-snug sm:p-6 sm:text-3xl"
                initial={reducedMotion ? false : { y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.08, duration: 0.28 }}
              >
                {question.question}
              </motion.h2>

              <div className="mb-3 text-sm font-extrabold">{t('choose_answer')}</div>

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
                  className="comic-feedback comic-bubble mt-6 p-4"
                  data-correct={currentAnswer.correct}
                  role="status"
                >
                  <div className="comic-feedback-heading">
                    <ComicArt
                      file={currentAnswer.correct ? 'mascot-happy.png' : 'mascot-sad.png'}
                      className="comic-reaction-mascot"
                    />
                    <h3 className="comic-display comic-feedback-label">
                      <ComicArt
                        file={currentAnswer.correct ? 'fx-correct.png' : 'fx-wrong.png'}
                        className="comic-feedback-fx"
                      />
                      <span>{currentAnswer.correct ? 'POW! Betul!' : 'Alamak!'}</span>
                    </h3>
                  </div>
                  <p className="mt-2 text-sm">{currentAnswer.explanation}</p>
                  <p className="mt-2 text-sm font-black">
                    {currentAnswer.correct
                      ? `+${currentAnswer.points.toLocaleString()} mata${currentAnswer.bonus_points ? ` (termasuk bonus ${currentAnswer.bonus_points})` : ''}`
                      : (currentAnswer.applied_points ?? currentAnswer.points) === 0 ? 'Salah · 0 mata' : `−${Math.abs(currentAnswer.applied_points ?? currentAnswer.points).toLocaleString()} mata`}
                  </p>
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
