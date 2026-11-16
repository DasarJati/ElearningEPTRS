import React from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';

const QuizTimer = ({ timeElapsed, formatTime, getTimeColor, className = '' }) => {
  const { t } = useLanguage();

  return (
    <div
      title={t('time_elapsed')}
      aria-label={t('time_elapsed')}
      className={`inline-flex flex-none items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-bold tabular-nums ring-1 ring-inset ring-indigo-100 ${className}`}
    >
      <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={getTimeColor ? getTimeColor() : 'text-indigo-700'}>{formatTime(timeElapsed)}</span>
    </div>
  );
};

export default QuizTimer;
