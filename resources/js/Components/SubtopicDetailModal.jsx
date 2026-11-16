import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
                <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex flex-none items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
                        <div className="min-w-0">
                            <h2 className="break-words text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                {subtopicData?.name || t('subtopic')}
                            </h2>
                            {sessions.length > 0 && (
                                <p className="mt-0.5 text-xs font-medium text-slate-500">{sessions.length} {t('sessions')}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            aria-label={t('close')}
                            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                        {error ? (
                            <div className="py-10 text-center">
                                <div className="mb-4 text-rose-600">{error}</div>
                                <button
                                    onClick={fetchSessionDetails}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    {t('try_again')}
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="py-10 text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                                <p className="mt-4 text-slate-600">{t('loading_session_details')}</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="py-10 text-center">
                                <svg className="mx-auto mb-4 h-14 w-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-slate-500">{t('no_practice_sessions')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full min-w-[820px] border-collapse bg-white text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            <th className="px-4 py-3 text-center">{t('number')}</th>
                                            <th className="px-4 py-3 text-center">{t('total_questions')}</th>
                                            <th className="px-4 py-3 text-center">{t(questionType === 'Objective' ? 'correct_answers' : 'answered')}</th>
                                            {questionType === 'Objective' && <th className="px-4 py-3 text-center">{t('wrong_answers')}</th>}
                                            <th className="px-4 py-3 text-center">{t('skipped')}</th>
                                            {questionType === 'Objective' && <th className="px-4 py-3 text-left">{t('score')}</th>}
                                            <th className="px-4 py-3 text-center">{t('time_spent')}</th>
                                            <th className="px-4 py-3 text-center">{t('average_time')}</th>
                                            <th className="px-4 py-3 text-center">{t('session_date')}</th>
                                            <th className="px-4 py-3 text-center">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sessions.map((session, index) => {
                                            const score = Math.max(0, Math.min(100, parseFloat(session.score) || 0));
                                            const scoreTone = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                            const scoreText = score >= 80 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-rose-700';
                                            return (
                                                <tr key={session.id || index} className="transition hover:bg-slate-50/70">
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-center font-medium text-slate-400">{index + 1}</td>
                                                    <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{session.total_questions || 0}</td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{session.total_correct || 0}</span>
                                                    </td>
                                                    {questionType === 'Objective' && (
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">{session.total_wrong || 0}</span>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{session.total_skipped || 0}</span>
                                                    </td>
                                                    {questionType === 'Objective' && (
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex min-w-[110px] items-center gap-2">
                                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                                    <div className={`h-full rounded-full ${scoreTone}`} style={{ width: `${score}%` }} />
                                                                </div>
                                                                <span className={`w-10 text-right text-xs font-bold ${scoreText}`}>{score}%</span>
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-slate-600">
                                                        {session.total_time || `0 ${t('minutes_short')} 0 ${t('seconds_short')}`}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-slate-600">
                                                        {session.average_time || `0 ${t('minutes_short')} 0 ${t('seconds_short')}`}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-slate-700">{session.session_date || '-'}</td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <button
                                                            onClick={() => openReviewModal(session.id)}
                                                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
                                                            title={t('review_questions')}
                                                        >
                                                            {t('review')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-none flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-7">
                        {sessions.length > 0 && (
                            <button
                                onClick={handleExportToPdf}
                                disabled={exporting}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                                    exporting ? 'cursor-not-allowed bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {exporting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        {t('exporting')}
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {t('export_pdf')}
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
