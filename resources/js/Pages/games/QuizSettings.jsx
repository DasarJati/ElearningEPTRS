import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white/10 px-4 py-3 text-white placeholder-violet-200/50 [color-scheme:dark] focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-400 focus:ring-red-400/40' : 'border-white/15 focus:border-violet-300 focus:ring-violet-400/30'
  }`;

const FIELD_TOGGLES = [
  { key: 'school', label: 'Sekolah' },
  { key: 'ic', label: 'Nombor IC' },
  { key: 'email', label: 'E-mel' },
  { key: 'phone', label: 'Nombor Telefon' },
];

const Shell = ({ children }) => (
  <div className="quiz-leaderboard-background relative min-h-screen text-white">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-950/30 via-transparent to-blue-950/30" />
    <div className="relative mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link
        href="/quiz-page"
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        ← Kembali ke Leaderboard
      </Link>
      <div className="overflow-hidden rounded-[28px] border border-white/15 bg-[#1d1b39]/90 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {children}
      </div>
    </div>
  </div>
);

const Header = ({ title, subtitle }) => (
  <div className="border-b border-white/10 bg-white/5 px-6 py-5">
    <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">⚙️ Quiz Settings</p>
    <h1 className="text-xl font-extrabold text-white sm:text-2xl">{title}</h1>
    {subtitle && <p className="mt-1 text-sm text-violet-200">{subtitle}</p>}
  </div>
);

const FieldError = ({ message }) =>
  message ? <p className="mt-1.5 text-sm text-red-400" role="alert">{message}</p> : null;

const UnlockForm = () => {
  const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

  const submit = (e) => {
    e.preventDefault();
    post('/quiz-settings/unlock', { onError: () => reset('password') });
  };

  return (
    <>
      <Header title="Akses Admin" subtitle="Masukkan kata laluan admin untuk ubah tetapan kuiz." />
      <form onSubmit={submit} className="space-y-4 p-6">
        <div>
          <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-violet-100">Kata laluan admin</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="off"
            autoFocus
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            className={inputClass(errors.password)}
          />
          <FieldError message={errors.password} />
        </div>
        <button
          type="submit"
          disabled={!data.password || processing}
          className="w-full rounded-xl bg-amber-300 px-6 py-3 font-bold text-[#241044] transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? 'Menyemak...' : 'Buka Tetapan'}
        </button>
      </form>
    </>
  );
};

const SettingsForm = ({ settings, defaultLabel }) => {
  const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
    label: settings.label ?? defaultLabel,
    start_date: settings.start_date ?? '',
    end_date: settings.end_date ?? '',
    registration: settings.registration,
  });

  const toggleField = (key) =>
    setData('registration', { ...data.registration, [key]: !data.registration[key] });

  const submit = (e) => {
    e.preventDefault();
    put('/quiz-settings', { preserveScroll: true });
  };

  const lock = () => router.post('/quiz-settings/lock');

  return (
    <>
      <Header title="Tetapan Leaderboard" subtitle="Ubah label dan julat tarikh markah yang dipaparkan." />
      <form onSubmit={submit} className="space-y-5 p-6" noValidate>
        <div>
          <label htmlFor="leaderboard-label" className="mb-2 block text-sm font-semibold text-violet-100">Label leaderboard *</label>
          <input
            id="leaderboard-label"
            type="text"
            maxLength={120}
            value={data.label}
            onChange={(e) => setData('label', e.target.value)}
            placeholder={defaultLabel}
            className={inputClass(errors.label)}
          />
          <p className="mt-1.5 text-xs text-violet-200/70">Dipaparkan selepas tajuk "Leaderboard".</p>
          <FieldError message={errors.label} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start-date" className="mb-2 block text-sm font-semibold text-violet-100">Tarikh mula</label>
            <input
              id="start-date"
              type="date"
              value={data.start_date}
              max={data.end_date || undefined}
              onChange={(e) => setData('start_date', e.target.value)}
              className={inputClass(errors.start_date)}
            />
            <FieldError message={errors.start_date} />
          </div>
          <div>
            <label htmlFor="end-date" className="mb-2 block text-sm font-semibold text-violet-100">Tarikh tamat</label>
            <input
              id="end-date"
              type="date"
              value={data.end_date}
              min={data.start_date || undefined}
              onChange={(e) => setData('end_date', e.target.value)}
              className={inputClass(errors.end_date)}
            />
            <FieldError message={errors.end_date} />
          </div>
        </div>
        <p className="-mt-2 text-xs text-violet-200/70">
          Hanya markah yang disimpan dalam tempoh ini akan dipaparkan (tarikh mula dan tamat termasuk). Kosongkan untuk papar semua markah.
        </p>

        {(data.start_date || data.end_date) && (
          <button
            type="button"
            onClick={() => { setData('start_date', ''); setData('end_date', ''); }}
            className="text-sm font-semibold text-blue-300 underline hover:text-blue-200"
          >
            Kosongkan tarikh
          </button>
        )}

        <fieldset className="border-t border-white/10 pt-5">
          <legend className="text-sm font-bold text-amber-300">Borang pendaftaran pemain</legend>
          <p className="mb-3 mt-1 text-xs text-violet-200/70">
            Hidupkan medan yang mahu dipaparkan untuk acara ini. Semua medan tambahan adalah pilihan (tidak wajib).
          </p>
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-semibold text-white">Nama Pemain</span>
              <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-200">Wajib</span>
            </div>
            {FIELD_TOGGLES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-3 px-4 py-3">
                <span id={`toggle-${key}-label`} className="text-sm font-semibold text-white">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.registration[key]}
                  aria-labelledby={`toggle-${key}-label`}
                  onClick={() => toggleField(key)}
                  className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${data.registration[key] ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute left-1 text-[10px] font-bold text-white transition-opacity ${data.registration[key] ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                  <span className={`absolute right-1.5 text-[10px] font-bold text-white/70 transition-opacity ${data.registration[key] ? 'opacity-0' : 'opacity-100'}`}>OFF</span>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${data.registration[key] ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
          <FieldError message={errors.registration} />
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={processing || !data.label.trim()}
            className="rounded-xl bg-amber-300 px-6 py-3 font-bold text-[#241044] transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? 'Menyimpan...' : 'Simpan Tetapan'}
          </button>
          <button
            type="button"
            onClick={lock}
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
          >
            🔒 Kunci
          </button>
          {recentlySuccessful && <span role="status" className="text-sm font-bold text-emerald-300">✓ Disimpan</span>}
        </div>
      </form>
    </>
  );
};

const QuizSettings = ({ unlocked = false, settings = null, defaultLabel = '' }) => (
  <>
    <Head title="Quiz Settings" />
    <Shell>
      {unlocked && settings ? <SettingsForm settings={settings} defaultLabel={defaultLabel} /> : <UnlockForm />}
    </Shell>
  </>
);

export default QuizSettings;
