import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import DonutChart from '@/Components/ChartJsDonut';
import SubtopicDetailModal from '@/Components/SubtopicDetailModal';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function SubjectReportPage() {
  const { t } = useLanguage();
  const { props } = usePage();

  const {
    subject,
    subject_abbr,
    form,
    subject_id,
    level_id,
    question_type = 'Objective',
    time_range = 'Last 7 Days',
    objective_topics = [],  
    subjective_topics = [], 
  } = props;

  const [currentStandard, setCurrentStandard] = useState(form || 'Form 4');
  const [expandedTopics, setExpandedTopics] = useState({});
  const [activeTab, setActiveTab] = useState(question_type);
  const [timeRange, setTimeRange] = useState(time_range);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get topics based on active tab
  const topics = activeTab === 'Objective' ? objective_topics : subjective_topics;

  const handleStandardChange = (standard) => {
    setCurrentStandard(standard);
    setIsLoading(true);
    
    router.get(route('subject-report-page', {
      subject: subject_abbr || subject,
      form: standard,
      level_id: level_id,
      subject_id: subject_id,
      question_type: activeTab,
      time_range: timeRange,
    }), {}, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false),
      onError: () => setIsLoading(false),
    });
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Set loading state
    setIsLoading(true);
    setActiveTab(tab);
    
    router.get(route('subject-report-page', {
      subject: subject_abbr || subject,
      form: currentStandard,
      level_id: level_id,
      subject_id: subject_id,
      question_type: tab,
      time_range: timeRange,
    }), {}, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setIsLoading(true);
    router.get(route('subject-report-page', {
      subject: subject_abbr || subject,
      form: currentStandard,
      level_id,
      subject_id,
      question_type: activeTab,
      time_range: range,
    }), {}, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleSubtopicClick = (subtopic) => {
    setSelectedSubtopic(subtopic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubtopic(null);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Topic header skeleton */}
          <div className="px-6 py-4 border-b border-gray-200 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
          
          {/* Table skeleton */}
          <div className="bg-gray-200 p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="grid grid-cols-5 gap-4 items-center py-3 px-4">
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  <div className="h-10 w-10 bg-gray-300 rounded-full mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SubjectLayout
      subject={subject}
      activeTab="Report"
      selectedStandard={currentStandard}
      onStandardChange={handleStandardChange}
    >
      <div className="mx-auto w-full max-w-[1440px] px-3 py-0 sm:px-6 lg:px-8">
        <div className="min-w-0">

          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold leading-tight text-gray-800 sm:text-2xl">
                {t(activeTab === 'Objective' ? 'objective_analysis' : 'subjective_analysis')}
              </h2>
            </div>

            {/* Tabs with loading indicator */}
            <div className="relative flex w-full gap-1 rounded-lg bg-gray-100 p-1 sm:w-fit">
              <button
                className={`flex min-w-0 flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 sm:min-w-[100px] sm:flex-none sm:px-6 ${activeTab === 'Objective'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  } ${isLoading && activeTab === 'Objective' ? 'opacity-75' : ''}`}
                onClick={() => handleTabChange('Objective')}
                disabled={isLoading}
              >
                {isLoading && activeTab === 'Objective' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {t('loading_data')}
                  </div>
                ) : (
                  t('objective_type')
                )}
              </button>

              <button
                className={`flex min-w-0 flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 sm:min-w-[100px] sm:flex-none sm:px-6 ${activeTab === 'Subjective'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  } ${isLoading && activeTab === 'Subjective' ? 'opacity-75' : ''}`}
                onClick={() => handleTabChange('Subjective')}
                disabled={isLoading}
              >
                {isLoading && activeTab === 'Subjective' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {t('loading_data')}
                  </div>
                ) : (
                  t('subjective_type')
                )}
              </button>
            </div>
          </div>

          {/* Global loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-700">{t('loading_data')}</p>
              </div>
            </div>
          )}

          {/* Progress Details */}
          <div className="mb-8 min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-opacity duration-300">
            <div className="mb-2 flex flex-col gap-3 bg-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800">{t('progress_details')}</h3>

              {/* Time range */}
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <label htmlFor="report-time-range" className="text-sm text-gray-600">{t('activity_from')}</label>
                <select
                  id="report-time-range"
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-auto"
                  disabled={isLoading}
                >
                  <option value="Last 7 Days">{t('last_7_days')}</option>
                  <option value="Last 30 Days">{t('last_30_days')}</option>
                  <option value="Last 3 Months">{t('last_3_months')}</option>
                  <option value="All Time">{t('all_time')}</option>
                </select>
              </div>
            </div>

            {/* Topic listing with loading state */}
            <div className="space-y-1 p-2">
              {isLoading ? (
                <LoadingSkeleton />
              ) : topics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">{t('no_topics_available')}</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-md"
                  >
                    {/* Topic header */}
                    <div
                      className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg
                            className={`w-5 h-5 transform transition-transform ${expandedTopics[topic.id] ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-semibold text-gray-800 text-base">
                            {topic.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded */}
                    {expandedTopics[topic.id] && (
                      <div className="bg-gray-200">

                        {/* Table header */}
                        <div className="hidden px-6 py-3 sm:block">
                          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                            <div className="border-b-2 border-gray-50">{t('subtopics')}</div>
                            <div className="text-center border-b-2 border-gray-50">{t('total_sessions')}</div>

                            {activeTab === 'Objective' && (
                              <>
                                <div className="text-center border-b-2 border-gray-50">{t('score_statistic')}</div>
                                <div className="text-center border-b-2 border-gray-50">{t('average_score')}</div>
                                <div className="text-center border-b-2 border-gray-50">{t('last_session')}</div>
                              </>
                            )}

                            {activeTab === 'Subjective' && (
                              <>
                                <div className="text-center border-b-2 border-gray-50">{t('last_session')}</div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Table body */}
                        <div className="px-2 py-0">
                          {topic.subtopics && topic.subtopics.length > 0 ? (
                            <div className="space-y-3">
                              {topic.subtopics.map((subtopic) => (
                                <div
                                  key={subtopic.id}
                                  className="grid grid-cols-2 gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-indigo-50 sm:grid-cols-5 sm:items-center sm:gap-4 sm:rounded-none sm:bg-gray-200 sm:px-4 sm:py-3 sm:hover:bg-gray-300 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubtopicClick(subtopic);
                                  }}
                                >
                                  {/* Subtopic name */}
                                  <div className="col-span-2 text-sm font-medium text-gray-900 sm:col-span-1">
                                    {subtopic.name}
                                  </div>

                                  {/* Total sessions */}
                                  <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                    <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('total_sessions')}</span>
                                    {subtopic.progress?.total_sessions || 0}
                                  </div>

                                  {/* Objective mode */}
                                  {activeTab === 'Objective' && (
                                    <>
                                      <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                        <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('score_statistic')}</span>
                                        {subtopic.progress?.score_statistic || '—'}
                                      </div>

                                      <div className="flex flex-col items-center rounded-md bg-slate-50 p-2 text-center sm:bg-transparent sm:p-0" onClick={(e) => e.stopPropagation()}>
                                        <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('average_score')}</span>
                                        <DonutChart
                                          percentage={subtopic.progress?.average_score || 0}
                                          size={40}
                                          strokeWidth={4}
                                          label={t('accuracy_rate')}
                                        />
                                      </div>

                                      <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                        <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('last_session')}</span>
                                        {subtopic.progress?.last_session || '-'}
                                      </div>
                                    </>
                                  )}

                                  {/* Subjective mode */}
                                  {activeTab === 'Subjective' && (
                                    <>
                                      <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                        <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('last_session')}</span>
                                        {subtopic.progress?.last_session || '-'}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            // No subtopics - show topic directly
                            <div
                              className="grid grid-cols-2 gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-indigo-50 sm:grid-cols-5 sm:items-center sm:gap-4 sm:rounded-none sm:bg-gray-200 sm:px-4 sm:py-3 sm:hover:bg-gray-300 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubtopicClick(topic);
                              }}
                            >
                              <div className="col-span-2 text-sm font-medium text-gray-900 sm:col-span-1">
                                {topic.name}
                              </div>

                              <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('total_sessions')}</span>
                                {topic.total_sessions || '0'}
                              </div>

                              {/* Objective mode */}
                              {activeTab === 'Objective' && (
                                <>
                                  <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                    <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('score_statistic')}</span>
                                    {topic.score_statistic || '—'}
                                  </div>

                                  <div className="flex flex-col items-center rounded-md bg-slate-50 p-2 text-center sm:bg-transparent sm:p-0">
                                    <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('average_score')}</span>
                                    <DonutChart
                                      percentage={topic.average_score || 0}
                                      size={40}
                                      strokeWidth={4}
                                      label={t('accuracy_rate')}
                                    />
                                  </div>

                                  <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                    <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('last_session')}</span>
                                    {topic.last_session || '-'}
                                  </div>
                                </>
                              )}

                              {/* Subjective mode */}
                              {activeTab === 'Subjective' && (
                                <>
                                  <div className="rounded-md bg-slate-50 p-2 text-center text-sm text-gray-600 sm:bg-transparent sm:p-0">
                                    <span className="block text-xs font-medium text-slate-500 sm:hidden">{t('last_session')}</span>
                                    {topic.last_session || '-'}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtopic Detail Modal */}
      <SubtopicDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        subtopicData={selectedSubtopic}
        questionType={activeTab}
        timeRange={timeRange}
      />
    </SubjectLayout>
  );
}
