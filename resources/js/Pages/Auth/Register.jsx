import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import {
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
  const { t } = useLanguage();
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
      <Head title={t('create_student_account')} />
      <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(430px,0.78fr)_minmax(0,1.22fr)]">
        <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
          <motion.div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" animate={{ x: [0, 35, 0], y: [0, -20, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg"><ApplicationLogo className="h-10 w-10 object-contain" /></span>
            <div><p className="text-sm font-bold">PTRS Praktis</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">{t('student_portal')}</p></div>
          </motion.div>

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 my-auto max-w-lg">
            <motion.span variants={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur"><SparklesIcon className="h-4 w-4" /> {t('start_learning_today')}</motion.span>
            <motion.h1 variants={item} className="mt-6 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">{t('one_account')}<br /><span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{t('every_learning_goal')}</span></motion.h1>
            <motion.p variants={item} className="mt-5 text-sm leading-7 text-slate-300 xl:text-base">{t('register_intro')}</motion.p>
            <motion.div variants={item} className="mt-8 grid gap-3">
              {['personal_dashboard', 'instant_practice_feedback', 'clear_progress'].map((key) => <div key={key} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircleIcon className="h-5 w-5 text-emerald-400" />{t(key)}</div>)}
            </motion.div>
          </motion.div>

          <p className="relative z-10 border-t border-white/10 pt-5 text-[11px] text-slate-500">© {new Date().getFullYear()} PTRS Praktis</p>
        </section>

        <section className="relative flex min-h-screen flex-col items-center px-5 pb-10 pt-5 sm:px-8 sm:pb-14 sm:pt-7 lg:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-100/70 to-transparent" />
          <div className="relative z-20 flex w-full max-w-xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <ApplicationLogo className="h-9 w-9 object-contain" />
              <p className="text-sm font-bold text-slate-900">PTRS Praktis</p>
            </div>
            <div className="ml-auto"><LanguageSwitcher type="buttons" /></div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full max-w-xl pt-8 sm:pt-12 xl:pt-16">
            <motion.div variants={item} className="mb-6">
              <Link href={route('login')} className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-700"><ArrowLeftIcon className="h-4 w-4" /> {t('back_to_login')}</Link>
            </motion.div>

            <motion.div variants={item}>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">{t('student_registration')}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{t('create_your_account')}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{t('register_details_intro')}</p>
            </motion.div>

            <motion.form variants={item} onSubmit={submit} className="mt-7 space-y-4">
              <Field label={t('full_name')} name="name" value={data.name} error={errors.name} placeholder={t('your_full_name')} autoComplete="name" icon={UserIcon} onChange={(value) => setData('name', value.toUpperCase())} className="uppercase placeholder:normal-case" autoFocus />
              <div className="space-y-4">
                <Field label={t('ic_number')} name="ic_number" value={data.ic_number} error={errors.ic_number} placeholder={t('ic_example')} autoComplete="username" inputMode="numeric" maxLength={14} icon={IdentificationIcon} onChange={(value) => setData('ic_number', value)} />
                <div>
                <Field label={t('password')} name="password" value={data.ic_number.replace(/\D/g, '')} readOnly autoComplete="off" icon={LockClosedIcon} aria-describedby="registration-password-hint" />
                  <p id="registration-password-hint" className="mt-2 text-sm text-slate-600">{t('initial_password_note')}</p>
                </div>
              </div>
              <Field label={t('email_address')} name="email" value={data.email} error={errors.email} placeholder="student@example.com" autoComplete="email" type="email" icon={AtSymbolIcon} onChange={(value) => setData('email', value)} />
              <SchoolField schools={schools} value={data.school_id} error={errors.school_id} onChange={(value) => setData('school_id', value)} />

              <motion.button type="submit" disabled={processing} whileHover={processing ? {} : { y: -2 }} whileTap={processing ? {} : { scale: 0.985 }} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('creating_account')}</> : <>{t('create_student_account')}<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
              </motion.button>
            </motion.form>

            <motion.p variants={item} className="mt-6 text-center text-sm text-slate-500">{t('already_registered')} <Link href={route('login')} className="font-semibold text-indigo-600 hover:text-indigo-800">{t('login_with_ic')}</Link></motion.p>
          </motion.div>
        </section>
      </main>
    </>
  );
}

function Field({ label, name, value, error, icon: Icon, onChange, type = 'text', className = '', ...props }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input id={name} name={name} type={type} value={value} onChange={onChange && ((event) => onChange(event.target.value))} required={!props.readOnly} className={`h-12 w-full rounded-xl border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 transition sm:text-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 read-only:bg-slate-100 ${className}`} {...props} />
      </div>
      <InputError message={error} className="mt-2" />
    </div>
  );
}

function SchoolField({ schools, value, error, onChange }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const selectedSchool = schools.find((school) => String(school.id) === String(value));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredSchools = normalizedQuery === ''
    ? schools
    : schools.filter((school) => school.name.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <div>
      <label htmlFor="school_id" className="text-sm font-semibold text-slate-700">{t('school')}</label>
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
            aria-label={t('search_select_school')}
            aria-describedby="school-selection-hint"
            displayValue={(school) => school?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search_school_name')}
            autoComplete="off"
            className="h-12 w-full rounded-xl border-slate-300 bg-white pl-11 pr-11 text-base text-slate-900 placeholder:text-slate-500 transition sm:text-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-indigo-600" aria-label={t('show_schools')}>
            <ChevronUpDownIcon className="h-5 w-5" />
          </ComboboxButton>

          <ComboboxOptions
            transition
            className="absolute z-50 mt-2 max-h-60 w-full origin-top overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl transition duration-100 ease-out empty:invisible data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {filteredSchools.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-500">{t('no_school_found')} “{query}”</div>
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
      <p id="school-selection-hint" className="mt-2 text-sm text-slate-600">{t('school_not_listed_hint')}</p>
      {selectedSchool && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircleIcon className="h-4 w-4" />
          {t('selected_school')}: {selectedSchool.name}
        </p>
      )}
      <InputError message={error} className="mt-2" />
    </div>
  );
}
