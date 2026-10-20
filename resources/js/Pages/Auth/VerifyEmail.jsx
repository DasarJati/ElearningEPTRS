import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

export default function VerifyEmail({ status }) {
    const { t } = useLanguage();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('email_verification')} />

            <div className="mb-4 text-sm text-gray-600">
                {t('email_verification_intro')}
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {t('verification_link_sent')}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        {t('resend_verification_email')}
                    </PrimaryButton>

                    <button
                        type="button"
                        onClick={async () => {
                            if (await confirmAlert(t, { title: t('sign_out'), text: t('sign_out_confirmation'), confirmText: t('sign_out') })) {
                                router.post(route('logout'));
                            }
                        }}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {t('sign_out')}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
