import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { CameraIcon, GlobeAltIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ProfilePictureSettings from './Partials/ProfilePictureSettings';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Edit({ mustVerifyEmail, status, student }) {
    const { t, locale, changeLanguage, isChanging } = useLanguage();
    const user = usePage().props.auth?.user;
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'profile';
        const requested = new URLSearchParams(window.location.search).get('tab');
        if (requested === 'picture' && !student) return 'profile';
        return ['picture', 'profile', 'password', 'language'].includes(requested)
            ? requested
            : 'profile';
    });

    const tabs = [
        ...(student ? [{ id: 'picture', label: t('change_profile_picture'), icon: CameraIcon }] : []),
        { id: 'profile', label: t('profile_information'), icon: UserCircleIcon },
        { id: 'password', label: t('update_password'), icon: LockClosedIcon },
        { id: 'language', label: t('display_language'), icon: GlobeAltIcon },
    ];

    const handleTabKeyDown = (event, index) => {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0
            : event.key === 'End' ? tabs.length - 1
                : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
        document.getElementById(`settings-tab-${tabs[nextIndex].id}`)?.focus();
    };

    return (
        <DashboardLayout>
            <Head title={t('settings')} />

            <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-300/40 sm:px-8 sm:py-9">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{t('account_settings')}</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t('settings')}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{t('settings_intro')}</p>
                    {user?.email && <p className="mt-5 max-w-full truncate text-xs text-indigo-200">{user.email}</p>}
                </div>

                <div className="mt-6 grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <div role="tablist" aria-label={t('settings')} className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-1">
                        {tabs.map(({ id, label, icon: Icon }, index) => {
                            const selected = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    id={`settings-tab-${id}`}
                                    type="button"
                                    role="tab"
                                    aria-controls={`settings-panel-${id}`}
                                    aria-selected={selected}
                                    tabIndex={selected ? 0 : -1}
                                    onClick={() => setActiveTab(id)}
                                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                                    className={`flex min-h-14 min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${selected
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                    <span className="leading-5">{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="min-w-0">
                        {student && (
                            <div id="settings-panel-picture" role="tabpanel" aria-labelledby="settings-tab-picture" tabIndex={0} hidden={activeTab !== 'picture'}>
                                <ProfilePictureSettings student={student} user={user} />
                            </div>
                        )}
                        <div id="settings-panel-profile" role="tabpanel" aria-labelledby="settings-tab-profile" tabIndex={0} hidden={activeTab !== 'profile'}>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                            </div>
                        </div>
                        <div id="settings-panel-password" role="tabpanel" aria-labelledby="settings-tab-password" tabIndex={0} hidden={activeTab !== 'password'}>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                <UpdatePasswordForm />
                            </div>
                        </div>
                        <div id="settings-panel-language" role="tabpanel" aria-labelledby="settings-tab-language" tabIndex={0} hidden={activeTab !== 'language'}>
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                <h2 className="text-lg font-semibold text-slate-900">{t('display_language')}</h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">{t('display_language_description')}</p>
                                <div className="mt-6 grid max-w-md grid-cols-2 gap-3" role="group" aria-label={t('display_language')}>
                                    {[
                                        { code: 'ms', label: 'Bahasa Melayu' },
                                        { code: 'en', label: 'English' },
                                    ].map(({ code, label }) => (
                                        <button
                                            key={code}
                                            type="button"
                                            onClick={() => changeLanguage(code)}
                                            disabled={isChanging}
                                            aria-pressed={locale === code}
                                            className={`min-w-0 rounded-xl border px-3 py-4 text-center text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${locale === code
                                                ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
}
