import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

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

const Card = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-[28px] border border-white/15 bg-[#1d1b39]/90 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const Shell = ({ children, wide = false }) => (
  <div className="quiz-leaderboard-background relative min-h-screen text-white">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-950/30 via-transparent to-blue-950/30" />
    <div className={`relative mx-auto px-4 py-8 sm:px-6 ${wide ? 'max-w-6xl' : 'max-w-xl'}`}>
      <Link
        href="/quiz-page"
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        ← Kembali ke Leaderboard
      </Link>
      {children}
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

const filterInput = 'w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-violet-200/50 [color-scheme:dark] focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/30';
const RELOAD = { preserveState: true, preserveScroll: true, replace: true, only: ['players', 'playerFilters', 'playerStats'] };

const formatSeconds = (seconds) => {
  const s = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Turn the filter state into query params, leaving out empty / default values.
const toQuery = (f) => {
  const query = {};
  if (f.search) query.search = f.search;
  if (f.school !== '' && f.school !== null) query.school = f.school;
  if (f.from) query.from = f.from;
  if (f.to) query.to = f.to;
  if (!f.event) query.event = '0';
  if (f.sort && f.sort !== 'latest') query.sort = f.sort;
  if (f.per_page && Number(f.per_page) !== 25) query.per_page = f.per_page;
  return query;
};

const StatBox = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <p className="text-xs font-semibold text-violet-200">{label}</p>
    <p className="text-2xl font-extrabold text-white tabular-nums">{Number(value).toLocaleString()}</p>
  </div>
);

const PlayersPanel = ({ players, filters: serverFilters, stats, schools }) => {
  const { t } = useLanguage();
  const { flash } = usePage().props;
  const [filters, setFilters] = useState(serverFilters);
  const [selected, setSelected] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const searchTimer = useRef(null);

  const rows = players.data ?? [];
  const pageIds = rows.map((p) => p.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const hasActiveFilters = Boolean(filters.search || filters.school !== '' || filters.from || filters.to || !filters.event);

  // A new page or new filter result clears the selection.
  useEffect(() => { setSelected(new Set()); }, [players.current_page, players.total, pageIds.join(',')]);
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const load = (next) => router.get('/quiz-settings', toQuery(next), RELOAD);

  const update = (patch, { debounce = false } = {}) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    clearTimeout(searchTimer.current);
    if (debounce) {
      searchTimer.current = setTimeout(() => load(next), 400);
    } else {
      load(next);
    }
  };

  const resetFilters = () => update({ search: '', school: '', from: '', to: '', event: true, sort: 'latest' });

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAllOnPage = () => setSelected((prev) => {
    const next = new Set(prev);
    pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)));
    return next;
  });

  const remove = async (ids, label) => {
    if (!ids.length || deleting) return;
    const confirmed = await confirmAlert(t, {
      title: 'Padam pemain?',
      text: `${label} akan dipadam dari leaderboard. Tindakan ini tidak boleh dibatalkan.`,
      confirmText: 'Ya, padam',
    });
    if (!confirmed) return;

    setDeleting(true);
    router.delete('/quiz-settings/players', {
      data: { ids },
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => setSelected(new Set()),
      onFinish: () => setDeleting(false),
    });
  };

  const goTo = (url) => url && router.get(url, {}, RELOAD);

  return (
    <>
      <Header title="Pemain Berdaftar" subtitle="Semua pemain Quiz Arena yang sudah tamat kuiz dan disimpan dalam leaderboard." />
      <div className="space-y-5 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatBox label="Dalam tempoh acara" value={stats.event} />
          <StatBox label="Hari ini" value={stats.today} />
          <StatBox label="Jumlah keseluruhan" value={stats.all} />
        </div>

        {/* Filters */}
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="player-search" className="mb-1 block text-xs font-semibold text-violet-100">Cari</label>
            <input
              id="player-search"
              type="search"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value }, { debounce: true })}
              placeholder="Nama, e-mel, telefon atau IC"
              className={filterInput}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="player-school" className="mb-1 block text-xs font-semibold text-violet-100">Sekolah</label>
            <select id="player-school" value={filters.school} onChange={(e) => update({ school: e.target.value })} className={filterInput}>
              <option value="">Semua sekolah</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="player-from" className="mb-1 block text-xs font-semibold text-violet-100">Dari tarikh</label>
            <input id="player-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => update({ from: e.target.value })} className={filterInput} />
          </div>
          <div>
            <label htmlFor="player-to" className="mb-1 block text-xs font-semibold text-violet-100">Hingga tarikh</label>
            <input id="player-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => update({ to: e.target.value })} className={filterInput} />
          </div>
          <div>
            <label htmlFor="player-sort" className="mb-1 block text-xs font-semibold text-violet-100">Susun</label>
            <select id="player-sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className={filterInput}>
              <option value="latest">Terbaru</option>
              <option value="oldest">Terawal</option>
              <option value="points">Markah tertinggi</option>
              <option value="name">Nama (A–Z)</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-violet-100">
              <input
                type="checkbox"
                checked={filters.event}
                onChange={(e) => update({ event: e.target.checked })}
                className="h-4 w-4 rounded border-white/30 bg-white/10 text-amber-400 focus:ring-amber-300"
              />
              Hanya dalam tempoh acara (tarikh tetapan di atas)
            </label>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="text-sm font-semibold text-blue-300 underline hover:text-blue-200">
                Set semula filter
              </button>
            )}
          </div>
        </div>

        {/* Result bar + bulk delete */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-violet-100" role="status">
            {players.total > 0
              ? <>Papar <strong>{players.from}–{players.to}</strong> daripada <strong>{players.total.toLocaleString()}</strong> pemain</>
              : 'Tiada pemain ditemui.'}
            {flash?.success && <span className="ml-3 font-bold text-emerald-300">✓ {flash.success}</span>}
          </p>
          <div className="flex items-center gap-3">
            {selected.size > 0 && <span className="text-sm font-semibold text-amber-200">{selected.size} dipilih</span>}
            <button
              type="button"
              disabled={selected.size === 0 || deleting}
              onClick={() => remove([...selected], `${selected.size} pemain yang dipilih`)}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? 'Memadam...' : `🗑️ Padam dipilih${selected.size ? ` (${selected.size})` : ''}`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/10 text-xs uppercase tracking-wide text-violet-100">
              <tr>
                <th scope="col" className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua di halaman ini"
                    checked={allOnPageSelected}
                    disabled={!rows.length}
                    onChange={toggleAllOnPage}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-amber-400 focus:ring-amber-300"
                  />
                </th>
                <th scope="col" className="px-3 py-3">Pemain</th>
                <th scope="col" className="px-3 py-3">Hubungan</th>
                <th scope="col" className="px-3 py-3 text-right">Markah</th>
                <th scope="col" className="px-3 py-3">Tarikh main</th>
                <th scope="col" className="px-3 py-3 text-right"><span className="sr-only">Tindakan</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-violet-200">Tiada pemain untuk filter ini.</td></tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className={selected.has(p.id) ? 'bg-amber-300/10' : 'hover:bg-white/5'}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${p.name}`}
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 rounded border-white/30 bg-white/10 text-amber-400 focus:ring-amber-300"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-white">{p.name}</p>
                    {p.school && <p className="text-xs text-violet-200">{p.school}</p>}
                  </td>
                  <td className="px-3 py-3 text-xs text-violet-100">
                    {p.email && <p>✉️ {p.email}</p>}
                    {p.phone && <p>📞 {p.phone}</p>}
                    {p.ic && <p>🪪 {p.ic}</p>}
                    {!p.email && !p.phone && !p.ic && <span className="text-violet-200/50">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="font-extrabold text-white tabular-nums">{p.points.toLocaleString()}</p>
                    <p className="text-xs text-violet-200 tabular-nums">{p.correct}/{p.answered} · {formatSeconds(p.time)}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-violet-100 tabular-nums">{p.played_at}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => remove([p.id], `"${p.name}"`)}
                      className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
                    >
                      Padam
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <label htmlFor="player-per-page" className="text-violet-100">Setiap halaman</label>
            <select id="player-per-page" value={filters.per_page} onChange={(e) => update({ per_page: Number(e.target.value) })} className="rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-white [color-scheme:dark]">
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={!players.prev_page_url} onClick={() => goTo(players.prev_page_url)} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-semibold disabled:opacity-40">← Sebelum</button>
            <span className="text-violet-100 tabular-nums">Halaman {players.current_page} / {players.last_page}</span>
            <button type="button" disabled={!players.next_page_url} onClick={() => goTo(players.next_page_url)} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-semibold disabled:opacity-40">Seterusnya →</button>
          </div>
        </div>
      </div>
    </>
  );
};

const QuizSettings = ({
  unlocked = false,
  settings = null,
  defaultLabel = '',
  players = null,
  playerFilters = null,
  playerStats = null,
  schools = [],
}) => (
  <>
    <Head title="Quiz Settings" />
    {unlocked && settings ? (
      <Shell wide>
        <Card className="mx-auto max-w-xl">
          <SettingsForm settings={settings} defaultLabel={defaultLabel} />
        </Card>
        {players && (
          <Card className="mt-6">
            <PlayersPanel players={players} filters={playerFilters} stats={playerStats} schools={schools} />
          </Card>
        )}
      </Shell>
    ) : (
      <Shell>
        <Card><UnlockForm /></Card>
      </Shell>
    )}
  </>
);

export default QuizSettings;
