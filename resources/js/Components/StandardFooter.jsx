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
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(220px,.55fr)] lg:gap-14">
          <section className="max-w-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-100">{t('footer_about_title')}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">{t('footer_program_description')}</p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-100">{t('footer_collaboration')}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {partners.map((partner) => (
                <div key={partner.name} className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm sm:h-24 sm:w-36">
                  <img src={partner.src} alt={partner.name} className={`h-full w-full ${partner.className}`} />
                </div>
              ))}
            </div>
          </section>

          <section className="lg:justify-self-end">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-100">{t('footer_contact_us')}</h2>
            <a href="mailto:help.eptrs@gmail.com" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#202020]">
              <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
              <span>help.eptrs@gmail.com</span>
            </a>
          </section>
        </div>

        <section className="mt-12 border-y border-white/10 py-8 text-center sm:mt-14">
          <h2 className="text-lg font-semibold text-slate-100">{t('footer_browser_title')}</h2>
          <p className="mt-2 text-sm font-medium text-slate-300">{t('footer_browser_description')}</p>
          <div className="mt-5 flex justify-center gap-6">
            <a href="https://www.mozilla.org/firefox/" target="_blank" rel="noreferrer" aria-label="Firefox" className="group flex flex-col items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#202020]">
              <FaFirefoxBrowser className="h-9 w-9 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              <span>Firefox</span>
            </a>
            <a href="https://www.google.com/chrome/" target="_blank" rel="noreferrer" aria-label="Chrome" className="group flex flex-col items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#202020]">
              <FaChrome className="h-9 w-9 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              <span>Chrome</span>
            </a>
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-6 text-center text-sm font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {currentYear} Program Tuisyen Rakyat Selangor. {t('all_rights_reserved')}</p>
          <a href="/privacy" className="transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#202020]">{t('privacy_policy')}</a>
        </div>
      </div>
    </footer>
  );
};

export default StandardFooter;
