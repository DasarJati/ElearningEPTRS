// resources/js/Components/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

export default function ProfileDropdown({ user, student }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debug logging - updated to use the student prop
  // useEffect(() => {
  //   console.log('ProfileDropdown debug:');
  //   console.log('User data:', user);
  //   console.log('Student prop:', student);
  //   console.log('User.student relationship:', user?.student);
  //   console.log('Profile picture path:', student?.profile_picture || user?.student?.profile_picture);
  //   console.log('Full URL would be:', `/storage/${student?.profile_picture || user?.student?.profile_picture}`);
  // }, [user, student]);

  // Use student prop if available, otherwise use user.student
  const studentData = student || user?.student;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t('manage_account')}
        aria-expanded={open}
        className="flex items-center text-gray-500 justify-center w-9 h-9 rounded-full bg-gray-200 hover:ring-2 hover:ring-black hover:text-black  transition focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 z-[60] mt-2 w-64 max-w-[calc(100vw-1rem)] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
          {/* Email Header */}
          <div className="bg-slate-900 px-3 py-3 text-center">
            <p className="truncate text-xs text-slate-200" title={user?.email}>{user?.email}</p>
          </div>

          {/* Profile Section */}
          <div className="relative flex flex-col items-center px-4 py-3">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-xl font-semibold text-white shadow-md">
                {studentData?.profile_picture ? (
                  <img
                    src={`/storage/${studentData.profile_picture}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load profile picture:', studentData.profile_picture);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() ?? 'U'
                )}
              </div>

              {/* Camera Button */}
              <Link
                href={`${route('profile.edit')}?tab=picture`}
                onClick={() => setOpen(false)}
                aria-label={t('change_profile_picture')}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 7h3l2-3h8l2 3h3v11H3V7z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </Link>
            </div>

            <h2 className="mt-2 max-w-full truncate text-sm font-semibold text-gray-800">
              {t('hello')}, {user?.name ?? t('learner')}!
            </h2>

          </div>

          {/* Action Buttons */}
          <div className="space-y-1 border-t border-slate-100 p-2">
            <Link
              href={route('profile.edit')}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100"
            >
              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.38.138.751.43.992l1.003.827a1.125 1.125 0 0 1 .26 1.431l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.331.184-.582.495-.644.87l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.643-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.127.332-.184.582-.495.645-.87l.213-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span className="text-sm font-medium text-slate-800">{t('settings')}</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                if (await confirmAlert(t, { title: t('sign_out'), text: t('sign_out_confirmation'), confirmText: t('sign_out') })) {
                  setOpen(false);
                  router.post(route('logout'));
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-rose-50"
            >
              <svg className="h-4 w-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <span className="text-sm font-medium text-rose-700">{t('sign_out')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
