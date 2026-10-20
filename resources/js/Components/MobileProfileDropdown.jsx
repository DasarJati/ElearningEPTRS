// MobileProfileDropdown.jsx
import React from 'react';
import { Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { useLanguage } from '@/Contexts/LanguageContext';
import { confirmAlert } from '@/Components/sweetAlert';

export default function MobileProfileDropdown({ user }) {
  const { t } = useLanguage();
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <span className="inline-flex rounded-full">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </button>
        </span>
      </Dropdown.Trigger>

      <Dropdown.Content className="w-72 mt-2 rounded-xl shadow-lg border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500 truncate mt-1">{user.email}</div>
        </div>
        
        <div className="py-1">
          <Dropdown.Link 
            href={route('profile.edit')}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
          >
            <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Dropdown.Link>
          
          <button
            type="button"
            onClick={async () => {
              if (await confirmAlert(t, { title: t('sign_out'), text: t('sign_out_confirmation'), confirmText: t('sign_out') })) {
                router.post(route('logout'));
              }
            }}
            className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('sign_out')}
          </button>
        </div>
      </Dropdown.Content>
    </Dropdown>
  );
}
