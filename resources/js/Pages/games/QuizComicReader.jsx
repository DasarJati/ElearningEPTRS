import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

const basePath = '/images/comic/satu-hari-satu-soalan/pembaca';
const pageCount = 8;
const zoomStep = 25;
const maxZoom = 250;
const pageImage = (page) => `${basePath}/halaman-${String(page).padStart(2, '0')}.webp`;

export default function QuizComicReader({ onClose }) {
  const [{ page, direction }, setSlide] = useState({ page: 1, direction: '' });
  const [zoom, setZoom] = useState(100);
  const viewport = useRef(null);
  const zoomCenter = useRef(null);
  const dragStart = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => {
    for (const adjacent of [page - 1, page + 1]) {
      if (adjacent >= 1 && adjacent <= pageCount) {
        new Image().src = pageImage(adjacent);
      }
    }
  }, [page]);

  useLayoutEffect(() => {
    const element = viewport.current;
    const center = zoomCenter.current;
    if (!element) return;

    element.scrollLeft = center ? center.x * element.scrollWidth - element.clientWidth / 2 : 0;
    element.scrollTop = center ? center.y * element.scrollHeight - element.clientHeight / 2 : 0;
    zoomCenter.current = null;
  }, [page, zoom]);

  const turnPage = (step) => {
    const next = Math.min(pageCount, Math.max(1, page + step));
    if (next === page) return;

    zoomCenter.current = null;
    setZoom(100);
    setSlide({ page: next, direction: step > 0 ? 'next' : 'prev' });
  };

  const changeZoom = (next) => {
    const element = viewport.current;
    if (!element || next === zoom || next < 100 || next > maxZoom) return;

    zoomCenter.current = {
      x: (element.scrollLeft + element.clientWidth / 2) / element.scrollWidth,
      y: (element.scrollTop + element.clientHeight / 2) / element.scrollHeight,
    };
    setZoom(next);
  };

  const handlePointerDown = (event) => {
    if (zoom === 100 || event.pointerType !== 'mouse' || event.button !== 0) return;

    const element = event.currentTarget;
    dragStart.current = { x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop };
    element.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const start = dragStart.current;
    if (!start) return;
    event.currentTarget.scrollLeft = start.left + start.x - event.clientX;
    event.currentTarget.scrollTop = start.top + start.y - event.clientY;
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    turnPage(event.key === 'ArrowLeft' ? -1 : 1);
  };

  const handleTouchStart = (event) => {
    if (zoom > 100 || event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    const { clientX, clientY } = event.touches[0];
    touchStart.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.touches.length > 0) return;

    const { clientX, clientY } = event.changedTouches[0];
    const dx = clientX - start.x;
    const dy = clientY - start.y;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      turnPage(dx < 0 ? 1 : -1);
    }
  };

  return (
    <Dialog open onClose={onClose} className="quiz-comic fixed inset-0 z-[60]">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/80" />
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <DialogPanel className="comic-card comic-reader-panel" onKeyDown={handleKeyDown}>
          <header className="comic-reader-header">
            <DialogTitle className="comic-display text-xl sm:text-2xl">Misi Buku — Satu Hari, Satu Soalan</DialogTitle>
            <button type="button" aria-label="Tutup komik" onClick={onClose} className="comic-reader-close" data-autofocus>×</button>
          </header>
          <div className="comic-reader-spread" role="group" aria-label="Navigasi halaman komik">
            <button
              type="button"
              className="comic-reader-arrow comic-reader-prev"
              aria-label="Halaman sebelum"
              onClick={() => turnPage(-1)}
              disabled={page === 1}
            >
              <span aria-hidden="true">←</span>
            </button>
            <figure
              ref={viewport}
              className="comic-reader-slide"
              data-zoomed={zoom > 100}
              style={{ '--reader-zoom': zoom / 100 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onLostPointerCapture={() => { dragStart.current = null; }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={() => { touchStart.current = null; }}
            >
              <div key={page} className="comic-reader-page" data-turn={direction}>
                <img
                  src={pageImage(page)}
                  alt={`Misi Buku — halaman ${page}`}
                  draggable="false"
                />
              </div>
            </figure>
            <button
              type="button"
              className="comic-reader-arrow comic-reader-next"
              aria-label="Halaman seterusnya"
              onClick={() => turnPage(1)}
              disabled={page === pageCount}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <footer className="comic-reader-footer">
            <p className="comic-reader-count" aria-live="polite"><span className="sr-only">Halaman </span>{page} / {pageCount}</p>
            <div className="comic-reader-zoom" role="group" aria-label="Zum komik">
              <button type="button" aria-label="Kecilkan komik" onClick={() => changeZoom(zoom - zoomStep)} disabled={zoom === 100}>−</button>
              <button type="button" aria-label={`Zum ${zoom}%, kembali ke saiz asal`} onClick={() => changeZoom(100)}>{zoom}%</button>
              <button type="button" aria-label="Besarkan komik" onClick={() => changeZoom(zoom + zoomStep)} disabled={zoom === maxZoom}>+</button>
            </div>
          </footer>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
