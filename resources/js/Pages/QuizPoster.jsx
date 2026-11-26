import React from 'react';
import ComicArt from '@/Components/ComicArt';
import { Head } from '@inertiajs/react';
import '../../css/quiz-comic.css';

const formatDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const eventDates = (start, end) => {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return `Mulai ${formatDate(start)}`;
  if (end) return `Sehingga ${formatDate(end)}`;
  return null;
};

export default function QuizPoster({
  label = '',
  startDate = null,
  endDate = null,
  prizeTop = 10,
  quizUrl = '/quiz-page',
}) {
  const dates = eventDates(startDate, endDate);

  return (
    <main className="quiz-comic comic-stage comic-poster">
      <Head title="Quiz Arena – Misi Buku">
        <meta name="description" content="Jom jawab kuiz dalam 2 minit dan rebut hadiah menarik di Quiz Arena!" />
      </Head>
      <article className="comic-poster-sheet comic-card">
        <h1 className="comic-poster-title comic-display">
          Quiz Arena <span className="comic-ribbon">Misi Buku</span>
        </h1>
        <p className="comic-bubble comic-poster-tagline">Berani cuba, terus belajar!</p>
        <div className="comic-poster-art" aria-hidden="true">
          {[1, 2, 3, 4].map((number) => (
            <div key={number} className="comic-art-panel" data-panel={number}>
              <ComicArt
                file={`panel-${number}.png`}
                className="comic-panel-portrait"
                fallback={<span>{number % 2 ? '?' : '★'}</span>}
              />
            </div>
          ))}
          <div className="comic-poster-characters">
            <ComicArt file="kids-hero.png" className="comic-kids-hero" />
            <ComicArt
              file="open-book.png"
              className="comic-poster-book"
              fallback={<div className="comic-open-book"><i /><i /></div>}
            />
          </div>
        </div>
        <a href={quizUrl} className="comic-poster-link comic-card">
          <span className="comic-display comic-poster-cta-title">Jom Sertai Cabaran!</span>
          <span className="comic-poster-cta-text">
            Jawab seberapa banyak soalan dalam <strong>2 minit</strong> dan kumpul mata tertinggi!
          </span>
          <span className="comic-poster-prize">🏆 Hadiah menarik menanti {prizeTop} juara teratas!</span>
          <span className="comic-poster-cta-button">Datang &amp; Main Sekarang →</span>
        </a>
        <div className="comic-card comic-poster-details">
          <p className="comic-poster-age">Terbuka kepada semua peringkat umur · Percuma!</p>
          {(label || dates) && <p className="comic-event">{[label, dates].filter(Boolean).join(' · ')}</p>}
        </div>
      </article>
    </main>
  );
}
