import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaChrome, FaFirefoxBrowser } from 'react-icons/fa6';
import { useLanguage } from '@/Contexts/LanguageContext';

const partners = [
  { name: 'PTRS', src: '/images/logo_PTRS.png', className: 'object-contain p-2' },
  { name: 'Quality Award', src: '/images/logo_award.png', className: 'object-contain p-3' },
];

const StandardFooter = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-0 bg-[#202020] text-slate-300">
      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(190px,.55fr)] lg:gap-8">
          <section className="max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-100">{t('footer_about_title')}</h2>
            <p className="mt-2 text-xs leading-6 text-slate-300">{t('footer_program_summary')}</p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-100">{t('footer_collaboration')}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {partners.map((partner) => (
                <div key={partner.name} className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                  <img src={partner.src} alt={partner.name} className={`h-full w-full ${partner.className}`} />
                </div>
              ))}
            </div>
          </section>

          <section className="lg:justify-self-end">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-100">{t('footer_contact_us')}</h2>
            <a href="mailto:help.eptrs@gmail.com" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-200 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#202020]">
              <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
              <span>help.eptrs@gmail.com</span>
            </a>
          </section>
        </div>

        <section className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-white/10 py-4">
          <h2 className="text-xs font-medium text-slate-300">{t('footer_browser_title')}</h2>
          <div className="flex justify-center gap-5">
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <FaFirefoxBrowser className="h-5 w-5" aria-hidden="true" />
              <span>Firefox</span>
            </span>
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <FaChrome className="h-5 w-5" aria-hidden="true" />
              <span>Chrome</span>
            </span>
          </div>
        </section>

        <div className="flex flex-col gap-2 pt-4 text-center text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {currentYear} Program Tuisyen Rakyat Selangor. {t('all_rights_reserved')}</p>
          <span>{t('privacy_policy')}</span>
        </div>
      </div>
    </footer>
  );
};

export default StandardFooter;
