// resources/js/Pages/courses/training/ResultQuestion.jsx
import React, { useState, useEffect } from "react";
import { router } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function ResultQuestion({
  objectiveResults,
  subjectiveResults,
  onTryAgain,
  quizType = "objective",
  subject,
  standard,
  sectionId,
  contentId,
  topic,
  sectionTitle,
  topic_id,
  form,
  level_id,
  subject_id,
  nextTopic,
  isEarlyExit = false
}) {
  const { t } = useLanguage();
  const [ringReady, setRingReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRingReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const results = quizType === "objective" ? objectiveResults : subjectiveResults;

  const handleBackToSubject = () => {
    router.visit(route('subject-page', {
      subject,
      form: form || standard,
      level_id,
      subject_id,
    }));
  };

  const handleNextTopic = () => {
    if (!nextTopic?.id) return;

    router.get(route(quizType === 'objective' ? 'objective-page' : 'subjective-page'), {
      subject,
      standard: standard || form,
      sectionId: nextTopic.section_id,
      sectionTitle: nextTopic.section_title,
      contentId,
      topic: nextTopic.name,
      topic_id: nextTopic.id,
      subject_id,
      level_id,
    });
  };

  const handleViewReport = () => {
    router.visit(route('subject-report-page', {
      subject,
      form: form || standard,
      level_id,
      subject_id,
      question_type: quizType,
    }));
  };

  // 🖨️ Print the received props to verify
  // console.log('=== RESULT PAGE PROPS ===');
  // console.log('Subject:', subject);
  // console.log('Standard:', standard);
  // console.log('Topic:', topic);
  // console.log('Topic ID:', topic_id);
  // console.log('Section ID:', sectionId);
  // console.log('Content ID:', contentId);
  // console.log('Section Title:', sectionTitle);
  // console.log('=== END RESULT PROPS ===');

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800">{t('loading_results')}</h1>
        </div>
      </div>
    );
  }

  // Format time function - convert seconds to minutes and seconds
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} ${t('minutes')} ${seconds} ${t('seconds')}`;
  };

  // Calculate average time per question
  const totalQuestions = Number(results.totalQuestions || 0);
  const averageTime = totalQuestions > 0
    ? Math.round(Number(results.timeElapsed || 0) / totalQuestions)
    : 0;
  const averageTimeFormatted = formatTime(averageTime);

  // For objective quizzes: use correctAnswers, for subjective: all answered are correct
  const correctAnswers = quizType === "objective" ? results.correctAnswers : results.answered;
  const skippedAnswers = quizType === "objective" ? results.skippedAnswers : results.skipped;
  const score = quizType === "objective" ? results.score : results.answered;

  // Calculate accuracy based on quiz type
  const accuracyRate = quizType === "objective"
    ? (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0)
    : (totalQuestions > 0 ? Math.round((results.answered / totalQuestions) * 100) : 0);

  const isComplete = results.isComplete || 
                     (results.completionType === 'all_questions') || 
                     (results.skippedAnswers === 0 && !isEarlyExit);

  const statusKey = skippedAnswers === 0 ? 'fully_completed' : 'partially_completed';
  const hasNext = isComplete && nextTopic?.id;

  // Tier drives the motivational copy, colours and stars
  const tier = accuracyRate >= 80 ? 'high' : accuracyRate >= 50 ? 'mid' : 'low';
  const tierStyle = {
    high: { stroke: '#10b981', soft: 'bg-emerald-50 text-emerald-700', stars: 3, emoji: '🏆' },
    mid: { stroke: '#f59e0b', soft: 'bg-amber-50 text-amber-700', stars: 2, emoji: '🚀' },
    low: { stroke: '#6366f1', soft: 'bg-indigo-50 text-indigo-700', stars: 1, emoji: '💪' },
  }[tier];

  const RADIUS = 54;
  const CIRC = 2 * Math.PI * RADIUS;
  const ringOffset = ringReady ? CIRC * (1 - Math.min(100, accuracyRate) / 100) : CIRC;

  const stats = [
    { label: t('total_correct'), value: correctAnswers, big: true, bg: 'bg-emerald-50 border-emerald-100', tone: 'text-emerald-600' },
    { label: t('total_skipped'), value: skippedAnswers, big: true, bg: 'bg-rose-50 border-rose-100', tone: 'text-rose-600' },
    { label: t('total_time'), value: formatTime(results.timeElapsed), bg: 'bg-violet-50 border-violet-100', tone: 'text-violet-600' },
    { label: t('average_time'), value: averageTimeFormatted, bg: 'bg-amber-50 border-amber-100', tone: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50">
      {/* Compact header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 pb-8 text-white sm:pb-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={handleBackToSubject}
            aria-label={t('back_to_subject')}
            title={t('back_to_subject')}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight sm:text-lg">{topic}</h1>
            <p className="text-xs text-indigo-200">{t('quiz_results')}</p>
          </div>
        </div>

        <div className="relative px-4 pt-3 text-center sm:pt-5">
          <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tierStyle.emoji} {t(`result_tier_${tier}_title`)}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-indigo-200 sm:text-base">{t(`result_tier_${tier}_text`)}</p>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto mt-6 max-w-3xl px-3 pb-12 sm:mt-8 sm:px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-indigo-100 sm:p-8">
          {/* Score ring */}
          <div className="flex flex-col items-center text-center">
            <div className="relative h-36 w-36 sm:h-40 sm:w-40">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#eef2ff" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r={RADIUS} fill="none" stroke={tierStyle.stroke} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1.1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{accuracyRate}%</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('accuracy_rate')}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{t('questions_attempted')}: {results.totalQuestions - skippedAnswers}/{results.totalQuestions}</span>
              <span className={`rounded-full px-3 py-1 ${tierStyle.soft}`}>{t(statusKey)}</span>
            </div>
          </div>

          {/* Stats */}
          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className={`flex flex-col justify-between rounded-2xl border p-4 ${item.bg}`}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
                <dd className={`mt-2 font-extrabold leading-none ${item.big ? 'text-5xl' : 'text-lg leading-tight'} ${item.tone}`}>{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* Actions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onTryAgain}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {t('repeat_topic')}
            </button>

            <button
              type="button"
              onClick={hasNext ? handleNextTopic : handleBackToSubject}
              className="group inline-flex min-w-0 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="min-w-0 text-left leading-tight">
                {hasNext ? (
                  <>
                    <span className="block text-[11px] font-medium text-indigo-200">{t('next_topic')}</span>
                    <span className="block truncate">{nextTopic.name}</span>
                  </>
                ) : (
                  t('back_to_subject')
                )}
              </span>
              <svg className="h-5 w-5 flex-none transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {hasNext && (
              <button type="button" onClick={handleBackToSubject} className="font-medium text-slate-500 transition hover:text-slate-800">
                {t('back_to_subject')}
              </button>
            )}
            <button type="button" onClick={handleViewReport} className="font-medium text-indigo-600 transition hover:text-indigo-800">
              {t('view_detailed_report')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
