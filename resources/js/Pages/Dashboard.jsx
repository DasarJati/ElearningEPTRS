import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  PlayIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/Contexts/LanguageContext';

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

const subjectStyles = [
  { accent: 'bg-indigo-500', soft: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500' },
  { accent: 'bg-cyan-500', soft: 'bg-cyan-50 text-cyan-600', bar: 'bg-cyan-500' },
  { accent: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
  { accent: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
];

function formatTime(seconds) {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const {
    auth,
    student,
    profileData,
    courses = [],
    assignments = [],
    quizSessions = [],
    friends = [],
    pendingRequests = [],
    schoolSubjects = [],
  } = usePage().props;

  const user = auth?.user || {};
  const firstName = (profileData?.name || user.name || 'Learner').split(' ')[0];
  const profilePicture = student?.profile_picture || profileData?.profile_picture;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const averageScore = quizSessions.length
    ? Math.round((quizSessions.reduce((sum, item) => sum + Number(item.total_correct || 0), 0) / quizSessions.length) * 20)
    : 0;
  const bestScore = quizSessions.length
    ? Math.max(...quizSessions.map((item) => Number(item.total_correct || 0)))
    : 0;
  const currentRank = quizSessions.findIndex((item) => item.user_id === user.id) + 1;

  const leaderboard = quizSessions.slice(0, 5).map((session, index) => ({
    rank: index + 1,
    name: session.display_name || 'Anonymous learner',
    school: session.school?.name || 'PTRS learner',
    time: session.total_time_seconds || 0,
    score: session.total_correct || 0,
    isCurrentUser: session.user_id === user.id,
  }));

  const featuredSubjects = (schoolSubjects.length ? schoolSubjects : courses).slice(0, 4);
  const primarySubject = schoolSubjects[0];
  const primarySubjectUrl = primarySubject
    ? `/subject/${primarySubject.abbr || primarySubject.name.toLowerCase().replace(/\s+/g, '-')}?subject_id=${primarySubject.id}&level_id=${primarySubject.level_id || 10}&form=${encodeURIComponent((primarySubject.level_id || 10) === 10 ? 'Form 4' : 'Form 5')}`
    : route('quiz-page');

  const getSubjectUrl = (subject) => {
    if (!subject?.id) return route('quiz-page');
    const slug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
    const levelId = subject.level_id || 10;
    return `/subject/${slug}?subject_id=${subject.id}&level_id=${levelId}&form=${encodeURIComponent(levelId === 10 ? 'Form 4' : 'Form 5')}`;
  };

  const stats = [
    { label: 'Learning progress', value: `${averageScore}%`, helper: quizSessions.length ? `${quizSessions.length} quiz attempts` : 'Start your first quiz', icon: ChartBarIcon, tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'Best score', value: bestScore ? `${bestScore}/5` : '—', helper: bestScore ? 'Personal best' : 'No score yet', icon: TrophyIcon, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Community', value: friends.length, helper: `${pendingRequests.length} pending request${pendingRequests.length === 1 ? '' : 's'}`, icon: UserGroupIcon, tone: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <DashboardLayout>
      <Head title="Dashboard" />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.section
          {...cardMotion}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200 sm:px-8 lg:px-10 lg:py-9"
        >
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute bottom-[-8rem] right-48 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4" />
                Your learning space
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {greeting}, {firstName}.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Pick up where you left off, build your streak, and make today&apos;s study session count.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={primarySubjectUrl} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50">
                  <PlayIcon className="h-4 w-4" />
                  Continue learning
                </Link>
                <Link href={route('quiz-page')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                  <BoltIcon className="h-4 w-4" />
                  Quick quiz
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md lg:min-w-[285px]">
              <div className="h-16 w-16 flex-none overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-400 ring-4 ring-white/10">
                {profilePicture ? (
                  <img src={`/storage/${profilePicture}`} alt={profileData?.name || user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">{firstName.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{profileData?.name || user.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-300">{profileData?.school || 'Add your school'}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Ready to learn
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} {...cardMotion} transition={{ duration: 0.35, delay: 0.06 * (index + 1) }} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.helper}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.tone}`}><stat.icon className="h-5 w-5" /></div>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <motion.section {...cardMotion} transition={{ duration: 0.35, delay: 0.18 }} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{t('my_courses', 'My courses')}</h2>
                  <p className="mt-1 text-sm text-slate-500">Everything you need to keep moving forward.</p>
                </div>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:flex">
                  Explore courses <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {featuredSubjects.length ? featuredSubjects.map((subject, index) => {
                  const style = subjectStyles[index % subjectStyles.length];
                  const progress = subject.progress && subject.total ? Math.round((subject.progress / subject.total) * 100) : [68, 42, 24, 12][index % 4];
                  return (
                    <Link key={subject.id || subject.title || index} href={getSubjectUrl(subject)} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/60">
                      <div className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />
                      <div className="flex items-start justify-between">
                        <div className={`rounded-xl p-2.5 ${style.soft}`}><BookOpenIcon className="h-5 w-5" /></div>
                        <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
                      </div>
                      <h3 className="mt-5 font-semibold text-slate-900">{subject.name || subject.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{subject.topic || 'Continue your latest topic'}</p>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">Course progress</span>
                        <span className="font-semibold text-slate-700">{progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${progress}%` }} />
                      </div>
                    </Link>
                  );
                }) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
                    <AcademicCapIcon className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-medium text-slate-700">Your courses will appear here</p>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section {...cardMotion} transition={{ duration: 0.35, delay: 0.24 }} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming work</h2>
                  <p className="mt-1 text-sm text-slate-500">Stay focused on what is due next.</p>
                </div>
                <div className="rounded-xl bg-rose-50 p-2.5 text-rose-500"><CalendarDaysIcon className="h-5 w-5" /></div>
              </div>
              <div className="mt-5 space-y-3">
                {assignments.length ? assignments.map((assignment, index) => (
                  <div key={`${assignment.title}-${index}`} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <span className="text-[10px] font-bold uppercase">Due</span><ClockIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{assignment.title}</p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{assignment.topic} · {assignment.description}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span className="text-xs font-medium text-slate-500">{assignment.dueDate}</span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">In progress</span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl bg-emerald-50 p-5 text-center text-sm font-medium text-emerald-700">You are all caught up!</div>
                )}
              </div>
            </motion.section>
          </div>

          <aside className="space-y-5">
            <motion.section {...cardMotion} transition={{ duration: 0.35, delay: 0.2 }} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">Weekly goal</h2>
                  <p className="mt-1 text-xs text-slate-500">3 of 5 learning days</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-2.5 text-orange-500"><FireIcon className="h-5 w-5" /></div>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${index < 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {index < 3 ? <CheckCircleIcon className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </div>
                    <span className="mt-2 block text-[10px] font-semibold text-slate-400">{day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-700">
                <span className="font-semibold">Two more days!</span> You&apos;re close to completing this week&apos;s goal.
              </div>
            </motion.section>

            <motion.section {...cardMotion} transition={{ duration: 0.35, delay: 0.27 }} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Top learners</h2>
                  <p className="mt-0.5 text-xs text-slate-500">This week&apos;s leaderboard</p>
                </div>
                <TrophyIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="p-3">
                {leaderboard.length ? leaderboard.map((learner) => (
                  <div key={`${learner.rank}-${learner.name}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${learner.isCurrentUser ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                    <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-xs font-bold ${learner.rank === 1 ? 'bg-amber-100 text-amber-700' : learner.rank === 2 ? 'bg-slate-200 text-slate-700' : learner.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>#{learner.rank}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{learner.name}</p>
                      <p className="truncate text-[11px] text-slate-400">{learner.school}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-700">{learner.score}/5</p>
                      <p className="text-[10px] text-slate-400">{formatTime(learner.time)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">Complete a quiz to join the leaderboard.</div>
                )}
              </div>
              <button onClick={() => router.visit(route('quiz-page'))} className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50">
                View leaderboard <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </motion.section>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
}
