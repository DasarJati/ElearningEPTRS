import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { showAlert } from '@/Components/sweetAlert';

const LanguageContext = createContext();

const normalizeTranslations = (values = {}) => (
    values.common && typeof values.common === 'object' ? values.common : values
);

export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }

    return context;
};

export const LanguageProvider = ({ children, pageProps }) => {
    const [locale, setLocale] = useState(pageProps?.locale || 'en');
    const [translations, setTranslations] = useState(
        normalizeTranslations(pageProps?.translations || {})
    );
    const [availableLocales, setAvailableLocales] = useState(
        pageProps?.availableLocales || ['en', 'ms']
    );
    const [isChanging, setIsChanging] = useState(false);

    const syncLanguageProps = useCallback((props = {}) => {
        if (props.locale) {
            setLocale(props.locale);
        }

        if (props.translations) {
            setTranslations(normalizeTranslations(props.translations));
        }

        if (props.availableLocales) {
            setAvailableLocales(props.availableLocales);
        }
    }, []);

    // Keep the provider synchronized after normal Inertia navigation.
    useEffect(() => router.on('success', (event) => {
        syncLanguageProps(event.detail.page.props);
    }), [syncLanguageProps]);

    const changeLanguage = useCallback(async (newLocale) => {
        if (
            newLocale === locale
            || isChanging
            || !availableLocales.includes(newLocale)
        ) {
            return;
        }

        setIsChanging(true);

        try {
            const { data } = await axios.post(route('language.change'), {
                locale: newLocale,
            }, {
                headers: { Accept: 'application/json' },
            });

            syncLanguageProps(data);
        } catch (error) {
            console.error('Failed to change language:', error);
            showAlert((key) => translations[key] || key, {
                text: translations.language_change_failed || 'Failed to change language. Please try again.',
                icon: 'error',
            });
        } finally {
            setIsChanging(false);
        }
    }, [availableLocales, isChanging, locale, syncLanguageProps, translations]);

    const t = useCallback((key, fallback = '') => {
        if (key.includes('.')) {
            const keys = key.split('.');
            let value = translations;

            for (const part of keys) {
                if (value && value[part] !== undefined) {
                    value = value[part];
                } else {
                    return fallback || key;
                }
            }

            return value;
        }

        return translations[key] || fallback || key;
    }, [translations]);

    const value = useMemo(() => ({
        locale,
        translations,
        availableLocales,
        changeLanguage,
        isChanging,
        t,
        isEnglish: locale === 'en',
        isMalay: locale === 'ms',
    }), [availableLocales, changeLanguage, isChanging, locale, t, translations]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
