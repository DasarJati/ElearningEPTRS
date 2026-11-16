import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    student,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { t } = useLanguage();

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            ...(student ? { class_name: student.class_name ?? '' } : {}),
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    {t('profile_information')}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    {t('profile_information_description')}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {student && (
                    <div>
                        <InputLabel htmlFor="ic_number" value={t('ic_number')} />
                        <TextInput
                            id="ic_number"
                            className="mt-1 block w-full bg-gray-100 text-gray-600"
                            value={student.ic_number ?? ''}
                            readOnly
                            aria-describedby="ic_number_help"
                        />
                        <p id="ic_number_help" className="mt-1 text-sm text-gray-500">{t('ic_number_read_only')}</p>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="name" value={t('name')} />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('email')} />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {student && (
                    <div>
                        <InputLabel htmlFor="class_name" value={t('student_class')} />
                        <TextInput
                            id="class_name"
                            className="mt-1 block w-full"
                            value={data.class_name}
                            onChange={(e) => setData('class_name', e.target.value)}
                            maxLength={100}
                            placeholder={t('student_class_example')}
                            aria-describedby="class_name_help"
                        />
                        <p id="class_name_help" className="mt-1 text-sm text-gray-500">{t('student_class_help')}</p>
                        <InputError className="mt-2" message={errors.class_name} />
                    </div>
                )}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            {t('email_unverified')}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {t('resend_verification_email')}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                {t('verification_email_sent')}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{t('save')}</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            {t('saved')}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
