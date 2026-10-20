import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function NotificationDropdown() {
  const { t, locale } = useLanguage();
  const { notificationCount = 0 } = usePage().props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [items, setItems] = useState([]);
  const [badgeCount, setBadgeCount] = useState(notificationCount);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const rootRef = useRef(null);
  const bellRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    setBadgeCount(notificationCount);
  }, [notificationCount]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!selectedMessage) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedMessage(null);
        requestAnimationFrame(() => bellRef.current?.focus());
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMessage]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(route('notifications.index'), {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setItems(data.items || []);
      setBadgeCount(data.unread_count || 0);
    } catch (loadError) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open) loadNotifications();
    setOpen(!open);
  };

  const openMessage = async (item) => {
    setOpen(false);
    setSelectedMessage(item);
    try {
      const response = await axios.post(route('notifications.read'), { ids: [item.id] });
      setBadgeCount(response.data.unread_count || 0);
    } catch (readError) {
      // Keep the unread badge if saving read status fails.
    }
  };

  const closeMessage = () => {
    setSelectedMessage(null);
    requestAnimationFrame(() => bellRef.current?.focus());
  };

  const formatDate = (value) => value
    ? new Intl.DateTimeFormat(locale === 'ms' ? 'ms-MY' : 'en-MY', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    }).format(new Date(value))
    : '';

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={bellRef}
        type="button"
        onClick={toggle}
        aria-label={t('notifications')}
        aria-expanded={open}
        aria-controls="notification-panel"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
      >
        <BellIcon className="h-5 w-5" />
        {badgeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <section
          id="notification-panel"
          aria-label={t('notifications')}
          className="absolute right-0 top-full z-[70] mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/50"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">{t('notifications')}</h2>
            <p className="text-xs text-slate-500">{t('recent_notifications')}</p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2" aria-live="polite">
            {loading ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">{t('loading_notifications')}</p>
            ) : error ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                <p>{t('notifications_error')}</p>
                <button type="button" onClick={loadNotifications} className="mt-2 font-semibold text-indigo-600 hover:underline">{t('try_again')}</button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">{t('no_notifications')}</p>
            ) : items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openMessage(item)}
                className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <p className="text-xs font-semibold text-indigo-600">{item.sender}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.message}</p>
                <time className="mt-1 block text-xs text-slate-400" dateTime={item.created_at}>{formatDate(item.created_at)}</time>
              </button>
            ))}
          </div>
        </section>
      )}
      {selectedMessage && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMessage();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-message-title"
            aria-describedby="notification-message-body"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-indigo-600">{selectedMessage.sender}</p>
                <h2 id="notification-message-title" className="mt-1 text-lg font-bold text-slate-900">{selectedMessage.title}</h2>
                <time className="mt-1 block text-xs text-slate-400" dateTime={selectedMessage.created_at}>{formatDate(selectedMessage.created_at)}</time>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeMessage}
                aria-label={t('close')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                ×
              </button>
            </div>
            {selectedMessage.image && (
              <img src={selectedMessage.image} alt="" className="aspect-[3/2] w-full object-cover" />
            )}
            <p id="notification-message-body" className="whitespace-pre-line px-5 py-5 text-sm leading-relaxed text-slate-700">
              {selectedMessage.message}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
