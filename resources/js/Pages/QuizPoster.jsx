import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

// ---------- batik ----------
// Kawung batik tile, drawn as an inline SVG so no extra image file is needed.
const batikTile = (stroke, dot) => `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
<g fill="none" stroke="${stroke}" stroke-width="1.3">
<ellipse cx="40" cy="20" rx="9" ry="18"/><ellipse cx="40" cy="60" rx="9" ry="18"/>
<ellipse cx="20" cy="40" rx="18" ry="9"/><ellipse cx="60" cy="40" rx="18" ry="9"/>
<circle cx="40" cy="40" r="3.5"/></g>
<g fill="${dot}"><circle cx="0" cy="0" r="2.2"/><circle cx="80" cy="0" r="2.2"/><circle cx="0" cy="80" r="2.2"/><circle cx="80" cy="80" r="2.2"/></g>
</svg>`;
const toUrl = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const BATIK_GOLD = toUrl(batikTile('rgba(252,211,77,.35)', 'rgba(45,212,191,.4)'));

const DISPLAY_FONT = "Georgia, 'Times New Roman', serif";

const GOLD_TEXT = 'bg-gradient-to-b from-[#fff3b0] via-[#f5c542] to-[#b8780a] bg-clip-text text-transparent';
const GOLD_BUTTON = 'bg-gradient-to-b from-[#fff0a8] via-[#f5c542] to-[#c98a0a]';

// ---------- deterministic decoration ----------
const seeded = (seed) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const rnd = seeded(5);
const DUST = Array.from({ length: 34 }, () => ({ left: rnd() * 100, top: rnd() * 100, size: 2 + rnd() * 4, delay: rnd() * 5, dur: 2 + rnd() * 3 }));

const RISING = [
  { char: '?', left: '22%', delay: 0, size: 40, color: '#fcd34d' },
  { char: '★', left: '32%', delay: 1.1, size: 28, color: '#fde68a' },
  { char: 'A', left: '43%', delay: 2.2, size: 34, color: '#fff3b0' },
  { char: '?', left: '54%', delay: 0.6, size: 46, color: '#fcd34d' },
  { char: '✦', left: '64%', delay: 1.7, size: 26, color: '#fde68a' },
  { char: '1+1', left: '72%', delay: 2.8, size: 24, color: '#ffffff' },
  { char: '★', left: '48%', delay: 3.3, size: 22, color: '#fcd34d' },
];

// ---------- helpers ----------
const formatDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
};

const eventDates = (start, end) => {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return `Mulai ${formatDate(start)}`;
  if (end) return `Sehingga ${formatDate(end)}`;
  return null;
};

// A layer that shifts with the pointer; larger depth = moves more = looks closer.
const Layer = ({ x, y, depth, className = '', style, children }) => {
  const tx = useTransform(x, [-1, 1], [-depth, depth]);
  const ty = useTransform(y, [-1, 1], [-depth / 2, depth / 2]);
  return <motion.div style={{ x: tx, y: ty, ...style }} className={className}>{children}</motion.div>;
};

