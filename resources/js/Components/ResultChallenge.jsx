import React from "react";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function ResultChallenge({
  results,
  onTryAgain,
  subject,
  topic,
  topic_id,
  subject_id,
  level_id,
  isModal = false,
  onCloseModal
}) {
  const { t } = useLanguage();
  console.log('ResultChallenge received props:', {
    results,
    topic,
    isModal,
    hasOnCloseModal: !!onCloseModal,
    hasOnTryAgain: !!onTryAgain
  });

  // Handle close for modal mode
  const handleClose = () => {
    console.log('handleClose called');
    if (isModal && onCloseModal) {
      onCloseModal();
    }
  };

  // Show loading if no results
  if (!results) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_results')}</p>
        </div>
      </div>
    );
  }

  // Format time function
  const formatTime = (totalSeconds) => {
    const seconds = Number(totalSeconds) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} ${t('seconds')}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate average time per question
  const averageTime = results.totalQuestions > 0 
    ? Math.round(results.timeElapsed / results.totalQuestions) 
    : 0;
  
  const formatAverageTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate accuracy
  const accuracyRate = results.totalQuestions > 0
    ? Math.round((results.correctAnswers / results.totalQuestions) * 100)
    : 0;

  // For modal mode, use compact layout
  if (isModal) {
    return (
      <div className="bg-white rounded-xl max-w-4xl w-full mx-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-6 py-4 relative">
          <button
            onClick={handleClose}
            aria-label={t('close_results')}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            ×
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-1">
              {topic || t('practice_results')}
            </h1>
            <p className="text-sm text-blue-100">{t('practice_completed')}</p>
          </div>
          
          <div className="text-center mt-4">
            <div className="inline-flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-lg font-semibold text-white">{t('great_practice')}</p>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content - Compact */}
        <div className="p-6">
          {/* Stats Grid - 2x2 for mobile, 4x for desktop */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Correct Answers */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">{t('correct_answers')}</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {results.correctAnswers || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
              </div>
            </div>

            {/* Incorrect Answers */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">{t('incorrect')}</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {(results.totalQuestions || 0) - (results.correctAnswers || 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">✗</span>
                </div>
              </div>
            </div>

            {/* Total Time */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">{t('total_time')}</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {formatTime(results.timeElapsed)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">⏱️</span>
                </div>
              </div>
            </div>

            {/* Average Time */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">{t('avg_per_question')}</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    {formatAverageTime(averageTime)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('performance_summary')}</h3>
            
            <div className="space-y-4">
              {/* Score Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('accuracy_score')}</span>
                  <span className="text-sm font-bold text-blue-600">{accuracyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${accuracyRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats List */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">{t('questions_label')}</div>
                  <div className="text-lg font-bold text-gray-800">
                    {results.totalQuestions || 0}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">{t('completion')}</div>
                  <div className="text-lg font-bold text-green-600">100%</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">{t('score')}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {results.score || results.correctAnswers || 0}/{results.totalQuestions || 0}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">{t('accuracy')}</div>
                  <div className="text-lg font-bold text-green-600">{accuracyRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Summary */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📚</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Topic Summary</h3>
                <p className="text-sm text-gray-600">{topic || 'Practice Topic'}</p>
              </div>
            </div>
            
            <div className="pl-13">
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-sm text-gray-600">Questions Practiced</span>
                <span className="text-sm font-semibold text-gray-800">{results.totalQuestions || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-sm text-gray-600">Correct Answers</span>
                <span className="text-sm font-semibold text-green-600">{results.correctAnswers || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Time Spent</span>
                <span className="text-sm font-semibold text-purple-600">{formatTime(results.timeElapsed)}</span>
              </div>
            </div>
          </div> */}

          {/* Completion Message */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">{t('practice_complete')}</h2>
            <p className="text-sm text-gray-600">
              {t('practice_complete_description')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                console.log('Try Again clicked');
                if (onTryAgain) onTryAgain();
              }}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">🔄</span>
              {t('try_again')}
            </button>

            <button
              onClick={handleClose}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">✅</span>
              {t('close_results')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original full-page layout (non-modal)
  return (
    <div className="bg-white min-h-full">
      {/* Header Section */}
      <header className="bg-blue-950 shadow-sm border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <div className="flex flex-col items-center py-4 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="text-center">
                  <h1 className="text-lg font-bold text-gray-50">
                    {topic || t('practice_challenge')}
                  </h1>
                  <p className="text-xs text-gray-50">{t('practice_results')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-50">
                  {topic || t('practice_challenge')}
                </h1>
                <p className="text-sm text-gray-50">{t('practice_results')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message Section */}
        <div className="text-center py-8 lg:my-16">
          <div className="flex items-center justify-center space-x-2 lg:space-x-4 mb-4">
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
            <p className="text-xl lg:text-3xl text-gray-100 font-semibold">{t('great_practice')}</p>
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-gray-100 italic text-base lg:text-2xl px-4">{t('practice_makes_perfect')}</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-4 lg:py-8 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Results Card */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-8 mb-6 lg:mb-8 border border-gray-200">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Total Correct Card */}
              <div className="bg-green-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">{t('total_correct')}</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1 lg:mt-2">
                      {results.correctAnswers || 0}
                    </p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-base lg:text-xl">✅</span>
                  </div>
                </div>
              </div>

              {/* Total Incorrect Card */}
              <div className="bg-red-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">{t('total_incorrect')}</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-red-600 mt-1 lg:mt-2">
                      {(results.totalQuestions || 0) - (results.correctAnswers || 0)}
                    </p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-base lg:text-xl">❌</span>
                  </div>
                </div>
              </div>

              {/* Total Time Taken Card */}
              <div className="bg-purple-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">{t('total_time')}</h3>
                    <p className="text-base lg:text-xl font-bold text-purple-600 mt-1 lg:mt-2">
                      {formatTime(results.timeElapsed)}
                    </p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-base lg:text-xl">⏱️</span>
                  </div>
                </div>
              </div>

              {/* Average Time Taken Card */}
              <div className="bg-orange-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">{t('average_time')}</h3>
                    <p className="text-base lg:text-xl font-bold text-orange-600 mt-1 lg:mt-2">
                      {formatAverageTime(averageTime)}
                    </p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-base lg:text-xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="bg-gray-50 rounded-lg lg:rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 border-2 border-gray-200">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 lg:mb-4">{t('performance_analysis')}</h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm lg:text-base text-gray-600">{t('questions_attempted')}</span>
                  <span className="text-sm lg:text-base font-semibold text-gray-800">
                    {results.totalQuestions || 0}/{results.totalQuestions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm lg:text-base text-gray-600">{t('accuracy_rate')}</span>
                  <span className="text-sm lg:text-base font-semibold text-green-600">
                    {accuracyRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm lg:text-base text-gray-600">{t('score')}</span>
                  <span className="text-sm lg:text-base font-semibold text-blue-600">
                    {results.score || results.correctAnswers || 0}/{results.totalQuestions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm lg:text-base text-gray-600">{t('completion_status')}</span>
                  <span className="text-sm lg:text-base font-semibold text-blue-600">
                    {t('fully_completed')}
                  </span>
                </div>
              </div>
            </div>

            {/* All Done Section */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full mb-3 lg:mb-4">
                <span className="text-2xl lg:text-3xl">🎯</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{t('practice_complete')}</h2>
              <p className="text-sm lg:text-base text-gray-600 px-4">
                {t('practice_complete_description')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <button
                onClick={() => {
                  console.log('Try Again clicked');
                  if (onTryAgain) onTryAgain();
                }}
                className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg lg:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 text-base lg:text-lg flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                {t('try_again')}
              </button>

              <button
                onClick={handleClose}
                className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg lg:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 text-base lg:text-lg flex items-center justify-center text-center"
              >
                <span className="mr-2">✅</span>
                {t('finish_practice')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}