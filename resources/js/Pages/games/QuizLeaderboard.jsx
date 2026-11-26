import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { router, Link } from '@inertiajs/react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import QuizInterface from './QuizInterface';
import QuizComicReader from './QuizComicReader';
import ComicArt from '@/Components/ComicArt';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

const EMPTY_PLAYER = { nickname: '', school: '', ic_number: '', email: '', phone: '' };

const formatDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

const dateRangeText = (start, end) => {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return `Mulai ${formatDate(start)}`;
  if (end) return `Hingga ${formatDate(end)}`;
  return null;
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
};

const RANK_SOUNDS = {
  1: '/sounds/rank/top1_voice.wav',
  2: '/sounds/rank/top2_voice.wav',
  3: '/sounds/rank/top3_voice.wav',
};
const SOUND_POLL_MS = 8000;
const rankBadges = ['badge-gold.png', 'badge-silver.png', 'badge-bronze.png'];
// Background art for the top-3 podium cards: 1st, 2nd, 3rd.
const podiumArt = ['panel-3.png', 'panel-1.png', 'panel-4.png'];

const accuracyAvatar = (percent) => {
  if (percent === null) return 'avatar-sleepy.png';
  if (percent === 0) return 'avatar-cry.png';
  if (percent < 30) return 'avatar-sad.png';
  if (percent < 50) return 'avatar-angry.png';
  if (percent < 70) return 'avatar-nervous.png';
  if (percent < 90) return 'avatar-happy.png';
  return 'avatar-excited.png';
};

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
    <div className="game-interface quiz-comic">
      <div className="comic-game-header p-4 pb-5">
        <div className="quiz-responsive-content flex items-center gap-4 sm:px-1 xl:px-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl 2xl:text-3xl">{t('quiz_challenge')}</h1>
            <p className="text-sm">{t('player')}: {quiz.player.display_name}{schoolName && ` | ${t('school')}: ${schoolName}`}</p>
          </div>
          {!submitting && (
            <button
              type="button"
              onClick={handleExit}
              className="shrink-0 rounded-xl border border-amber-100/50 bg-[#9b382d] px-3 py-2 text-sm font-bold text-white shadow-lg hover:bg-[#802d24] sm:px-4"
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
  const isPrizeWinner = result.rank <= (result.prize_top ?? 10);
  const [verified, setVerified] = useState(!isPrizeWinner);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // A prize winner must not leave before the admin verifies the prize.
  useEffect(() => {
    if (verified) return undefined;
    const block = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', block);
    return () => window.removeEventListener('beforeunload', block);
  }, [verified]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!password || verifying) return;
    setVerifying(true);
    setPasswordError('');
    try {
      await axios.post('/quiz/prize/verify', { password });
      setVerified(true);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Pengesahan gagal. Cuba lagi.');
      setPassword('');
    } finally {
      setVerifying(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
    <div className="comic-card comic-form max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto text-center">
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
        <div className="grid grid-cols-3 gap-2 mb-6">
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
        {isPrizeWinner && (
          <div className={`mb-6 rounded-xl border-2 p-4 text-left ${verified ? 'border-green-400 bg-green-500/10' : 'border-amber-300 bg-amber-300/10'}`}>
            <div className="text-center">
              <div className="text-4xl">🎁</div>
              <h3 className="mt-1 text-lg font-extrabold text-amber-200">KAD HADIAH · TOP {result.prize_top ?? 10}</h3>
              <p className="text-sm text-white">{result.nickname}</p>
              {result.school && <p className="text-xs text-gray-300">{result.school}</p>}
              <p className="mt-1 text-sm font-bold text-yellow-300">Kedudukan #{result.rank}</p>
            </div>
            {verified ? (
              <p className="mt-3 text-center text-sm font-bold text-green-300">✅ Hadiah disahkan oleh admin</p>
            ) : (
              <form onSubmit={handleVerify} className="mt-3">
                <p className="mb-2 text-center text-xs text-amber-100">
                  Tahniah! Sila tunjuk skrin ini kepada admin. Admin perlu masukkan kata laluan untuk sahkan hadiah sebelum anda boleh teruskan.
                </p>
                <label htmlFor="prize-password" className="sr-only">Kata laluan admin</label>
                <input
                  id="prize-password"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Kata laluan admin"
                  className="w-full rounded-lg border border-white/20 bg-gray-900 px-3 py-2 text-white placeholder-gray-500"
                />
                {passwordError && <p role="alert" className="mt-1 text-xs font-bold text-red-400">{passwordError}</p>}
                <button
                  type="submit"
                  disabled={!password || verifying}
                  className="mt-2 w-full rounded-lg bg-amber-400 py-2 font-bold text-gray-900 disabled:opacity-50"
                >
                  {verifying ? 'Menyemak...' : 'Sahkan Hadiah (Admin)'}
                </button>
              </form>
            )}
          </div>
        )}
        <button
          onClick={onClose}
          disabled={!verified}
          className="w-full rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-500 to-blue-500 py-3 font-bold text-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {verified ? t('view_leaderboard') : '🔒 Menunggu pengesahan admin'}
        </button>
      </div>
    </div>
  </div>
  );
};

const QuizLeaderboard = ({
  schools = [],
  leaderboard = [],
  totalPlayers = 0,
  activeQuiz = null,
  registration = { school: true, ic: false, email: false, phone: false },
  leaderboardLabel = '',
  leaderboardStartDate = null,
  leaderboardEndDate = null,
}) => {
  const { t } = useLanguage();
  const rangeText = dateRangeText(leaderboardStartDate, leaderboardEndDate);
  const [quiz, setQuiz] = useState(activeQuiz);
  const [userInfo, setUserInfo] = useState(EMPTY_PLAYER);
  const [showForm, setShowForm] = useState(false);
  const [showComic, setShowComic] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
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
  const canStart = userInfo.nickname.trim() && !starting;

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
      // Only send the optional fields that are switched on for this event.
      const { data } = await axios.post('/quiz/start', {
        display_name: userInfo.nickname,
        ...(registration.school && { school_id: userInfo.school || null }),
        ...(registration.ic && { ic_number: userInfo.ic_number }),
        ...(registration.email && { email: userInfo.email }),
        ...(registration.phone && { phone: userInfo.phone }),
      });
      setShowForm(false);
      setNotice(null);
      setQuiz(data.quiz);
    } catch (error) {
      const errors = error.response?.data?.errors;
      setFormErrors(errors
        ? {
          nickname: errors.display_name?.[0],
          school: errors.school_id?.[0],
          ic_number: errors.ic_number?.[0],
          email: errors.email?.[0],
          phone: errors.phone?.[0],
        }
        : { general: t('quiz_start_failed') });
    } finally {
      setStarting(false);
    }
  };

  const refreshLeaderboard = () => router.reload({ only: ['leaderboard', 'totalPlayers'] });

  const handleQuizFinished = (quizResult) => {
    setQuiz(null);
    setResult(quizResult);
    setUserInfo(EMPTY_PLAYER);
    refreshLeaderboard();
  };

  const handleSessionLost = (message) => {
    setQuiz(null);
    setNotice(message);
    refreshLeaderboard();
  };

  // Admin alert: play a sound when a player newly enters the top 3.
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef({});
  const prevTopRef = useRef(null);

  const toggleSound = () => {
    if (soundOn) {
      setSoundOn(false);
      return;
    }
    // Clicking is the user gesture browsers need before audio may play later.
    Object.entries(RANK_SOUNDS).forEach(([rank, src]) => {
      const audio = audioRef.current[rank] || new Audio(src);
      audioRef.current[rank] = audio;
      audio.muted = true;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }).catch(() => { audio.muted = false; });
    });
    setSoundOn(true);
  };

  useEffect(() => {
    const currentTop = new Map(leaderboard.slice(0, 3).map((p, i) => [p.id, i + 1]));
    const prevTop = prevTopRef.current;
    prevTopRef.current = currentTop;
    if (!soundOn || !prevTop) return;

    // Best rank among players who were not in the top 3 before.
    const newRanks = [...currentTop.entries()]
      .filter(([id]) => !prevTop.has(id))
      .map(([, rank]) => rank);
    if (newRanks.length === 0) return;

    const rank = Math.min(...newRanks);
    const audio = audioRef.current[rank] || new Audio(RANK_SOUNDS[rank]);
    audioRef.current[rank] = audio;
    Object.values(audioRef.current).forEach(a => { a.pause(); a.currentTime = 0; });
    audio.play().catch(() => {});
  }, [leaderboard, soundOn]);

  useEffect(() => {
    if (!soundOn || quiz) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshLeaderboard();
    }, SOUND_POLL_MS);
    return () => clearInterval(timer);
  }, [soundOn, quiz]);

  if (quiz) {
    const schoolName = schools.find(s => s.id == quiz.player.school_id)?.name;
    return <QuizGame quiz={quiz} schoolName={schoolName} onFinished={handleQuizFinished} onSessionLost={handleSessionLost} />;
  }

  return (
    <div
      className="quiz-comic comic-stage comic-leaderboard relative isolate min-h-screen"
    >
      <div className="mx-auto max-w-[67rem] px-3 pb-9 pt-3 sm:px-6 sm:pt-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2" aria-label="Navigasi Quiz Arena">
            <Link
              href="/quiz-poster"
              aria-label="Kembali ke poster"
              className="comic-card flex h-10 w-10 shrink-0 items-center justify-center"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <Link href="/login" className="comic-card flex h-10 items-center gap-1.5 px-2.5 text-sm font-extrabold">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" />
              </svg>
              Home
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              className="comic-sound px-3 py-1.5 text-xs font-bold"
            >
              {soundOn ? '🔔 Top 3 alert: ON' : '🔕 Top 3 alert: OFF'}
            </button>
          </div>
        </div>

        <header className="comic-card comic-hero">
          <div className="comic-hero-copy">
            {leaderboardLabel && <p className="comic-event-label">{leaderboardLabel}</p>}
            <h1 className="comic-display">{t('quiz_arena')} <span className="comic-ribbon">Misi Buku</span></h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="comic-start inline-flex items-center gap-2 px-4 py-2 text-sm font-extrabold"
              >
                {t('start_quiz')}<span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setShowComic(true)}
                className="px-4 py-2 text-sm font-extrabold"
              >
                Baca Komik
              </button>
            </div>
          </div>
          <ComicArt file="kids-hero.png" className="comic-hero-kids" />
        </header>

        {notice && (
          <div className="comic-card mb-6 p-4 font-bold" role="alert">
            {notice}
          </div>
        )}

        {result && <ResultModal result={result} onClose={() => setResult(null)} />}

        {showComic && <QuizComicReader onClose={() => setShowComic(false)} />}

        {avatarPreview && (
          <Dialog open onClose={() => setAvatarPreview(null)} className="quiz-comic fixed inset-0 z-[60]">
            <DialogBackdrop className="comic-avatar-backdrop fixed inset-0 bg-slate-950/75" />
            <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
              <DialogPanel className="comic-card comic-avatar-preview">
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="min-w-0 font-extrabold">{avatarPreview.nickname}</DialogTitle>
                  <button
                    type="button"
                    aria-label={t('close_enlarged_image')}
                    onClick={() => setAvatarPreview(null)}
                    className="h-9 w-9 shrink-0 text-xl leading-none"
                    data-autofocus
                  >
                    ×
                  </button>
                </div>
                <div className="comic-avatar-stage">
                  <span className="comic-avatar-spark comic-avatar-spark-left" aria-hidden="true">✦</span>
                  <ComicArt file={avatarPreview.avatar} className="comic-avatar-enlarged" />
                  <span className="comic-avatar-spark comic-avatar-spark-right" aria-hidden="true">✦</span>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}

        {/* Registration Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0920]/85 p-4 backdrop-blur-sm">
            <div className="comic-card comic-form max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto">
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

                {registration.school && <div>
                  <label className="mb-2 block text-sm font-semibold text-violet-100">{t('school')} <span className="font-normal text-violet-200/70">({t('optional')})</span></label>

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
                </div>}

                {registration.ic && (
                  <div>
                    <label htmlFor="quiz-ic" className="mb-2 block text-sm font-semibold text-violet-100">{t('ic_number')} <span className="font-normal text-violet-200/70">({t('optional')})</span></label>
                    <input
                      id="quiz-ic"
                      type="text"
                      name="ic_number"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={14}
                      value={userInfo.ic_number}
                      onChange={handleInputChange}
                      className={inputClass(formErrors.ic_number)}
                      placeholder="990101-14-1234"
                    />
                    <FieldError message={formErrors.ic_number} />
                  </div>
                )}

                {registration.email && (
                  <div>
                    <label htmlFor="quiz-email" className="mb-2 block text-sm font-semibold text-violet-100">{t('email_address')} <span className="font-normal text-violet-200/70">({t('optional')})</span></label>
                    <input
                      id="quiz-email"
                      type="email"
                      name="email"
                      autoComplete="off"
                      maxLength={255}
                      value={userInfo.email}
                      onChange={handleInputChange}
                      className={inputClass(formErrors.email)}
                      placeholder="nama@contoh.com"
                    />
                    <FieldError message={formErrors.email} />
                  </div>
                )}

                {registration.phone && (
                  <div>
                    <label htmlFor="quiz-phone" className="mb-2 block text-sm font-semibold text-violet-100">{t('phone_number')} <span className="font-normal text-violet-200/70">({t('optional')})</span></label>
                    <input
                      id="quiz-phone"
                      type="tel"
                      name="phone"
                      autoComplete="off"
                      maxLength={20}
                      value={userInfo.phone}
                      onChange={handleInputChange}
                      className={inputClass(formErrors.phone)}
                      placeholder="012-3456789"
                    />
                    <FieldError message={formErrors.phone} />
                  </div>
                )}

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

        <section className="comic-card comic-ranking" aria-labelledby="leaderboard-title">
          <header className="comic-ranking-header">
            <div>
              <h2 id="leaderboard-title" className="comic-display comic-ranking-title">Carta Juara Misi</h2>
              {rangeText && <p className="comic-ranking-date">{rangeText}</p>}
            </div>
            <p className="comic-player-count">{totalPlayers.toLocaleString()} {t('players')}</p>
          </header>

          {leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xl font-extrabold">{t('first_challenge')}</p>
              <p>{t('no_scores_yet')}</p>
            </div>
          ) : (
            <>
            <ol className="comic-podium" aria-label="Top 3">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <li
                  key={entry.id}
                  className={`comic-podium-card${result?.id === entry.id ? ' comic-current-player' : ''}`}
                  data-rank={index + 1}
                >
                  <ComicArt file={podiumArt[index]} className="comic-podium-portrait" />
                  <div className="comic-podium-body">
                    <ComicArt
                      file={rankBadges[index]}
                      className="comic-podium-badge"
                      fallback={<span className="comic-medal comic-podium-badge" aria-hidden="true">★</span>}
                    />
                    <span className="comic-display comic-podium-rank">{String(index + 1).padStart(2, '0')}</span>
                    <div className="comic-podium-info">
                      <p className="comic-podium-name">
                        {entry.nickname}
                        {result?.id === entry.id && <small className="ml-1">({t('you')})</small>}
                      </p>
                      {entry.school && <p className="comic-podium-school">{entry.school}</p>}
                      <p className="comic-podium-points">{entry.points.toLocaleString()} <small>pts</small></p>
                      <p className="comic-podium-meta">{entry.correct}/{entry.answered} · <span className="whitespace-nowrap">{formatTime(entry.time)}</span></p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {leaderboard.length > 3 && (
            <div className="comic-table-scroll" role="region" aria-labelledby="leaderboard-title" tabIndex={0}>
              <table className="comic-table">
                <thead>
                  <tr>
                    <th scope="col">{t('rank')}</th>
                    <th scope="col">{t('player')}</th>
                    <th scope="col">{t('score')}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(3).map((entry, offset) => {
                    const percent = entry.answered > 0 ? Math.round(entry.correct * 100 / entry.answered) : null;
                    const isCurrentPlayer = result?.id === entry.id;
                    const avatar = accuracyAvatar(percent);

                    return (
                      <tr key={entry.id} className={isCurrentPlayer ? 'comic-current-player' : undefined}>
                        <td><span className="comic-rank">{String(offset + 4).padStart(2, '0')}</span></td>
                        <th scope="row">
                          <div className="comic-row-player">
                            <button
                              type="button"
                              className="comic-avatar-trigger"
                              aria-label={`Besarkan avatar ${entry.nickname}`}
                              aria-haspopup="dialog"
                              onClick={() => setAvatarPreview({ avatar, nickname: entry.nickname })}
                            >
                              <ComicArt
                                file={avatar}
                                className="comic-row-avatar"
                                fallback={<span className="comic-row-avatar" aria-hidden="true" />}
                              />
                            </button>
                            <div className="comic-player-details">
                              <div className="min-w-0">
                                {entry.nickname}
                                {isCurrentPlayer && <small className="comic-you-label">{t('you')}</small>}
                                {entry.school && <small className="block font-semibold">{entry.school}</small>}
                              </div>
                              {percent === null ? (
                                <small className="comic-accuracy-empty">Belum jawab</small>
                              ) : (
                                <div className="comic-accuracy">
                                  <span className="comic-accuracy-track" aria-hidden="true">
                                    <span style={{ width: `${percent}%` }} />
                                  </span>
                                  <span className="comic-accuracy-label"><span className="sr-only">Ketepatan </span>{percent}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </th>
                        <td>
                          <strong>{entry.points.toLocaleString()}</strong>
                          <small className="block">{entry.correct}/{entry.answered} · <span className="whitespace-nowrap">{formatTime(entry.time)}</span></small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
            </>
          )}
          <ComicArt
            file="open-book.png"
            className="comic-ranking-books"
            fallback={
              <div className="comic-books" aria-hidden="true">
                <span className="comic-book-stack" />
                <div className="comic-open-book"><i /><i /></div>
                <span className="comic-book-stack" />
              </div>
            }
          />
        </section>
      </div>
    </div>
  );
};

export default QuizLeaderboard;
