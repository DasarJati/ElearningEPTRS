import React, { useState, useRef } from 'react';
import axios from 'axios';
import { router, Link } from '@inertiajs/react';
import QuizInterface from './QuizInterface';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';
import { motion, useReducedMotion } from 'framer-motion';

const LEADERBOARD_TITLE = 'k-semanis 2026';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
};

const rankMark = (index) => ['🥇', '🥈', '🥉'][index] || `#${index + 1}`;

const podiumStyles = [
  {
    mascot: '/images/quiz-podium-lion.png',
    card: 'border-amber-300/70 bg-gradient-to-br from-[#65451f] via-[#3b2945] to-[#252044] shadow-amber-500/15',
    stripe: 'from-yellow-200 via-amber-400 to-orange-500',
    glow: 'bg-amber-300/25',
    accent: 'text-amber-200',
    stat: 'bg-amber-300/15 text-amber-100',
  },
  {
    mascot: '/images/quiz-podium-fox.png',
    card: 'border-slate-200/55 bg-gradient-to-br from-[#44546d] via-[#313453] to-[#242343] shadow-slate-300/10',
    stripe: 'from-white via-slate-300 to-slate-500',
    glow: 'bg-slate-200/20',
    accent: 'text-slate-200',
    stat: 'bg-slate-200/15 text-slate-100',
  },
  {
    mascot: '/images/quiz-podium-bear.png',
    card: 'border-orange-300/55 bg-gradient-to-br from-[#704235] via-[#3d2945] to-[#292044] shadow-orange-500/10',
    stripe: 'from-orange-200 via-amber-700 to-orange-400',
    glow: 'bg-orange-300/20',
    accent: 'text-orange-200',
    stat: 'bg-orange-300/15 text-orange-100',
  },
];

const scoreStyles = [
  { face: '/images/quiz-score-1-mouse.png', row: 'bg-slate-400/5 hover:bg-slate-400/10', card: 'border-slate-300/20 bg-slate-400/10', edge: 'border-slate-400/50', badge: 'bg-slate-300/15 text-slate-200', faceBg: 'bg-slate-300/15' },
  { face: '/images/quiz-score-1-mouse.png', row: 'bg-rose-500/10 hover:bg-rose-500/15', card: 'border-rose-300/30 bg-rose-500/10', edge: 'border-rose-400/70', badge: 'bg-rose-300/20 text-rose-100', faceBg: 'bg-rose-300/20' },
  { face: '/images/quiz-score-2-rabbit.png', row: 'bg-orange-500/10 hover:bg-orange-500/15', card: 'border-orange-300/30 bg-orange-500/10', edge: 'border-orange-400/70', badge: 'bg-orange-300/20 text-orange-100', faceBg: 'bg-orange-300/20' },
  { face: '/images/quiz-score-3-bear.png', row: 'bg-amber-500/10 hover:bg-amber-500/15', card: 'border-amber-300/30 bg-amber-500/10', edge: 'border-amber-400/70', badge: 'bg-amber-300/20 text-amber-100', faceBg: 'bg-amber-300/20' },
  { face: '/images/quiz-score-4-fox.png', row: 'bg-sky-500/10 hover:bg-sky-500/15', card: 'border-sky-300/30 bg-sky-500/10', edge: 'border-sky-400/70', badge: 'bg-sky-300/20 text-sky-100', faceBg: 'bg-sky-300/20' },
  { face: '/images/quiz-score-5-lion.png', row: 'bg-emerald-500/10 hover:bg-emerald-500/15', card: 'border-emerald-300/30 bg-emerald-500/10', edge: 'border-emerald-400/70', badge: 'bg-emerald-300/20 text-emerald-100', faceBg: 'bg-emerald-300/20' },
];

