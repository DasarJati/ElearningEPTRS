import { useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationIcon,
  LockClosedIcon,
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

const loginBanners = [
  { src: '/images/Banner_Login.png', alt: 'Sepanduk promosi PTRS Praktis' },
  { src: '/images/Banner_Login2.png', alt: 'Sepanduk promosi pembelajaran PTRS Praktis' },
];

export default function Login({ status, canResetPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const { data, setData, post, processing, errors, reset } = useForm({
    ic_number: '',
    password: '',
    remember: false,
  });

  const submit = (event) => {
    event.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % loginBanners.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <Head title="Log masuk" />
      <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.100fr)]">
        <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block" aria-label="Sorotan PTRS Praktis">
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={loginBanners[activeBanner].src}
              src={loginBanners[activeBanner].src}
              alt={loginBanners[activeBanner].alt}
              className="absolute inset-0 h-full w-full object-cover object-center"
              initial={{ opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.9 }, scale: { duration: 5.5, ease: 'linear' } }}
            />
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-slate-950/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2" role="tablist" aria-label="Pilih sepanduk promosi">
            {loginBanners.map((banner, index) => (
              <button
                key={banner.src}
                type="button"
                onClick={() => setActiveBanner(index)}
                className={`h-2.5 rounded-full border border-white/80 shadow-sm transition-all ${activeBanner === index ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Papar sepanduk ${index + 1}`}
                aria-selected={activeBanner === index}
                role="tab"
              />
            ))}
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-50/80 to-transparent lg:hidden" />
          <motion.div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl lg:hidden" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full max-w-md">
            <motion.div variants={item} className="mb-9 flex items-center gap-3 lg:hidden"><span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-slate-100"><ApplicationLogo className="h-10 w-10 object-contain" /></span><div><p className="text-sm font-bold text-slate-900">PTRS Praktis</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Portal pelajar</p></div></motion.div>

            <motion.div variants={item}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Selamat kembali</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Log masuk untuk teruskan</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Teruskan kursus anda dan sambung semula dari tempat anda berhenti.</p>
            </motion.div>

            {status && <motion.div variants={item} className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none" />{status}</motion.div>}

            <motion.form variants={item} onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="ic_number" className="text-sm font-semibold text-slate-700">Nombor kad pengenalan</label>
                <div className="relative mt-2">
                  <IdentificationIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="ic_number" type="text" inputMode="numeric" name="ic_number" value={data.ic_number} onChange={(event) => setData('ic_number', event.target.value)} autoComplete="username" autoFocus required placeholder="cth. 010203040506" maxLength={14} className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm tracking-wide text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-indigo-500" />
                </div>
                <InputError message={errors.ic_number} className="mt-2" />
              </div>

              <div>
                <div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-semibold text-slate-700">Kata laluan</label>{canResetPassword && <Link href={route('password.request')} className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800">Lupa kata laluan?</Link>}</div>
                <div className="relative mt-2">
                  <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={data.password} onChange={(event) => setData('password', event.target.value)} autoComplete="current-password" required placeholder="Nombor kad pengenalan anda untuk log masuk pertama" className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-indigo-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Papar kata laluan'}>{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                </div>
                <InputError message={errors.password} className="mt-2" />
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600"><Checkbox name="remember" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span>Kekalkan saya log masuk</span></label>

              <motion.button type="submit" disabled={processing} whileHover={processing ? {} : { y: -2 }} whileTap={processing ? {} : { scale: 0.985 }} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700 hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">
                {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sedang log masuk…</> : <>Log masuk ke akaun anda<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
              </motion.button>
            </motion.form>

            <motion.div variants={item} className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">Baharu di PTRS? <Link href={route('register')} className="font-semibold text-indigo-600 transition hover:text-indigo-800">Cipta akaun</Link></motion.div>
            <motion.p variants={item} className="mt-8 text-center text-[11px] leading-5 text-slate-400">Dengan meneruskan, anda bersetuju untuk menggunakan PTRS Praktis secara bertanggungjawab dan memastikan akaun anda selamat.</motion.p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
