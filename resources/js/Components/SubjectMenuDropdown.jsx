import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function SubjectMenuDropdown({ isOpen, setIsOpen, title }) {
  const schoolSubjects = usePage().props.schoolSubjects || [];
  const { t } = useLanguage();

  const getSubjectUrl = (subject) => {
    const subjectSlug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
    const subjectId = subject.id;
    const levelId = subject.level_id;
    const form = levelId === 10 ? 'Form 4' : 'Form 5';
    return `/subject/${subjectSlug}?subject_id=${subjectId}&level_id=${levelId}&form=${encodeURIComponent(form)}`;
  };

  return (
    <>
      {/* Game-style Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 text-sm font-semibold rounded-xl transition-all duration-200
          ${isOpen 
            ? 'bg-white text-amber-600 shadow-md' 
            : 'bg-white/10 text-white hover:bg-white/20'
          }
          focus:outline-none focus:ring-2 focus:ring-amber-400 px-3 py-2
        `}
      >
        {/* Hamburger icon */}
        <svg
          className="h-5 w-5 sm:hidden"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>

        {/* Tablet view */}
        <span className="hidden sm:flex lg:hidden flex-col items-start">
          <span className="text-xs text-white/80">Menu</span>
          <span className="flex items-center text-sm font-semibold">
            {title}
            <svg
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </span>

        {/* Desktop view */}
        <span className="hidden lg:flex items-center gap-2">
          <span className="text-lg">📚</span>
          <span className='text-black'>Subjects</span>
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Game-style Dropdown Menu */}
      <div
        className={`
          fixed left-0 top-16 sm:top-20 w-screen bg-gradient-to-b from-white to-amber-50 
          shadow-xl transition-all duration-300 ease-out z-50 border-t-4 border-amber-400
          ${isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Menu Header with Decoration */}
          <div className="flex items-center gap-2 mb-5 pb-2 border-b border-amber-200">
            <div className="w-1 h-6 bg-amber-400 rounded-full"></div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Explore Your Quests
            </span>
            <div className="flex-1"></div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-amber-100 rounded-full transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* School Subjects - Quest Categories */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <h4 className="font-bold text-gray-800">
                  {t('school_subject', 'School Subjects')}
                </h4>
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                  {schoolSubjects.length}
                </span>
              </div>
              
              <ul className="space-y-1">
                {schoolSubjects.map((subject, idx) => (
                  <li key={subject.id}>
                    <Link
                      href={getSubjectUrl(subject)}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 transition-all duration-200"
                    >
                      <span className="text-lg opacity-60 group-hover:opacity-100 transition">
                        {getSubjectIcon(idx)}
                      </span>
                      <span className="text-sm text-gray-700 group-hover:text-amber-700 group-hover:font-medium transition">
                        {subject.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                {schoolSubjects.length === 0 && (
                  <li className="px-3 py-4 text-center text-gray-400 text-sm">
                    📭 {t('no_subjects_available', 'No subjects available')}
                  </li>
                )}
              </ul>
            </div>

            {/* Games Section - Play & Learn */}
            {/* <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🎮</span>
                </div>
                <h4 className="font-bold text-gray-800">
                  {t('games', 'Games')}
                </h4>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  Play & Earn
                </span>
              </div>
              
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/tekakata-page" 
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 transition-all duration-200"
                  >
                    <span className="text-lg">🔤</span>
                    <span className="text-sm text-gray-700 group-hover:text-green-700 transition">
                      {t('teka_kata', 'Word Puzzle')}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">
                      +50 XP
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/quiz-page" 
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 transition-all duration-200"
                  >
                    <span className="text-lg">⚡</span>
                    <span className="text-sm text-gray-700 group-hover:text-green-700 transition">
                      {t('quiz_arena', 'Quiz Arena')}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">
                      +100 XP
                    </span>
                  </Link>
                </li>
              </ul>
            </div> */}

            
          </div>

          {/* Menu Footer - Quick Tips */}
          <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">💡</span>
              <span>Complete subjects to earn XP and unlock new adventures!</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-400">🏆</span>
              <span>{schoolSubjects.length} Subjects Available</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to get subject icons
function getSubjectIcon(index) {
  const icons = ['📘', '📗', '📕', '📙', '📔', '📒', '📚', '🔬', '🧮', '🎨', '🌍', '💻'];
  return icons[index % icons.length];
}