import React, { useState, useEffect } from 'react';
import QuizTimer from '@/Components/QuizTimer';
import StandardFooter from '@/Components/StandardFooter';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

const SubjectiveQuestionLayout = ({
  children,
  subject,
  currentTopic,
  progressCircles,
  timeElapsed,
  getTimeColor,
  sectionTitle,
  formatTime,
  footerContent
}) => {
  const { t } = useLanguage();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const handleBack = async () => {
    if (await confirmAlert(t, { title: t('exit_practice_title'), text: t('exit_subjective_practice'), confirmText: t('exit_practice_action') })) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY === 0) {
        // At the very top - show navbar and white header
        setShowNavbar(true);
      } else if (currentY > lastScrollY && currentY > 70) {
        // Scrolling down past 100px - hide everything
        setShowNavbar(false);
      } else if (currentY < lastScrollY && currentY > 100) {
        // Scrolling up past 100px - show only blue header
        setShowNavbar(false);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Navbar - hides on scroll down */}
      {/* ✅ White Header Section - hides on scroll down */}
      <div
        className={`bg-white shadow-xl p-4 md:p-6 sticky top-0 z-40 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <button
                onClick={handleBack}
                className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                title={t('back')}
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                  />
                </svg>
              </button>
              {sectionTitle}
            </h1>
            <p className="text-gray-600 text-sm px-12 md:text-base">
              {t('topic')}: {currentTopic}
            </p>
          </div>
          <div className="relative flex w-full flex-col items-center gap-2 md:w-auto md:items-end">
            {progressCircles}
            <QuizTimer timeElapsed={timeElapsed} formatTime={formatTime} getTimeColor={getTimeColor} className={''} />
          </div>
        </div>
      </div>

      {/* ✅ Main content - add top padding to account for fixed headers */}
      <div className="relative pb-0 pt-0">
        {children}

      
      </div>

      {/* ✅ Footer */}
      <footer className=" bg-white border-t border-gray-200 shadow-lg p-2 z-30">
        {footerContent}
      </footer>
      <StandardFooter />
    </div>
  );
};

export default SubjectiveQuestionLayout;
