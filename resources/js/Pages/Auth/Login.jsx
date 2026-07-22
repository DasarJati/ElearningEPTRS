import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationIcon,
  LockClosedIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function Login({ status, canResetPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    ic_number: '',
    password: '',
    remember: false,
  });

  const submit = (event) => {
    event.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
  };

  return (
    <>
      <Head title="Sign in" />
      <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
        <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
          <motion.div className="absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" animate={{ x: [0, 45, 0], y: [0, -25, 0], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -right-20 bottom-8 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" animate={{ x: [0, -35, 0], y: [0, 25, 0], scale: [1.1, 0.95, 1.1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-indigo-950/30">
              <ApplicationLogo className="h-10 w-10 object-contain" />
            </span>
            <div><p className="text-sm font-bold tracking-tight">PTRS Learning</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">Student portal</p></div>
          </motion.div>

          <div className="relative z-10 my-auto grid items-center gap-10 xl:grid-cols-[0.85fr_1.15fr]">
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
              <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-sm"><SparklesIcon className="h-4 w-4" /> Learn with clarity</motion.div>
              <motion.h1 variants={item} className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight xl:text-5xl">Build knowledge.<br /><span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Track every win.</span></motion.h1>
              <motion.p variants={item} className="mt-5 max-w-lg text-sm leading-7 text-slate-300 xl:text-base">Your focused space for courses, practice, progress, and meaningful learning—available whenever you are ready.</motion.p>
              <motion.div variants={item} className="mt-7 space-y-3">
                {['Learn at your own pace', 'Practise with instant feedback', 'See progress across every subject'].map((text) => <div key={text} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircleIcon className="h-5 w-5 text-emerald-400" />{text}</div>)}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease }} className="relative mx-auto w-full max-w-md">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
                  <div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-slate-400">Weekly progress</p><p className="mt-1 text-2xl font-semibold tracking-tight">Keep it going!</p></div><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><ChartBarIcon className="h-5 w-5" /></span></div>
                  <div className="mt-6 grid grid-cols-7 gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-center"><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + index * 0.07, type: 'spring' }} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${index < 5 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index < 5 ? <CheckCircleIcon className="h-4 w-4" /> : day}</motion.span><span className="mt-1.5 block text-[9px] font-semibold text-slate-400">{day}</span></div>)}
                  </div>
                  <div className="mt-5 rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">Mathematics</span><span className="font-bold text-indigo-600">78%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><motion.div initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ duration: 1.2, delay: 0.8, ease }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" /></div></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0, y: [0, -5, 0] }} transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8, ease }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }} className="absolute -bottom-7 -left-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-3.5 shadow-xl backdrop-blur-xl"><span className="rounded-xl bg-amber-400/15 p-2 text-amber-300"><TrophyIcon className="h-5 w-5" /></span><div><p className="text-xs font-semibold">New achievement</p><p className="mt-0.5 text-[10px] text-slate-400">5-day learning streak</p></div></motion.div>
              <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0, y: [0, 6, 0] }} transition={{ opacity: { delay: 1 }, x: { delay: 1, ease }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }} className="absolute -right-8 top-8 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur-xl"><span className="rounded-lg bg-cyan-400/15 p-1.5 text-cyan-300"><BookOpenIcon className="h-4 w-4" /></span><div><p className="text-[11px] font-semibold">3 lessons</p><p className="text-[9px] text-slate-400">completed today</p></div></motion.div>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-slate-500"><span>© {new Date().getFullYear()} PTRS Learning</span><span>Learn · Practise · Progress</span></div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-50/80 to-transparent lg:hidden" />
          <motion.div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl lg:hidden" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full max-w-md">
            <motion.div variants={item} className="mb-9 flex items-center gap-3 lg:hidden"><span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-slate-950"><ApplicationLogo className="h-10 w-10 object-contain" /></span><div><p className="text-sm font-bold text-slate-900">PTRS Learning</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Student portal</p></div></motion.div>

            <motion.div variants={item}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Sign in to continue</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Continue your courses and pick up exactly where you stopped.</p>
            </motion.div>

            {status && <motion.div variants={item} className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none" />{status}</motion.div>}

            <motion.form variants={item} onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="ic_number" className="text-sm font-semibold text-slate-700">IC number</label>
                <div className="relative mt-2">
                  <IdentificationIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="ic_number" type="text" inputMode="numeric" name="ic_number" value={data.ic_number} onChange={(event) => setData('ic_number', event.target.value)} autoComplete="username" autoFocus required placeholder="e.g. 010203040506" maxLength={14} className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm tracking-wide text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-indigo-500" />
                </div>
                <InputError message={errors.ic_number} className="mt-2" />
              </div>

              <div>
                <div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>{canResetPassword && <Link href={route('password.request')} className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800">Forgot password?</Link>}</div>
                <div className="relative mt-2">
                  <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={data.password} onChange={(event) => setData('password', event.target.value)} autoComplete="current-password" required placeholder="Your IC number for first login" className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-indigo-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                </div>
                <InputError message={errors.password} className="mt-2" />
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600"><Checkbox name="remember" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span>Keep me signed in</span></label>

              <motion.button type="submit" disabled={processing} whileHover={processing ? {} : { y: -2 }} whileTap={processing ? {} : { scale: 0.985 }} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700 hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">
                {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing in…</> : <>Sign in to your account<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
              </motion.button>
            </motion.form>

            <motion.div variants={item} className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">New to PTRS? <Link href={route('register')} className="font-semibold text-indigo-600 transition hover:text-indigo-800">Create an account</Link></motion.div>
            <motion.p variants={item} className="mt-8 text-center text-[11px] leading-5 text-slate-400">By continuing, you agree to use PTRS Learning responsibly and keep your account secure.</motion.p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