// ---------- backdrop ----------
const Backdrop = ({ image, reduced, x, y }) => {
  const bx = useTransform(x, [-1, 1], [3, -3]);
  const by = useTransform(y, [-1, 1], [3, -3]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#795039] via-[#9b6849] to-[#68422e]" />
      {image ? (
        <motion.img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-fill"
          style={{ x: bx, y: by, scale: 1.025 }}
          animate={reduced ? undefined : { scale: [1.025, 1.05, 1.025] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <motion.div
          className="absolute inset-0"
          style={{ backgroundImage: BATIK_GOLD, backgroundSize: '80px 80px' }}
          animate={reduced ? undefined : { backgroundPosition: ['0px 0px', '80px 80px'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(121,80,57,0)_30%,rgba(58,31,20,.26)_100%)]" />

      {/* golden light fanning out behind the devices */}
      <div className="absolute left-0 right-0 top-[58%] flex h-0 items-center justify-center">
        <motion.div
          className="h-[150vmax] w-[150vmax] shrink-0"
          style={{
            background: 'repeating-conic-gradient(from 0deg, rgba(252,211,77,.08) 0deg 5deg, transparent 5deg 16deg)',
            WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 30%)',
            maskImage: 'radial-gradient(circle, #000 0%, transparent 30%)',
          }}
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* gold dust */}
      {DUST.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-amber-200"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, boxShadow: '0 0 10px 2px rgba(253,230,138,.8)' }}
          animate={reduced ? { opacity: 0.5 } : { opacity: [0.1, 1, 0.1], scale: [0.6, 1.4, 0.6], y: [0, -14, 0] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

// ---------- arched title ----------
const ArchTitle = ({ reduced }) => {
  const arcA = 'M 70 225 Q 450 70 830 225';
  const arcB = 'M 70 225 Q 450 98 830 225';
  const layer = (props, content, ref) => (
    <text textAnchor="middle" strokeLinejoin="round" {...props}>
      <textPath href={ref} startOffset="50%">{content}</textPath>
    </text>
  );
  const title = { fontFamily: DISPLAY_FONT, fontSize: 115, fontWeight: 700, letterSpacing: 2 };

  return (
    <motion.svg
      viewBox="0 -20 900 275"
      role="img"
      aria-label="Quiz Arena"
      className="mx-auto w-full max-w-[34rem] overflow-visible sm:max-w-[38rem] xl:max-w-[clamp(40rem,65vh,54rem)]"
      initial={reduced ? false : { opacity: 0, scale: 0.7, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 130, damping: 12, delay: 0.2 }}
    >
      <defs>
        <motion.path
          id="qa-arc-1"
          d={arcA}
          fill="none"
          animate={reduced ? undefined : { d: [arcA, arcB, arcA] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <linearGradient id="qa-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7c2" />
          <stop offset=".45" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#b8780a" />
        </linearGradient>
        <filter id="qa-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g aria-hidden="true">
        <g filter="url(#qa-glow)" opacity=".55">
          {layer({ ...title, fill: '#f5c542', stroke: '#f5c542', strokeWidth: 10 }, 'QUIZ ARENA', '#qa-arc-1')}
        </g>
        {layer({ ...title, fill: '#4a2704', stroke: '#4a2704', strokeWidth: 26, transform: 'translate(0 9)' }, 'QUIZ ARENA', '#qa-arc-1')}
        {layer({ ...title, fill: '#9a5d08', stroke: '#9a5d08', strokeWidth: 20 }, 'QUIZ ARENA', '#qa-arc-1')}
        {layer({ ...title, fill: 'url(#qa-gold)' }, 'QUIZ ARENA', '#qa-arc-1')}

      </g>
    </motion.svg>
  );
};

// ---------- book ----------
const PracticeDevices = () => (
  <div className="relative aspect-[2.35/1] w-[22rem] max-w-[94vw] text-left text-[clamp(8px,1.5vw,15px)] leading-tight text-stone-900 sm:w-[36rem] xl:w-[clamp(39rem,68vh,55rem)]">
    <div className="absolute bottom-[7%] left-[1%] z-10 aspect-[4/5] w-[26%] -rotate-6 rounded-[12%] border border-amber-200/70 bg-slate-900 p-[1%] shadow-xl">
      <div className="flex h-full flex-col gap-1.5 overflow-hidden rounded-[9%] bg-[#fff7e9] p-[7%]">
        <strong className="text-amber-900">Soalan Subjektif</strong>
        <img src="/images/subjective_question.png" alt="" className="min-h-0 w-full flex-1 rounded bg-white object-contain" draggable="false" />
        <span className="rounded border border-amber-200 bg-white px-1.5 py-1 text-stone-800">Tulis jawapan anda…</span>
      </div>
    </div>

    <div className="absolute bottom-[7%] left-[21%] w-[58%]">
      <div className="aspect-[16/10] rounded-t-[5%] border border-amber-100/60 bg-slate-900 p-[2.5%] shadow-xl">
        <div className="relative h-full overflow-hidden rounded-[4%] bg-stone-100">
          <img src="/images/poster/praktis-login.jpg" alt="Halaman log masuk PTRS Praktis" className="h-full w-full object-contain" draggable="false" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute left-1/2 top-full h-[6%] w-[115%] -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-slate-100 via-slate-400 to-slate-800" />
    </div>

    <div className="absolute bottom-0 right-[1%] z-10 aspect-[5/9] w-[21%] rotate-6 rounded-[17%] border border-amber-100/70 bg-slate-900 p-[0.85%] shadow-xl">
      <div className="flex h-full flex-col justify-center gap-[4%] overflow-hidden rounded-[14%] bg-[#fff7e9] p-[9%]">
        <strong className="text-amber-900">Soalan Objektif</strong>
        <p className="font-semibold">Berapakah 8 × 7?</p>
        {['A · 48', 'B · 54', 'C · 56', 'D · 64'].map((answer) => (
          <span key={answer} className="rounded border border-amber-200 bg-white px-[6%] py-[3%]">{answer}</span>
        ))}
      </div>
    </div>
  </div>
);

// ---------- floating props ----------
// A glowing prop with a golden swirl that keeps flowing around it.
const Swirl = ({ reduced, flip }) => (
  <svg viewBox="0 0 220 140" aria-hidden="true" className={`pointer-events-none absolute left-1/2 top-1/2 h-28 w-44 -translate-x-1/2 -translate-y-1/2 sm:h-40 sm:w-60 ${flip ? '-scale-x-100' : ''}`}>
    <defs>
      <linearGradient id={`swirl-${flip ? 'r' : 'l'}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fcd34d" stopOpacity="0" />
        <stop offset="1" stopColor="#fff3b0" />
      </linearGradient>
    </defs>
    {['M10 118 C 30 20 170 0 205 62', 'M24 128 C 50 44 160 26 198 82'].map((d, i) => (
      <motion.path
        key={d}
        d={d}
        fill="none"
        stroke={`url(#swirl-${flip ? 'r' : 'l'})`}
        strokeWidth={i ? 2 : 3.5}
        strokeLinecap="round"
        strokeDasharray="70 190"
        initial={{ strokeDashoffset: 0 }}
        animate={reduced ? undefined : { strokeDashoffset: [0, -260] }}
        transition={{ duration: 3.4 + i, repeat: Infinity, ease: 'linear' }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(252,211,77,.9))' }}
      />
    ))}
  </svg>
);

const GoldBadge = ({ children, reduced }) => (
  <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border-2 border-amber-300 bg-[#63402d]/90 px-6 py-2.5 text-sm font-black uppercase tracking-wide text-amber-200 shadow-[0_0_26px_rgba(252,211,77,.35)] sm:whitespace-nowrap sm:px-7 sm:py-3 sm:text-base">
    {children}
    {!reduced && (
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 w-1/5 -skew-x-12 bg-amber-200/35"
        initial={{ left: '-25%' }}
        animate={{ left: '125%' }}
        transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
      />
    )}
  </span>
);

// Gold pucuk rebung (bamboo-shoot) triangles along the bottom edge.
const RebungBorder = ({ reduced }) => (
  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-9 overflow-hidden sm:h-11">
    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
    <svg width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id="rebung" width="56" height="44" patternUnits="userSpaceOnUse">
          <path d="M0 44 L28 4 L56 44Z" fill="#f5c542" />
          <path d="M14 44 L28 18 L42 44Z" fill="#825437" />
          <path d="M23 44 L28 32 L33 44Z" fill="#f5c542" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rebung)" />
    </svg>
    {!reduced && (
      <motion.div
        className="absolute inset-y-0 w-1/6 -skew-x-12 bg-white/40 blur-sm"
        initial={{ left: '-20%' }}
        animate={{ left: '120%' }}
        transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
      />
    )}
  </div>
);

const BURST_CHARS = ['⭐', '✨', '🎉', '✦', '🎊'];

// ---------- page ----------
const QuizPoster = ({
  label = '',
  startDate = null,
  endDate = null,
  prizeTop = 10,
  quizUrl = '/quiz-page',
  assets = { backdrop: null, kids: null },
}) => {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 16 });
  const sy = useSpring(my, { stiffness: 70, damping: 16 });
  const rotateY = useTransform(sx, [-1, 1], [-8, 8]);
  const rotateX = useTransform(sy, [-1, 1], [6, -6]);
  const dates = eventDates(startDate, endDate);
  const [bursts, setBursts] = useState([]);

  const pointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top, rect };
  };

  const handleMove = (e) => {
    if (reduced || e.pointerType === 'touch') return;
    const { px, py, rect } = pointer(e);
    mx.set((px / rect.width - 0.5) * 2);
    my.set((py / rect.height - 0.5) * 2);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  // Tap or click the stage for a little burst of stars and confetti.
  const handleBurst = (e) => {
    if (reduced) return;
    const { px, py } = pointer(e);
    const id = `${Date.now()}-${Math.round(px)}`;
    setBursts((list) => [...list.slice(-4), { id, x: px, y: py }]);
    setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 1100);
  };

  return (
    <>
      <Head title="Quiz Arena">
        <meta name="description" content="Jom jawab kuiz dalam 2 minit dan rebut hadiah menarik di Quiz Arena!" />
      </Head>

      <main className="relative min-h-screen overflow-hidden bg-[#795039] text-white">
        <Backdrop image={assets?.backdrop} reduced={reduced} x={sx} y={sy} />

        <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 pb-16 pt-5 text-center sm:pb-20 sm:pt-6 xl:max-w-6xl xl:justify-center xl:pb-12 xl:pt-8 2xl:max-w-[94rem]">
          <ArchTitle reduced={reduced} />

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mx-auto -mt-1 max-w-3xl text-3xl font-bold leading-tight text-[#fff6dc] drop-shadow-[0_3px_9px_rgba(58,31,20,.95)] sm:text-5xl xl:max-w-none xl:text-[clamp(3rem,5.4vh,4.5rem)]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Jom Jawab, <span className="inline-block text-amber-300">Rebut Hadiah Menarik!</span>
          </motion.h1>

          {/* 3D stage */}
          <div
            className="relative mt-2 h-[19rem] w-full touch-manipulation sm:h-[21rem] xl:mt-4 xl:h-[clamp(26rem,46vh,38rem)]"
            style={{ perspective: 1200 }}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            onClick={handleBurst}
          >
            <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
              {/* glow under the devices */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center" aria-hidden="true">
                <motion.div
                  className="h-28 w-[88%] rounded-[50%] bg-amber-300/40 blur-3xl sm:h-36"
                  animate={reduced ? undefined : { opacity: [0.55, 1, 0.55], scaleX: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* glowing "?" and trophy with golden swirls */}
              <Layer x={sx} y={sy} depth={34} className="absolute left-[3%] top-[22%] sm:left-[9%] xl:left-[10%] 2xl:left-[14%]" style={{ z: 110 }}>
                <div className="relative flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
                  <Swirl reduced={reduced} />
                  <motion.span
                    className="relative text-6xl font-black text-amber-300 sm:text-8xl xl:text-9xl"
                    style={{ textShadow: '0 0 22px rgba(252,211,77,.95), 0 4px 0 #8a5a0b' }}
                    animate={reduced ? undefined : { y: [0, -12, 0], rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ?
                  </motion.span>
                </div>
              </Layer>
              <Layer x={sx} y={sy} depth={30} className="absolute right-[3%] top-[20%] sm:right-[9%] xl:right-[10%] 2xl:right-[14%]" style={{ z: 100 }}>
                <div className="relative flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
                  <Swirl reduced={reduced} flip />
                  <motion.span
                    className="relative text-6xl drop-shadow-[0_0_18px_rgba(252,211,77,.9)] sm:text-8xl xl:text-9xl"
                    animate={reduced ? undefined : { y: [0, -14, 0], rotate: [5, -5, 5], scale: [1, 1.08, 1] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden="true"
                  >
                    🏆
                  </motion.span>
                </div>
              </Layer>

              {/* children rising behind the devices */}
              <div className="absolute inset-x-0 bottom-[7.25rem] flex justify-center sm:bottom-[9rem] xl:bottom-[clamp(9.5rem,17vh,14rem)]">
                <Layer x={sx} y={sy} depth={10}>
                  <motion.div
                    style={{ transformOrigin: '50% 100%' }}
                    initial={reduced ? false : { y: 200, opacity: 0 }}
                    animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 110, damping: 12, delay: 0.7 }}
                  >
                    <motion.div
                      style={{ transformOrigin: '50% 100%' }}
                      animate={reduced ? undefined : { y: [0, -8, 0], scaleY: [1, 1.02, 1] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {assets?.kids ? (
                        <img
                          src={assets.kids}
                          alt="Kanak-kanak bersorak berpakaian batik"
                          className="block w-[20rem] max-w-[86vw] sm:w-[26rem] xl:w-[clamp(27rem,48vh,39rem)]"
                          style={{
                            filter: 'drop-shadow(0 0 16px rgba(252,211,77,.35)) drop-shadow(0 12px 16px rgba(58,31,20,.5))',
                            WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
                            maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
                          }}
                          draggable="false"
                        />
                      ) : (
                        <div className="w-[15rem] overflow-hidden sm:w-[20rem]" style={{ aspectRatio: '1408 / 540' }}>
                          <img src="/images/child_celeb.png" alt="Kanak-kanak bersorak memegang trofi" className="block w-full drop-shadow-[0_12px_18px_rgba(58,31,20,.5)]" draggable="false" />
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </Layer>
              </div>

              <Layer
                x={sx}
                y={sy}
                depth={22}
                className="absolute inset-x-0 bottom-0 flex justify-center"
                style={{ z: 44, transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  initial={reduced ? false : { scale: 0.4, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 13, delay: 0.5 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    style={{ filter: 'drop-shadow(0 0 18px rgba(252,211,77,.3))' }}
                    animate={reduced ? undefined : { y: [0, -10, 0], rotateX: [0, 5, 0], rotateY: [-3, 3, -3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  >
                    <PracticeDevices />
                  </motion.div>
                </motion.div>
              </Layer>

              {/* sparks rising around the devices */}
              <div className="pointer-events-none absolute bottom-16 left-0 right-0 h-48 sm:bottom-20" style={{ transform: 'translateZ(60px)' }} aria-hidden="true">
                {RISING.map((item, i) => (
                  <motion.span
                    key={i}
                    className="absolute bottom-0 font-black"
                    style={{ left: item.left, fontSize: item.size, color: item.color, textShadow: '0 0 14px currentColor' }}
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={reduced ? { opacity: 0.8 } : { opacity: [0, 1, 1, 0], y: [0, -90, -170, -250], scale: [0.5, 1, 1.15, 0.9], rotate: [0, -12, 10, -6] }}
                    transition={{ duration: 4.2, delay: item.delay, repeat: Infinity, ease: 'easeOut' }}
                  >
                    {item.char}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* tap bursts */}
            {bursts.map((burst) => (
              <div key={burst.id} className="pointer-events-none absolute" style={{ left: burst.x, top: burst.y }} aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => {
                  const angle = (i / 10) * Math.PI * 2;
                  const dist = 70 + (i % 3) * 24;
                  return (
                    <motion.span
                      key={i}
                      className="absolute -ml-3 -mt-3 text-xl"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 20, opacity: 0, scale: 0.4, rotate: 200 }}
                      transition={{ duration: 0.95, ease: 'easeOut' }}
                    >
                      {BURST_CHARS[i % BURST_CHARS.length]}
                    </motion.span>
                  );
                })}
              </div>
            ))}
          </div>

          {/* call to action */}
          <motion.div
            className="mt-2"
            initial={reduced ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.4, type: 'tween', ease: 'backOut' }}
          >
            <motion.a
              href={quizUrl}
              style={{ fontFamily: DISPLAY_FONT }}
              whileHover={reduced ? undefined : { scale: 1.06, y: -3 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              animate={reduced ? undefined : { boxShadow: ['0 7px 0 #8a5a0b, 0 0 0 0 rgba(252,211,77,.65)', '0 7px 0 #8a5a0b, 0 0 0 26px rgba(252,211,77,0)'] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl border-2 border-[#fff3b0] px-7 py-4 text-xl font-bold uppercase tracking-wide text-[#4d2e20] shadow-[0_7px_0_#8a5a0b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-w-[30rem] sm:px-14 sm:py-5 sm:text-4xl xl:min-w-[36rem] xl:text-[clamp(2.25rem,3.6vh,3rem)] ${GOLD_BUTTON}`}
            >
              Jom Jawab Kuiz!
              {!reduced && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-y-0 w-1/5 -skew-x-12 bg-white/70"
                  initial={{ left: '-25%' }}
                  animate={{ left: '125%' }}
                  transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                />
              )}
            </motion.a>
          </motion.div>

          <p className="mt-4 text-sm font-semibold text-[#fff4d1] sm:text-base xl:text-lg">
            Jawab sebanyak mungkin dalam <strong className="text-amber-300">2 minit</strong>.
          </p>

          <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <GoldBadge reduced={reduced}>Hadiah untuk {prizeTop} peserta terbaik</GoldBadge>
            {(label || dates) && (
              <div className="rounded-xl border-2 border-amber-300/80 bg-[#63402d]/90 px-6 py-2 shadow-[0_0_0_4px_rgba(99,64,45,.9),0_0_0_5px_rgba(252,211,77,.4)] sm:px-8">
                {label && <p className="text-base font-black uppercase tracking-wide text-white sm:whitespace-nowrap">{label}</p>}
                {dates && <p className="mt-0.5 text-sm font-bold text-amber-300 sm:text-base">{dates}</p>}
              </div>
            )}
          </div>
        </div>

        <RebungBorder reduced={reduced} />
      </main>
    </>
  );
};

export default QuizPoster;
