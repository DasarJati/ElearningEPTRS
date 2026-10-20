import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import avatars from '@/Data/avatars';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function ProfilePictureSettings({ student, user }) {
    const { t } = useLanguage();
    const [showAvatars, setShowAvatars] = useState(false);
    const [preview, setPreview] = useState(null);
    const objectUrl = useRef(null);
    const { data, setData, post, processing, progress, errors, reset } = useForm({
        profile_picture: null,
        avatar_filename: null,
    });

    useEffect(() => () => {
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    }, []);

    const chooseFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = URL.createObjectURL(file);
        setPreview(objectUrl.current);
        setData({ profile_picture: file, avatar_filename: null });
        setShowAvatars(false);
    };

    const chooseAvatar = (filename) => {
        if (objectUrl.current) {
            URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = null;
        }
        setPreview(`/avatars/${filename}`);
        setData({ profile_picture: null, avatar_filename: filename });
    };

    const save = (event) => {
        event.preventDefault();
        post(route('profile.picture.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreview(null);
                setShowAvatars(false);
                if (objectUrl.current) {
                    URL.revokeObjectURL(objectUrl.current);
                    objectUrl.current = null;
                }
            },
        });
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">{t('change_profile_picture')}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{t('profile_picture_description')}</p>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-3xl font-semibold text-slate-600 ring-4 ring-slate-100">
                    {preview || student.profile_picture ? (
                        <img src={preview || student.profile_picture} alt={user?.name || t('change_profile_picture')} className="h-full w-full object-cover" />
                    ) : (
                        user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setShowAvatars((current) => !current)}
                        aria-expanded={showAvatars}
                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                    >
                        {t('choose_avatar')}
                    </button>
                    <label htmlFor="settings-profile-photo" className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        {t('upload_photo')}
                    </label>
                    <input id="settings-profile-photo" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={chooseFile} className="sr-only" />
                </div>
            </div>

            {showAvatars && (
                <div className="mt-5 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-6">
                    {avatars.map((filename, index) => (
                        <button
                            key={filename}
                            type="button"
                            onClick={() => chooseAvatar(filename)}
                            aria-label={`Avatar ${index + 1}`}
                            aria-pressed={data.avatar_filename === filename}
                            className={`aspect-square overflow-hidden rounded-xl ring-2 transition hover:ring-indigo-400 ${data.avatar_filename === filename ? 'ring-indigo-600' : 'ring-transparent'}`}
                        >
                            <img src={`/avatars/${filename}`} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {(errors.profile_picture || errors.avatar_filename) && (
                <p className="mt-3 text-sm text-rose-600">{errors.profile_picture || errors.avatar_filename}</p>
            )}
            {progress && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress.percentage} aria-valuemin="0" aria-valuemax="100">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress.percentage}%` }} />
                </div>
            )}
            {(data.profile_picture || data.avatar_filename) && (
                <button type="button" onClick={save} disabled={processing} className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                    {processing ? t('saving') : t('save')}
                </button>
            )}
        </section>
    );
}
