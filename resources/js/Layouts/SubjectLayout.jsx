import { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import SubjectNavbar from './SubjectNavbar';
import StandardFooter from '@/Components/StandardFooter';
import { useLanguage } from '@/Contexts/LanguageContext';
import {
  AcademicCapIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronDownIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const formatTitle = (value = '') => value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export default function SubjectLayout({
  children,
  subject,
  onStandardChange,
  selectedStandard: propSelectedStandard,
  isLoading = false,
  studentData = null,
}) {
  const { props } = usePage();
  const { form, level_id, subject_id } = props;
  const { t, locale } = useLanguage();
  const [internalLoading, setInternalLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalStandard, setInternalStandard] = useState(propSelectedStandard || form || 'Form 4');
  const selectedStandard = propSelectedStandard ?? internalStandard;

  const stats = {
    level: studentData?.level || 5,
    xp: studentData?.xp || 1840,
    xpToNextLevel: studentData?.xpToNextLevel || 2000,
    streak: studentData?.streak || 12,
    badges: studentData?.badges || 4,
  };
  const xpPercentage = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));

  const tabs = useMemo(() => [
    { key: 'practice', label: t('practice', 'Learn'), icon: AcademicCapIcon, routeName: 'subject-page' },
    { key: 'mission', label: t('mission', 'Practice'), icon: SparklesIcon, routeName: 'subject-mission-page' },
    { key: 'report', label: t('report', 'Progress'), icon: ChartBarIcon, routeName: 'subject-report-page' },
  ], [t, locale]);

  useEffect(() => {
    const stopStart = router.on('start', () => setInternalLoading(true));
    const stopFinish = router.on('finish', () => setInternalLoading(false));
    return () => { stopStart(); stopFinish(); };
  }, []);

  const selectStandard = (standard) => {
    setInternalStandard(standard);
    setIsDropdownOpen(false);
    if (onStandardChange) onStandardChange(standard);
  };

  const title = formatTitle(subject);
  const showLoading = isLoading || internalLoading;

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {showLoading && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">Loading your course…</p>
          </div>
        </div>
      )}

      <SubjectNavbar title={title} />

      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                <AcademicCapIcon className="h-4 w-4" /> Course workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Learn each topic at your pace, practise your skills, and track every milestone.</p>
            </div>
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex min-w-[150px] items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/15">
                <span>{selectedStandard}</span><ChevronDownIcon className={`h-4 w-4 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xl">
                  {['Form 4', 'Form 5'].map((standard) => (
                    <button key={standard} onClick={() => selectStandard(standard)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${selectedStandard === standard ? 'bg-indigo-50 font-semibold text-indigo-700' : 'hover:bg-slate-50'}`}>
                      {standard}{selectedStandard === standard && <CheckIcon className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300"><span>Level {stats.level}</span><TrophyIcon className="h-4 w-4 text-amber-300" /></div>
              <p className="mt-2 text-xl font-semibold">Silver Scholar</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300"><span>XP progress</span><span>{stats.xp}/{stats.xpToNextLevel}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" style={{ width: `${xpPercentage}%` }} /></div>
              <p className="mt-2 text-xs font-medium text-indigo-200">{xpPercentage}% to the next level</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300"><span>Study streak</span><FireIcon className="h-4 w-4 text-orange-300" /></div>
              <p className="mt-2 text-xl font-semibold">{stats.streak} days</p>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[72px] z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8" aria-label="Course sections">
          {tabs.map((tab) => {
            const active = route().current(tab.routeName);
            const TabIcon = tab.icon;
            return (
              <Link key={tab.key} href={route(tab.routeName, { subject, form, level_id, subject_id })} preserveScroll className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition ${active ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                <TabIcon className="h-4 w-4" />{tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="py-7 sm:py-9">{children}</main>
      <StandardFooter />
    </div>
  );
}
