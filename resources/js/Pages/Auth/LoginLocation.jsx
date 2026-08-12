import { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function LoginLocation() {
    const requested = useRef(false);
    const [state, setState] = useState('requesting');
    const [message, setMessage] = useState('Your browser may ask for location permission.');

    const submitResult = (payload) => {
        router.post(route('login.location.store'), payload, {
            preserveScroll: true,
            onError: () => {
                setState('error');
                setMessage('We could not save the location result. Please try again.');
            },
        });
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setState('unavailable');
            setMessage('This browser does not support precise location. Continuing without it...');
            submitResult({ permission_status: 'unavailable' });
            return;
        }

        setState('requesting');
        setMessage('Waiting for location permission...');

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setState('captured');
                setMessage('Location captured securely. Opening your dashboard...');
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
                    ? 'Location permission was not granted. Continuing without location...'
                    : 'Your location could not be determined. Continuing without it...');
                submitResult({ permission_status: denied ? 'denied' : 'unavailable' });
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
        );
    };

    useEffect(() => {
        if (requested.current) return;
        requested.current = true;
        requestLocation();
    }, []);

    const Icon = state === 'captured'
        ? CheckCircleIcon
        : state === 'error'
            ? ExclamationTriangleIcon
            : MapPinIcon;

    return (
        <>
            <Head title="Confirm location" />
            <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-10">
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
                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Login security step</p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Confirm your learning location</h1>
                        <p className="mt-4 text-sm leading-6 text-slate-400">PTRS records your current coordinates after login to help measure learning reach. Your browser stays in control of permission.</p>
                    </div>

                    <div className="px-8 py-8 sm:px-10">
                        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4">
                            <span className="relative mt-1 flex h-2.5 w-2.5 flex-none">
                                {state === 'requesting' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />}
                                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state === 'captured' ? 'bg-emerald-500' : state === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                            </span>
                            <p className="text-sm font-medium leading-6 text-slate-700">{message}</p>
                        </div>

                        {state === 'error' && (
                            <button type="button" onClick={requestLocation} className="mt-5 h-12 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-indigo-700">
                                Try again
                            </button>
                        )}

                        <div className="mt-6 flex items-start gap-3 border-t border-slate-100 pt-6 text-xs leading-5 text-slate-400">
                            <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-none text-emerald-500" />
                            <p>No Google API is required. Precise location is collected only through the browser permission you approve.</p>
                        </div>
                    </div>
                </motion.section>
            </main>
        </>
    );
}
