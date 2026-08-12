import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AtSymbolIcon,
  CheckCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
  SparklesIcon,
  UserIcon,
  BuildingLibraryIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function Register({ schools = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    ic_number: '',
    email: '',
    school_id: '',
  });

  const submit = (event) => {
    event.preventDefault();
    post(route('register'));
  };

  return (
    <>
      <Head title="Create student account" />
      <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(430px,0.78fr)_minmax(0,1.22fr)]">
        <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
          <motion.div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" animate={{ x: [0, 35, 0], y: [0, -20, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg"><ApplicationLogo className="h-10 w-10 object-contain" /></span>
            <div><p className="text-sm font-bold">PTRS Praktis</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">Student portal</p></div>
          </motion.div>

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 my-auto max-w-lg">
            <motion.span variants={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur"><SparklesIcon className="h-4 w-4" /> Start learning today</motion.span>
            <motion.h1 variants={item} className="mt-6 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">One account.<br /><span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Every learning goal.</span></motion.h1>
            <motion.p variants={item} className="mt-5 text-sm leading-7 text-slate-300 xl:text-base">Create your student account in less than a minute and begin exploring lessons, practice, and progress.</motion.p>
            <motion.div variants={item} className="mt-8 grid gap-3">
              {['Personal learning dashboard', 'Instant practice feedback', 'Progress you can clearly see'].map((label) => <div key={label} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircleIcon className="h-5 w-5 text-emerald-400" />{label}</div>)}
            </motion.div>
          </motion.div>

          <p className="relative z-10 border-t border-white/10 pt-5 text-[11px] text-slate-500">© {new Date().getFullYear()} PTRS Praktis</p>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-100/70 to-transparent" />
          <motion.div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full max-w-lg rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl sm:p-9">
            <motion.div variants={item} className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3 lg:hidden"><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-950"><ApplicationLogo className="h-9 w-9 object-contain" /></span><p className="text-sm font-bold text-slate-900">PTRS Praktis</p></div>
              <Link href={route('login')} className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"><ArrowLeftIcon className="h-4 w-4" /> Back to sign in</Link>
            </motion.div>

            <motion.div variants={item}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><AcademicCapIcon className="h-6 w-6" /></div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Student registration</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter your official details so your learning record is easy to identify.</p>
            </motion.div>

            <motion.form variants={item} onSubmit={submit} className="mt-7 space-y-4">
              <Field label="Full name" name="name" value={data.name} error={errors.name} placeholder="Your full name" autoComplete="name" icon={UserIcon} onChange={(value) => setData('name', value)} autoFocus />
              <Field label="IC number" name="ic_number" value={data.ic_number} error={errors.ic_number} placeholder="e.g. 010203040506" autoComplete="username" inputMode="numeric" maxLength={14} icon={IdentificationIcon} onChange={(value) => setData('ic_number', value)} />
              <Field label="Email address" name="email" value={data.email} error={errors.email} placeholder="student@example.com" autoComplete="email" type="email" icon={AtSymbolIcon} onChange={(value) => setData('email', value)} />
              <SchoolField schools={schools} value={data.school_id} error={errors.school_id} onChange={(value) => setData('school_id', value)} />

              <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs leading-5 text-indigo-800">
                <LockClosedIcon className="mt-0.5 h-4 w-4 flex-none" />
                <p>Your initial password will be your 12-digit IC number. You can change it after signing in.</p>
              </div>

              <motion.button type="submit" disabled={processing} whileHover={processing ? {} : { y: -2 }} whileTap={processing ? {} : { scale: 0.985 }} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700 hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">
                {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account…</> : <>Create student account<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
              </motion.button>
            </motion.form>

            <motion.p variants={item} className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href={route('login')} className="font-semibold text-indigo-600 hover:text-indigo-800">Sign in with your IC</Link></motion.p>
          </motion.div>
        </section>
      </main>
    </>
  );
}

function Field({ label, name, value, error, icon: Icon, onChange, type = 'text', ...props }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input id={name} name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} required className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-indigo-500" {...props} />
      </div>
      <InputError message={error} className="mt-2" />
    </div>
  );
}

function SchoolField({ schools, value, error, onChange }) {
  const [query, setQuery] = useState('');
  const selectedSchool = schools.find((school) => String(school.id) === String(value));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredSchools = normalizedQuery === ''
    ? schools
    : schools.filter((school) => school.name.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <div>
      <label htmlFor="school_id" className="text-sm font-semibold text-slate-700">School</label>
      <Combobox
        value={selectedSchool || null}
        onChange={(school) => onChange(school ? String(school.id) : '')}
        onClose={() => setQuery('')}
      >
        <div className="relative mt-2">
          <BuildingLibraryIcon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <ComboboxInput
            id="school_id"
            name="school_name_search"
            required={!value}
            aria-label="Search and select your school"
            displayValue={(school) => school?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search school name..."
            autoComplete="off"
            className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-indigo-600" aria-label="Show schools">
            <ChevronUpDownIcon className="h-5 w-5" />
          </ComboboxButton>

          <ComboboxOptions
            transition
            className="absolute z-50 mt-2 max-h-60 w-full origin-top overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl transition duration-100 ease-out empty:invisible data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {filteredSchools.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-500">No school found for “{query}”</div>
            ) : (
              filteredSchools.map((school) => (
                <ComboboxOption
                  key={school.id}
                  value={school}
                  className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-slate-700 outline-none data-[focus]:bg-indigo-50 data-[focus]:text-indigo-800"
                >
                  <span className="min-w-0 truncate">{school.name}</span>
                  <CheckCircleIcon className="hidden h-4 w-4 flex-none text-emerald-600 group-data-[selected]:block" />
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
      {selectedSchool && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircleIcon className="h-4 w-4" />
          Selected: {selectedSchool.name}
        </p>
      )}
      <InputError message={error} className="mt-2" />
    </div>
  );
}
