import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function LoginLocation() {
    const { t } = useLanguage();
    const [state, setState] = useState('choice');
    const [message, setMessage] = useState('location_permission_question');
    const [submitting, setSubmitting] = useState(false);

    const submitResult = (payload) => {
        setSubmitting(true);
        router.post(route('login.location.store'), payload, {
            preserveScroll: true,
            onError: () => {
                setSubmitting(false);
                setState('error');
                setMessage('location_save_failed');
            },
        });
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setState('unavailable');
            setMessage('location_unsupported');
            submitResult({ permission_status: 'unavailable' });
            return;
        }

        setState('requesting');
        setMessage('location_waiting');

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setState('captured');
                setMessage('location_captured');
                submitResult({
                    permission_status: 'granted',
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy_m: coords.accuracy,
                });
            },
            (error) => {
                const denied = error.code === error.PERMISSION_DENIED;
                setState(denied ? 'denied' : 'unavailable');
                setMessage(denied
                    ? 'location_denied'
                    : 'location_unavailable');
                submitResult({ permission_status: denied ? 'denied' : 'unavailable' });
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
        );
    };

    const rejectLocation = () => {
        setState('denied');
        setMessage('location_rejected');
        submitResult({ permission_status: 'denied' });
    };

    const Icon = state === 'captured'
        ? CheckCircleIcon
        : state === 'error'
            ? ExclamationTriangleIcon
            : MapPinIcon;

    return (
        <>
            <Head title={t('confirm_location')} />
            <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-10">
                <div className="absolute right-5 top-5 z-20"><LanguageSwitcher type="buttons" /></div>
                <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/30"
                >
                    <div className="bg-gradient-to-br from-slate-950 to-indigo-950 px-8 py-10 text-white sm:px-10">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/25">
                            <Icon className="h-7 w-7" />
                        </div>
                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">{t('before_dashboard')}</p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('can_access_location')}</h1>
                        <p className="mt-4 text-sm leading-6 text-slate-400">{t('location_choice_intro')}</p>
                    </div>

                    <div className="px-8 py-8 sm:px-10">
                        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4">
                            <span className="relative mt-1 flex h-2.5 w-2.5 flex-none">
                                {state === 'requesting' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />}
                                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state === 'captured' ? 'bg-emerald-500' : state === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                            </span>
                            <p className="text-sm font-medium leading-6 text-slate-700">{t(message)}</p>
                        </div>

                        {state === 'choice' && (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={requestLocation}
                                    disabled={submitting}
                                    className="h-12 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {t('allow_location')}
                                </button>
                                <button
                                    type="button"
                                    onClick={rejectLocation}
                                    disabled={submitting}
                                    className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {t('reject_continue')}
                                </button>
                            </div>
                        )}

                        {state === 'error' && (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={requestLocation} className="h-12 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-indigo-700">{t('try_location_again')}</button><button type="button" onClick={rejectLocation} className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">{t('reject_continue')}</button></div>
                        )}

                        <div className="mt-6 flex items-start gap-3 border-t border-slate-100 pt-6 text-xs leading-5 text-slate-400">
                            <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-none text-emerald-500" />
                            <p>{t('location_privacy_note')}</p>
                        </div>
                    </div>
                </motion.section>
            </main>
        </>
    );
}
