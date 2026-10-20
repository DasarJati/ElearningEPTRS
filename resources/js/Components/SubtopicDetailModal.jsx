import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import DonutChart from '@/Components/ChartJsDonut';
import QuestionReviewModal from '@/Components/QuestionReviewModal';
import { exportSessionsToPdf } from '@/utils/exportPdf';
import { useLanguage } from '@/Contexts/LanguageContext';
import { showAlert } from '@/Components/sweetAlert';

export default function SubtopicDetailModal({ isOpen, onClose, subtopicData, questionType, timeRange }) {
    const { t, locale } = useLanguage();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [exporting, setExporting] = useState(false);

    const openReviewModal = (sessionId) => {
        setSelectedSessionId(sessionId);
        setShowReviewModal(true);
    };

    const handleExportToPdf = () => {
        if (sessions.length === 0) {
            showAlert(t, { text: t('no_session_data'), icon: 'info' });
            return;
        }
        
        setExporting(true);
        try {
            exportSessionsToPdf(
                sessions, 
                subtopicData?.name || t('subtopic'),
                questionType
            );
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showAlert(t, { text: t('export_pdf_failed'), icon: 'error' });
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        if (isOpen && subtopicData) {
            fetchSessionDetails();
        } else {
            // Reset state when modal closes
            setSessions([]);
            setError(null);
        }
    }, [isOpen, subtopicData, questionType, timeRange, locale]);

    const fetchSessionDetails = async () => {
        if (!subtopicData?.id) return;

        setLoading(true);
        setError(null);
        try {
            const url = route('subtopic-details', {
                subtopicId: subtopicData.id,
                questionType: questionType,
                time_range: timeRange,
            });

            // console.log('Fetching from:', url);

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSessions(data.sessions || []);
        } catch (error) {
            console.error('Error fetching subtopic details:', error);
            setError(t('load_details_failed'));
        } finally {
            setLoading(false);
        }
    };

    // Early return if not open
    if (!isOpen) return null;

    return (
        <>
            {/* Question Review Modal */}
            <QuestionReviewModal
                isOpen={showReviewModal}
                onClose={() => {
                    setShowReviewModal(false);
                    setSelectedSessionId(null);
                }}
                sessionId={selectedSessionId}
            />

            {/* Subtopic Detail Modal */}
            <div className="fixed inset-0 z-[9998] bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-4 sm:items-center sm:p-6">
                        <h2 className="min-w-0 break-words text-lg font-bold text-gray-800 sm:text-xl">
                            {subtopicData?.name || t('subtopic')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                                                
                    
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        {error ? (
                            <div className="text-center py-8">
                                <div className="text-red-600 mb-4">{error}</div>
                                <button
                                    onClick={fetchSessionDetails}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {t('try_again')}
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">{t('loading_session_details')}</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 text-lg">{t('no_practice_sessions')}</p>
                            </div>
                        ) : (
                            <>
                                {/* Sessions Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-[860px] border border-gray-200 bg-white">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('number')}
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('total_questions')}
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t(questionType === 'Objective' ? 'correct_answers' : 'answered')}
                                                </th>
                                                {/* Show Wrong column only for Objective */}
                                                {questionType === 'Objective' && (
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                        {t('wrong_answers')}
                                                    </th>
                                                )}
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('skipped')}
                                                </th>
                                                {/* Show Score column only for Objective */}
                                                {questionType === 'Objective' && (
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                        {t('score')}
                                                    </th>
                                                )}
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('time_spent')}
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('average_time')}
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('session_date')}
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {t('actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {sessions.map((session, index) => (
                                                <tr key={session.id || index} className="">
                                                    <td className="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center bg-gray-100">
                                                        {session.total_questions || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-green-700 font-medium text-center bg-green-100">
                                                        {session.total_correct || 0}
                                                    </td>
                                                    {/* Show Wrong cell only for Objective */}
                                                    {questionType === 'Objective' && (
                                                        <td className="px-4 py-3 text-sm text-red-700 font-medium text-center bg-red-100">
                                                            {session.total_wrong || 0}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-sm text-yellow-700 font-medium text-center bg-yellow-100">
                                                        {session.total_skipped || 0}
                                                    </td>
                                                    {/* Show Score cell only for Objective */}
                                                    {questionType === 'Objective' && (
                                                        <td className="px-4 py-3 text-center bg-gray-50">
                                                            <div className="flex justify-center items-center">
                                                                <DonutChart
                                                                    percentage={parseFloat(session.score) || 0}
                                                                    size={40}
                                                                    strokeWidth={4}
                                                                    label={t('score')}
                                                                    color="#3b82f6"
                                                                />
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                                        {session.total_time || `0 ${t('minutes_short')} 0 ${t('seconds_short')}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                                        {session.average_time || `0 ${t('minutes_short')} 0 ${t('seconds_short')}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                                        {session.session_date || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => openReviewModal(session.id)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                            title={t('review_questions')}
                                                        >
                                                            {t('review')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center space-x-3">
                            {sessions.length > 0 && (
                                <button
                                    onClick={handleExportToPdf}
                                    disabled={exporting}
                                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                                        exporting 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                >
                                    {exporting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {t('exporting')}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {t('export_pdf')}
                                        </>
                                    )}
                                </button>
                            )}
                            
                        </div>

                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
