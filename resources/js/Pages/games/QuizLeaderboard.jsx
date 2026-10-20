import React, { useState } from 'react';
import axios from 'axios';
import { router, Link } from '@inertiajs/react';
import QuizInterface from './QuizInterface';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

const LEADERBOARD_TITLE = 'k-semanis 2026';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const inputClass = (hasError) =>
  `w-full px-4 py-3 bg-gray-700 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none ${
    hasError ? 'border-red-500 focus:border-red-400' : 'border-blue-500 focus:border-blue-400'
  }`;

const FieldError = ({ message }) =>
  message ? <p className="mt-1.5 text-sm text-red-400" role="alert">{message}</p> : null;

// Declared at module level so the running quiz is not remounted when the page re-renders.
const QuizGame = ({ quiz, schoolName, onFinished, onSessionLost }) => {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(quiz.answers.filter(Boolean).length);

  const handleSubmit = async () => {
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
    }
  };

  const handleExit = async () => {
    const details = `${t('your_results')} ${t('will_be_saved')} ${t('to_leaderboard_now')}\n`
      + `${t('unanswered_counted_wrong')} (${answeredCount}/${quiz.questions.length} ${t('answered')}).\n`
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
          {result.correct === result.total ? `${t('perfect')} 🎉` : `${t('quiz_complete')} 🎯`}
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
            <div className="text-lg font-bold text-white">{result.correct}/{result.total}</div>
          </div>
          <div className="rounded-lg bg-gray-700 p-3">
            <div className="text-xs font-bold text-blue-400">⏱️ {t('time')}</div>
            <div className="text-lg font-bold text-white font-mono">{formatTime(result.time)}</div>
          </div>
          <div className="rounded-lg bg-gray-700 p-3">
            <div className="text-xs font-bold text-yellow-400">🎯 {t('score')}</div>
            <div className="text-lg font-bold text-white">{Math.round((result.correct / result.total) * 100)}%</div>
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
    <div className="min-h-screen bg-cover bg-center text-white p-4 shadow-lg" style={{ backgroundImage: 'url(/images/background.jpg)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <Link
            href="/dashboard"
            className="absolute top-0 left-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-xl mb-6">
            <h1 className="text-4xl font-bold text-white bg-gray-800 py-4 px-8 rounded-xl w-auto justify-items-center">
              <ApplicationLogo className="block h-16 w-auto fill-current text-gray-800" /> {t('quiz_arena').toUpperCase()}
            </h1>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            {t('quiz_arena_intro')}
          </p>
          <div className="flex justify-center space-x-4 text-blue-300 text-sm">
            <span>🎯 5 {t('questions')}</span>
            <span>•</span>
            <span>⏱️ {t('beat_clock')}</span>
            <span>•</span>
            <span>🏅 {t('global_ranking')}</span>
          </div>
        </div>

        {notice && (
          <div className="mb-6 rounded-lg border border-red-400 bg-red-500/90 p-4 text-white" role="alert">
            {notice}
          </div>
        )}

        {result && <ResultModal result={result} onClose={() => setResult(null)} />}

        {/* Registration Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
            <div className="max-h-[calc(100vh-32px)] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-blue-500 bg-gray-800 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white text-center">{t('join_challenge')}</h2>
              </div>

              <form onSubmit={handleStartQuiz} className="p-6 space-y-4" noValidate>
                {formErrors.general && (
                  <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300" role="alert">{formErrors.general}</p>
                )}

                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">{t('player_name')} *</label>
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
                  <label className="block text-sm font-medium text-blue-300 mb-2">{t('school')} *</label>

                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder={t('search_school_name')}
                      className="w-full px-4 py-3 pl-10 bg-gray-700 border-2 border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      onChange={(e) => setSchoolSearch(e.target.value)}
                      value={schoolSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-blue-400">🔍</span>
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
                    <option value="" className="text-gray-400">-- {t('select_school')} --</option>
                    {filteredSchools.map((school) => (
                      <option
                        key={school.id}
                        value={school.id}
                        className={`transition-all duration-200 ${
                          userInfo.school == school.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg'
                            : 'text-white hover:bg-gray-600'
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
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition duration-200 border-2 border-gray-500"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={!canStart}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold transition duration-200 border-2 ${
                      canStart
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-green-400 hover:shadow-lg'
                        : 'bg-gray-500 text-gray-300 border-gray-400 cursor-not-allowed'
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
        <div className="bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-200 uppercase">
                {t('leaderboard')} <span className="text-slate-100">{LEADERBOARD_TITLE}</span>
              </h2>
              <span className="shrink-0 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                {totalPlayers} {t('players')}
              </span>
            </div>
          </div>

          <div className="p-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-xl text-blue-300 mb-4">{t('first_challenge')}</p>
                <p className="text-gray-400">{t('no_scores_yet')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto border border-gray-600 rounded-lg">
                  <table className="w-full relative">
                    <thead className="bg-gray-700 sticky top-0">
                      <tr>
                        {['rank', 'player', 'school', 'score', 'time'].map(heading => (
                          <th key={heading} className="px-4 py-3 text-left text-sm font-bold text-blue-300 uppercase">
                            {t(heading)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {leaderboard.map((entry, index) => {
                        const percentage = Math.round((entry.correct / 5) * 100);
                        const isLatestPlayer = result?.id === entry.id;

                        return (
                          <tr
                            key={entry.id}
                            className={`transition duration-150 ${isLatestPlayer ? 'bg-yellow-500/20 hover:bg-yellow-500/30' : 'hover:bg-gray-700'}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                {index === 0 && <span className="text-2xl">🥇</span>}
                                {index === 1 && <span className="text-2xl">🥈</span>}
                                {index === 2 && <span className="text-2xl">🥉</span>}
                                {index > 2 && (
                                  <span className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">
                                {entry.nickname}
                                {isLatestPlayer && <span className="ml-2 text-xs text-yellow-300">({t('you')})</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-300">{entry.school}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-green-400">{entry.correct}/5</span>
                                <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">{percentage}%</span>
                                {percentage === 100 && (
                                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">{t('perfect')}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-300 font-mono">{formatTime(entry.time)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4
                     rounded-xl font-bold text-lg shadow-lg hover:shadow-xl
                     transform hover:scale-105 transition duration-200
                     flex items-center gap-2 border-2 border-blue-400"
        >
          <span>⚔️</span>
          {t('start_quiz')}
          <span>🎯</span>
        </button>
      </div>
    </div>
  );
};

export default QuizLeaderboard;
