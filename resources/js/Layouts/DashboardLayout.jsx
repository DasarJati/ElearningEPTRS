import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ProfileDropdown from '@/Components/ProfileDropdown';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
  AcademicCapIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  HomeIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function DashboardLayout({ header, children }) {
  const { t } = useLanguage();
  const { auth, schoolSubjects = [] } = usePage().props;
  const user = auth?.user;
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const coursesRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (coursesRef.current && !coursesRef.current.contains(event.target)) setCoursesOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const subjectUrl = (subject) => {
    const slug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
    const levelId = subject.level_id || 10;
    return `/subject/${slug}?subject_id=${subject.id}&level_id=${levelId}&form=${encodeURIComponent(levelId === 10 ? 'Form 4' : 'Form 5')}`;
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] font-sans text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href={route('dashboard')} className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-sm">
                <ApplicationLogo className="h-9 w-9 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none tracking-tight text-slate-900">PTRS Learning</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Student portal</p>
              </div>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              <Link href={route('dashboard')} className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700">
                <HomeIcon className="h-4 w-4" /> Dashboard
              </Link>
              <div className="relative" ref={coursesRef}>
                <button onClick={() => setCoursesOpen(!coursesOpen)} className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                  <AcademicCapIcon className="h-4 w-4" /> {t('courses', 'Courses')}
                  <ChevronDownIcon className={`h-3.5 w-3.5 transition ${coursesOpen ? 'rotate-180' : ''}`} />
                </button>
                {coursesOpen && (
                  <div className="absolute left-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">
                    <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Your subjects</div>
                    <div className="max-h-80 overflow-y-auto">
                      {schoolSubjects.length ? schoolSubjects.map((subject) => (
                        <Link key={subject.id} href={subjectUrl(subject)} onClick={() => setCoursesOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><AcademicCapIcon className="h-4 w-4" /></span>
                          <span className="truncate">{subject.name}</span>
                        </Link>
                      )) : <p className="px-3 py-5 text-sm text-slate-400">No subjects available yet.</p>}
                    </div>
                  </div>
                )}
              </div>
              <Link href={route('quiz-page')} className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <Squares2X2Icon className="h-4 w-4" /> Quiz arena
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block"><LanguageSwitcher type="buttons" /></div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications">
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <ProfileDropdown user={user} student={user?.student} />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">
              {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg lg:hidden">
            <div className="mx-auto grid max-w-[1440px] gap-1">
              <Link href={route('dashboard')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"><HomeIcon className="h-5 w-5" /> Dashboard</Link>
              <Link href={route('quiz-page')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><Squares2X2Icon className="h-5 w-5" /> Quiz arena</Link>
              <div className="mt-2 border-t border-slate-100 pt-2">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Courses</p>
                {schoolSubjects.slice(0, 6).map((subject) => <Link key={subject.id} href={subjectUrl(subject)} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">{subject.name}</Link>)}
              </div>
              <div className="mt-3 sm:hidden"><LanguageSwitcher type="dropdown" /></div>
            </div>
          </div>
        )}
      </nav>

      {header && <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">{header}</div></header>}
      {children}
    </div>
  );
}
