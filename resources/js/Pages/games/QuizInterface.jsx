import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import QuizLayout from '@/Layouts/QuizLayout';
import QuizFooter from '@/Components/QuizFooter';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Memoized Timer Display Component - COMPACT GAMING STYLE
const TimerDisplay = memo(({ timeElapsed }) => (
  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow px-4 py-2 flex items-center border-2 border-yellow-400">
    <span className="text-lg mr-2">⏰</span>
    <span className="text-lg font-bold font-mono">{formatTime(timeElapsed)}</span>
  </div>
));

// Memoized Question Options Component - COMPACT
const QuestionOptions = memo(({ options, selectedOption, answer, disabled, handleOptionSelect }) => (
  <div className="space-y-3 mb-4">
    {options.map((option, index) => {
      const isSelected = selectedOption === index;
      const isCorrectOption = answer && index === answer.correct_answer;
      const isWrongPick = answer && isSelected && !answer.correct;

      return (
        <motion.button
          key={index}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          onClick={() => handleOptionSelect(index)}
          disabled={disabled}
          aria-pressed={isSelected}
          className={`group w-full p-3.5 sm:p-4 text-left transition-all duration-200 rounded-xl border-2 ${
            isSelected
              ? "border-yellow-500 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg sm:scale-[1.01]"
              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
          } ${isCorrectOption ? "border-green-500 bg-gradient-to-r from-green-400 to-emerald-400 text-white" : ""
          } ${isWrongPick ? "border-red-500 bg-gradient-to-r from-red-400 to-pink-400 text-white" : ""}`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mr-3 font-bold ${
              isSelected ? "bg-white text-orange-600 border-white" : "bg-gray-100 text-gray-700 border-gray-300"
            } ${isCorrectOption ? "bg-white text-green-600 border-white" : ""
            } ${isWrongPick ? "bg-white text-red-600 border-white" : ""}`}>
              {String.fromCharCode(65 + index)}
            </div>
            <div className="text-base flex-1">{option}</div>
            {isCorrectOption && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 text-xl">✅</motion.div>
            )}
            {isWrongPick && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 text-xl">❌</motion.div>
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

const SubmittingScreen = ({ correct, total, timeElapsed }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-3xl border-2 border-yellow-400 shadow-2xl p-8 max-w-md w-full text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl mb-6"
      >
        🏆
      </motion.div>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        Calculating Your Victory!
      </h2>
      <div className="bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="text-blue-300 mb-6 text-lg font-semibold">🎮 Securing your place in the leaderboard...</p>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-green-400 font-bold">✓ Correct</div>
          <div className="text-white">{correct}/{total}</div>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-blue-400 font-bold">⏱️ Time</div>
          <div className="text-white">{formatTime(timeElapsed)}</div>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg">
          <div className="text-yellow-400 font-bold">🎯 Score</div>
          <div className="text-white">{Math.round((correct / total) * 100)}%</div>
        </div>
      </div>
    </motion.div>
  </div>
);

/**
 * Plays a Quiz Arena game started on the server. The server holds the correct
 * answers and the start time; this component only sends the player's choices.
 */
export default function QuizInterface({ quiz, onSubmit, onAnswered, submitting = false, submitError = null }) {
  const { questions } = quiz;
  const [answers, setAnswers] = useState(quiz.answers);
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const firstUnanswered = quiz.answers.findIndex(answer => answer === null);
    return firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checking, setChecking] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  // Display-only timer; the server measures the real time from its own start time.
  const startedAtRef = useRef(Date.now() - quiz.elapsed_seconds * 1000);
  const [timeElapsed, setTimeElapsed] = useState(quiz.elapsed_seconds);

  useEffect(() => {
    if (submitting) return;
    const intervalId = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [submitting]);

  useEffect(() => {
    onAnswered?.(answers.filter(Boolean).length);
  }, [answers, onAnswered]);

  const currentAnswer = answers[currentQuestion];
  const showExplanation = currentAnswer !== null;
  const firstAnswers = useMemo(() => answers.map(answer => (answer ? answer.correct : null)), [answers]);
  const correctAnswersCount = firstAnswers.filter(answer => answer === true).length;

  const handleOptionSelect = (optionIndex) => {
    if (!showExplanation && !checking) {
      setSelectedOption(optionIndex);
    }
  };

  const checkAnswer = async () => {
    if (selectedOption === null || showExplanation || checking) return;

    setChecking(true);
    setAnswerError(null);

    try {
      const { data } = await axios.post('/quiz/answer', { index: currentQuestion, option: selectedOption });
      setAnswers(prev => prev.map((answer, index) => (index === currentQuestion ? data.answer : answer)));
      setExplanationVisible(true);

      if (data.answer.correct) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    } catch (error) {
      setAnswerError(error.response?.data?.message || 'Gagal menyemak jawapan. Sila cuba lagi.');
    } finally {
      setChecking(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setExplanationVisible(false);
      setAnswerError(null);
    } else {
      onSubmit();
    }
  };

  if (submitting) {
    return (
      <QuizLayout title="Submitting Results...">
        <Head title="Submitting Results" />
        <SubmittingScreen correct={correctAnswersCount} total={questions.length} timeElapsed={timeElapsed} />
      </QuizLayout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <QuizLayout
      title="Random Quiz (5 Questions)"
      firstAnswers={firstAnswers}
      footer={
        <QuizFooter
          showExplanation={showExplanation}
          currentQuestion={currentQuestion}
          selectedOption={showExplanation ? currentAnswer.selected : selectedOption}
          checking={checking}
          onCheckAnswer={checkAnswer}
          onNextQuestion={nextQuestion}
          questions={questions}
        />
      }
    >
      <Head title="Random Quiz" />

      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      <div
        className="relative overflow-hidden bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: 'linear-gradient(135deg, rgba(30,64,175,0.16), rgba(88,28,135,0.20)), url(/images/background_quiz.jpg)' }}
      >
        <div className="pointer-events-none absolute -left-16 top-12 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-8 h-44 w-44 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-3 pt-4 pb-2 sm:px-4 sm:pt-6">
          {/* Compact Header */}
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div className="rounded-xl border border-yellow-300/80 bg-gradient-to-r from-purple-700 to-blue-700 px-3 py-2 text-white shadow-lg sm:px-4">
              <span className="font-bold">🎯 Quiz Quest</span>
              <span className="ml-2 hidden text-xs text-blue-100 sm:inline">5 quick questions</span>
            </div>

            <TimerDisplay timeElapsed={timeElapsed} />
          </div>

          {(submitError || answerError) && (
            <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {submitError || answerError}
            </div>
          )}

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-2xl border-2 border-yellow-400 bg-white/95 shadow-2xl backdrop-blur-sm"
          >
            {/* Compact Progress Header */}
            <div className="border-b-2 border-yellow-400 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-3.5 sm:p-4">
              <div className="flex justify-between items-center">
                <div className="min-w-0 text-white font-bold">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="ml-2 inline-block max-w-[150px] truncate rounded-full bg-yellow-400 px-2 py-1 align-middle text-xs text-gray-900 sm:max-w-none">
                    {question.category}
                  </span>
                </div>
                <div className="shrink-0 text-right text-xs font-bold text-yellow-300">
                  ⭐ {correctAnswersCount} correct
                </div>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1.5" aria-label={`Question ${currentQuestion + 1} of ${questions.length}`}>
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-colors ${
                      firstAnswers[index] !== null
                        ? firstAnswers[index] ? 'bg-emerald-400' : 'bg-rose-400'
                        : index === currentQuestion ? 'bg-yellow-300' : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <motion.h2
                className="mb-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-left text-lg font-bold leading-relaxed text-gray-800 sm:mb-6 sm:p-5 sm:text-center sm:text-xl"
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {question.question}
              </motion.h2>

              <div className="mb-3 text-sm font-bold text-gray-600 sm:mb-4">🎯 Choose your answer</div>

              <QuestionOptions
                options={question.options}
                selectedOption={showExplanation ? currentAnswer.selected : selectedOption}
                answer={currentAnswer}
                disabled={showExplanation || checking}
                handleOptionSelect={handleOptionSelect}
              />

              {/* Compact Explanation Toggle */}
              {showExplanation && (
                <div className="flex justify-center mb-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setExplanationVisible(visible => !visible)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow hover:shadow-md transition duration-200 flex items-center gap-2"
                  >
                    <span>📖</span>
                    <span>{explanationVisible ? "Hide" : "Reveal"}</span>
                  </motion.button>
                </div>
              )}

              {/* Compact Explanation */}
              {showExplanation && explanationVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
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
                        {currentAnswer.correct ? "Correct! 🎉" : "Learn: "}
                      </h3>
                      <p className="text-gray-700 mt-1 text-sm">{currentAnswer.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </QuizLayout>
  );
}