const getScoreStyle = (correct, answered) => scoreStyles[Math.min(5, Math.max(0, Math.round(5 * correct / (answered || 1))))];

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white/10 px-4 py-3 text-white placeholder-violet-200/50 focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-400 focus:ring-red-400/40' : 'border-white/15 focus:border-violet-300 focus:ring-violet-400/30'
  }`;

const FieldError = ({ message }) =>
  message ? <p className="mt-1.5 text-sm text-red-400" role="alert">{message}</p> : null;

// Declared at module level so the running quiz is not remounted when the page re-renders.
const QuizGame = ({ quiz, schoolName, onFinished, onSessionLost }) => {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [submitError, setSubmitError] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(quiz.answered_count);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data } = await axios.post('/quiz/submit');
      onFinished(data.result);
    } catch (error) {
      const message = error.response?.data?.message || t('quiz_save_failed');

      // 409: session expired, 422: player name already used — the game cannot be saved.
      if ([409, 422].includes(error.response?.status)) {
        onSessionLost(message);
        return;
      }

      setSubmitError(message);
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleExit = async () => {
    const details = `${t('your_results')} ${t('will_be_saved')} ${t('to_leaderboard_now')}\n`
      + `${answeredCount} soalan sudah dijawab. Mata semasa akan disimpan.\n`
      + `${t('name')} ${quiz.player.display_name} ${t('name_cannot_retry')}.`;
    if (await confirmAlert(t, { title: t('exit_quiz_question'), text: details, confirmText: t('exit_save') })) {
      handleSubmit();
    }
  };

  return (
    <div className="game-interface">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{t('quiz_challenge')}</h1>
            <p className="text-blue-100 text-sm">{t('player')}: {quiz.player.display_name} | {t('school')}: {schoolName}</p>
          </div>
          {!submitting && (
            <button
              type="button"
              onClick={handleExit}
              className="shrink-0 rounded-xl border border-white/40 bg-red-500/90 px-3 py-2 text-sm font-bold text-white shadow-lg hover:bg-red-600 sm:px-4"
            >
              {t('exit_quiz')}
            </button>
          )}
        </div>
      </div>

      <QuizInterface
        quiz={quiz}
        onSubmit={handleSubmit}
        onAnswered={setAnsweredCount}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
};

const ResultModal = ({ result, onClose }) => {
  const { t } = useLanguage();
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
    <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-yellow-400 bg-gray-800 text-center shadow-2xl">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <h2 className="text-2xl font-bold text-white">
          {result.answered > 0 && result.correct === result.answered ? `${t('perfect')} 🎉` : `${t('quiz_complete')} 🎯`}
        </h2>
      </div>
      <div className="p-6">
        <div className="text-6xl mb-2">
          {result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : result.rank === 3 ? '🥉' : '🏅'}
        </div>
        <p className="text-blue-300 mb-6">
          {t('your_rank')}: <span className="text-2xl font-bold text-yellow-300">#{result.rank}</span>
          <span className="text-gray-400"> {t('of')} {result.total_players} {t('players')}</span>
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-gray-700 p-3">
            <div className="text-xs font-bold text-green-400">✓ {t('correct_answers')}</div>
            <div className="text-lg font-bold text-white">{result.correct}/{result.answered}</div>
          </div>
          <div className="rounded-lg bg-gray-700 p-3">
            <div className="text-xs font-bold text-blue-400">⏱️ {t('time')}</div>
            <div className="text-lg font-bold text-white font-mono">{formatTime(result.time)}</div>
          </div>
          <div className="rounded-lg bg-gray-700 p-3">
            <div className="text-xs font-bold text-yellow-400">🎯 {t('score')}</div>
            <div className="text-lg font-bold text-white">{result.points.toLocaleString()} pts</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-500 to-blue-500 py-3 font-bold text-white hover:shadow-lg"
        >
          {t('view_leaderboard')}
        </button>
      </div>
    </div>
  </div>
  );
};

const QuizLeaderboard = ({ schools = [], leaderboard = [], totalPlayers = 0, activeQuiz = null }) => {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [quiz, setQuiz] = useState(activeQuiz);
  const [userInfo, setUserInfo] = useState({ nickname: '', school: '' });
  const [showForm, setShowForm] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState(null);

  const selectedSchool = schools.find(s => s.id == userInfo.school);
  const normalizedSchoolSearch = schoolSearch.trim().toLocaleLowerCase();
  const filteredSchools = schools.filter((school) =>
    school.name.toLocaleLowerCase().includes(normalizedSchoolSearch)
  );
  const canStart = userInfo.nickname.trim() && userInfo.school && !starting;
  const podium = leaderboard.slice(0, 3);
  const remainingPlayers = leaderboard.slice(3);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleModalClose = () => {
    setShowForm(false);
    setSchoolSearch('');
    setFormErrors({});
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (!canStart) return;

    setStarting(true);
    setFormErrors({});

    try {
      const { data } = await axios.post('/quiz/start', {
        display_name: userInfo.nickname,
        school_id: userInfo.school,
      });
      setShowForm(false);
      setNotice(null);
      setQuiz(data.quiz);
    } catch (error) {
      const errors = error.response?.data?.errors;
      setFormErrors(errors
        ? { nickname: errors.display_name?.[0], school: errors.school_id?.[0] }
        : { general: t('quiz_start_failed') });
    } finally {
      setStarting(false);
    }
  };

  const refreshLeaderboard = () => router.reload({ only: ['leaderboard', 'totalPlayers'] });

  const handleQuizFinished = (quizResult) => {
    setQuiz(null);
    setResult(quizResult);
    setUserInfo({ nickname: '', school: '' });
    refreshLeaderboard();
  };

  const handleSessionLost = (message) => {
    setQuiz(null);
    setNotice(message);
    refreshLeaderboard();
  };

  if (quiz) {
    const schoolName = schools.find(s => s.id == quiz.player.school_id)?.name;
    return <QuizGame quiz={quiz} schoolName={schoolName} onFinished={handleQuizFinished} onSessionLost={handleSessionLost} />;
  }

  return (
    <div
      className="relative min-h-screen bg-[#110e2b] bg-cover bg-center text-white"
      style={{ backgroundImage: 'linear-gradient(180deg, rgba(12,10,34,0.88), rgba(18,12,48,0.78) 50%, rgba(10,9,30,0.92)), url(/images/background.jpg)' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-950/30 via-transparent to-blue-950/30" />
      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-3 sm:px-6 sm:pt-4 lg:pb-12">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            aria-label={t('back')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-100 backdrop-blur-sm">{LEADERBOARD_TITLE}</span>
        </div>

        <motion.header
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-sm">
                <ApplicationLogo className="block h-8 w-auto" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">🎯 {t('quiz_quest')}</span>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">{t('quiz_arena')}</h1>
              </div>
            </div>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-violet-100/80 sm:text-sm">{t('quiz_arena_intro')}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white">
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 backdrop-blur-sm">⏱️ 2 minit · jawab sebanyak mungkin</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 backdrop-blur-sm">⏱️ {t('beat_clock')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="hidden shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-[#241044] shadow-[0_4px_0_#b45309] transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:flex"
          >
            <span aria-hidden="true">⚔️</span>{t('start_quiz')}<span aria-hidden="true">→</span>
          </button>
        </motion.header>

        {notice && (
          <div className="mb-6 rounded-lg border border-red-400 bg-red-500/90 p-4 text-white" role="alert">
            {notice}
          </div>
        )}

        {result && <ResultModal result={result} onClose={() => setResult(null)} />}

        {/* Registration Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0920]/85 p-4 backdrop-blur-sm">
            <div className="max-h-[calc(100vh-32px)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/15 bg-[#251d49] shadow-2xl shadow-black/50">
              <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                <h2 className="text-center text-2xl font-extrabold text-white">{t('join_challenge')}</h2>
                <p className="mt-1 text-center text-sm text-violet-200">{t('quiz_arena_intro')}</p>
              </div>

              <form onSubmit={handleStartQuiz} className="p-6 space-y-4" noValidate>
                {formErrors.general && (
                  <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300" role="alert">{formErrors.general}</p>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-violet-100">{t('player_name')} *</label>
                  <input
                    type="text"
                    name="nickname"
                    value={userInfo.nickname}
                    onChange={handleInputChange}
                    maxLength={200}
                    className={inputClass(formErrors.nickname)}
                    placeholder={t('enter_your_name')}
                    required
                  />
                  <FieldError message={formErrors.nickname} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-violet-100">{t('school')} *</label>

                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder={t('search_school_name')}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 pl-10 text-white placeholder-violet-200/50 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                      onChange={(e) => setSchoolSearch(e.target.value)}
                      value={schoolSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-violet-200">🔍</span>
                    </div>
                  </div>

                  <select
                    name="school"
                    value={userInfo.school}
                    onChange={handleInputChange}
                    className={`${inputClass(formErrors.school)} transition-all duration-200`}
                    required
                    size={4}
                  >
                    <option value="" className="bg-[#251d49] text-gray-300">-- {t('select_school')} --</option>
                    {filteredSchools.map((school) => (
                      <option
                        key={school.id}
                        value={school.id}
                        className={`transition-all duration-200 ${
                          userInfo.school == school.id
                            ? 'bg-violet-600 text-white font-bold'
                            : 'bg-[#251d49] text-white'
                        }`}
                      >
                        {userInfo.school == school.id ? `✅ ${school.name}` : school.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={formErrors.school} />

                  {selectedSchool && (
                    <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2.5" role="status">
                      <span className="mt-0.5 text-emerald-400" aria-hidden="true">✓</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">{t('selected_school')}</p>
                        <p className="break-words text-sm font-medium text-white">{selectedSchool.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-sm">
                    {schools.length === 0 ? (
                      <p className="text-red-400">{t('no_schools_available')}</p>
                    ) : filteredSchools.length === 0 ? (
                      <p className="text-yellow-400">{t('no_school_matching')} "{schoolSearch}"</p>
                    ) : (
                      <p className="text-green-400">
                        {t('found')} {filteredSchools.length} {t('of')} {schools.length} {t('schools')}
                        {schoolSearch && (
                          <button
                            type="button"
                            onClick={() => setSchoolSearch('')}
                            className="ml-2 text-blue-400 hover:text-blue-300 underline"
                          >
                            {t('clear')}
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={!canStart}
                    className={`flex-1 rounded-xl px-6 py-3 font-bold transition duration-200 ${
                      canStart
                        ? 'bg-amber-300 text-[#241044] hover:bg-amber-200'
                        : 'cursor-not-allowed bg-white/15 text-violet-200/60'
                    }`}
                  >
                    {t(starting ? 'starting' : 'start_quiz')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <section className="overflow-hidden rounded-[28px] border border-white/15 bg-[#1d1b39]/90 shadow-2xl shadow-black/30 backdrop-blur-xl" aria-labelledby="leaderboard-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-5 py-5 sm:px-7">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">{t('global_ranking')}</p>
              <h2 id="leaderboard-title" className="text-xl font-extrabold text-white sm:text-2xl">{t('leaderboard')} <span className="text-violet-200">{LEADERBOARD_TITLE}</span></h2>
            </div>
            <span className="shrink-0 rounded-full border border-violet-300/20 bg-violet-400/15 px-4 py-2 text-sm font-bold text-violet-100">👥 {totalPlayers} {t('players')}</span>
          </div>

          <div className="p-4 sm:p-6">
            {leaderboard.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mb-4 text-5xl">🏆</div>
                <p className="mb-3 text-xl font-bold text-white">{t('first_challenge')}</p>
                <p className="text-violet-200">{t('no_scores_yet')}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-3" aria-label={t('leaderboard')}>
                  {podium.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3 }}
                      className={`relative isolate min-h-44 overflow-hidden rounded-2xl border p-4 shadow-xl ${podiumStyles[index].card}`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${podiumStyles[index].stripe}`} aria-hidden="true" />
                      <div className={`pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full blur-2xl ${podiumStyles[index].glow}`} aria-hidden="true" />
                      <span className="pointer-events-none absolute -bottom-8 right-1 text-[110px] font-black leading-none text-white/5" aria-hidden="true">{index + 1}</span>
                      <motion.img
                        src={podiumStyles[index].mascot}
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none absolute -bottom-1 -right-2 z-0 h-28 w-28 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)] md:h-20 md:w-20 lg:h-28 lg:w-28"
                        animate={reducedMotion ? undefined : { y: [0, -5, 0], rotate: [0, 2, 0] }}
                        transition={{ duration: 3.6 + index * 0.45, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="relative mb-4 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-3xl shadow-inner" aria-label={`${t('rank')} ${index + 1}`}>{rankMark(index)}</span>
                          <span className={`text-xs font-black uppercase tracking-[0.18em] ${podiumStyles[index].accent}`}>#{index + 1}</span>
                        </div>
                        <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-xs font-bold text-white">⏱ {formatTime(entry.time)}</span>
                      </div>
                      <p className="relative truncate pr-20 text-xl font-extrabold text-white md:pr-14 lg:pr-20" title={entry.nickname}>
                        {entry.nickname}{result?.id === entry.id && <span className="ml-2 text-xs font-bold text-amber-200">({t('you')})</span>}
                      </p>
                      <p className="quiz-school-name relative mt-0.5 pr-20 text-xs text-white/70 md:pr-14 lg:pr-20" title={entry.school}>{entry.school}</p>
                      <div className="relative mt-4 flex items-center gap-2 pr-20 text-xs font-bold md:pr-14 lg:pr-20">
                        <span className={`rounded-full px-2.5 py-1 ${podiumStyles[index].stat}`}>{entry.correct}/{entry.answered} {t('correct_answers')}</span>
                        <span className="text-amber-200 font-bold">⭐ {entry.points.toLocaleString()} pts</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {remainingPlayers.length > 0 && <div className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1 md:hidden">
                  {remainingPlayers.map((entry, index) => {
                    const scoreStyle = getScoreStyle(entry.correct, entry.answered);
                    return (
                      <div key={entry.id} className={`rounded-2xl border p-4 ${scoreStyle.card} ${result?.id === entry.id ? 'ring-2 ring-amber-300' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-black" aria-label={`${t('rank')} ${index + 4}`}>{rankMark(index + 3)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-white">{entry.nickname} {result?.id === entry.id && <span className="text-xs text-amber-300">({t('you')})</span>}</p>
                            <p className="quiz-school-name text-xs text-violet-200" title={entry.school}>{entry.school}</p>
                          </div>
                          <span className="shrink-0 font-mono text-xs text-violet-200">{formatTime(entry.time)}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 pl-[52px] text-xs font-bold">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${scoreStyle.faceBg}`} aria-hidden="true">
                            <img src={scoreStyle.face} alt="" loading="lazy" decoding="async" className="h-9 w-9 object-contain" />
                          </span>
                          <span className={`rounded-full px-2.5 py-1 ${scoreStyle.badge}`}>{entry.correct}/{entry.answered}</span>
                          <span className="text-amber-200">⭐ {entry.points.toLocaleString()} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>}

                {remainingPlayers.length > 0 && <div className="mt-5 hidden max-h-[440px] overflow-y-auto rounded-2xl border border-white/10 md:block">
                  <table className="relative w-full table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#292448]">
                      <tr>
                        {['rank', 'player', 'school', 'score', 'time'].map(heading => (
                          <th key={heading} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-violet-200 ${heading === 'school' ? 'w-[30%]' : heading === 'score' ? 'w-[24%]' : ''}`}>
                            {t(heading)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {remainingPlayers.map((entry, index) => {
                        const percentage = Math.round((entry.correct / (entry.answered || 1)) * 100);
                        const isLatestPlayer = result?.id === entry.id;
                        const scoreStyle = getScoreStyle(entry.correct, entry.answered);

                        return (
                          <tr
                            key={entry.id}
                            className={`transition-colors duration-150 ${scoreStyle.row} ${isLatestPlayer ? 'outline outline-1 outline-inset outline-amber-300/60' : ''}`}
                          >
                            <td className={`border-l-4 px-4 py-3.5 ${scoreStyle.edge}`}>
                              <div className="flex items-center space-x-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-sm font-bold text-violet-200">{rankMark(index + 3)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="truncate font-bold text-white" title={entry.nickname}>
                                {entry.nickname}
                                {isLatestPlayer && <span className="ml-2 text-xs text-amber-300">({t('you')})</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="quiz-school-name text-violet-100/80" title={entry.school}>{entry.school}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${scoreStyle.faceBg}`} aria-hidden="true">
                                  <img src={scoreStyle.face} alt="" loading="lazy" decoding="async" className="h-9 w-9 object-contain" />
                                </span>
                                <span className={`rounded-md px-2 py-1 text-xs font-bold ${scoreStyle.badge}`}>{entry.correct}/{entry.answered}</span>
                                <span className="text-xs font-bold text-amber-200">⭐ {entry.points.toLocaleString()}</span>
                                <span className="text-xs font-semibold text-violet-100/75">{percentage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-mono text-sm text-violet-100/80">{formatTime(entry.time)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Start Button */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#140f31]/95 p-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 py-3.5 text-base font-extrabold text-[#241044] shadow-lg transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">⚔️</span>
          {t('start_quiz')}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
};

export default QuizLeaderboard;
