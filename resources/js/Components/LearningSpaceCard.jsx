import { useEffect, useRef, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/Contexts/LanguageContext';

function NetworkBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        const points = Array.from({ length: 38 }, () => ({
            x: Math.random(), y: Math.random(),
            vx: (Math.random() - 0.5) * 0.000035,
            vy: (Math.random() - 0.5) * 0.000035,
        }));
        let width = 0, height = 0, frame = 0, previous = 0;
        let visible = true;
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

        const paint = (delta = 0) => {
            context.clearRect(0, 0, width, height);
            points.forEach(point => {
                point.x += point.vx * delta;
                point.y += point.vy * delta;
                if (point.x < 0 || point.x > 1) point.vx *= -1;
                if (point.y < 0 || point.y > 1) point.vy *= -1;
                point.x = Math.max(0, Math.min(1, point.x));
                point.y = Math.max(0, Math.min(1, point.y));
                context.beginPath();
                context.arc(point.x * width, point.y * height, 2, 0, Math.PI * 2);
                context.fillStyle = '#92b6f0';
                context.fill();
            });
            points.forEach((a, index) => points.slice(index + 1).forEach(b => {
                const distance = Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
                if (distance >= 155) return;
                context.strokeStyle = `rgba(139,174,235,${(1 - distance / 155) * 0.27})`;
                context.lineWidth = 0.8;
                context.beginPath();
                context.moveTo(a.x * width, a.y * height);
                context.lineTo(b.x * width, b.y * height);
                context.stroke();
            }));
        };
        const animate = time => {
            paint(previous ? Math.min(time - previous, 40) : 0);
            previous = time;
            frame = requestAnimationFrame(animate);
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            previous = 0;
            if (!preference.matches && visible && !document.hidden) {
                frame = requestAnimationFrame(animate);
            } else paint();
        };
        const resize = new ResizeObserver(() => {
            const bounds = canvas.getBoundingClientRect();
            width = bounds.width;
            height = bounds.height;
            const scale = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            context.setTransform(scale, 0, 0, scale, 0, 0);
            paint();
        });
        const intersection = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            sync();
        });
        resize.observe(canvas);
        intersection.observe(canvas);
        preference.addEventListener('change', sync);
        document.addEventListener('visibilitychange', sync);
        sync();
        return () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            intersection.disconnect();
            preference.removeEventListener('change', sync);
            document.removeEventListener('visibilitychange', sync);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.65]" />;
}

export default function LearningSpaceCard({ name, school, picture }) {
    const { t } = useLanguage();
    const [failedPicture, setFailedPicture] = useState(null);
    const pictureUrl = picture
        ? (/^(https?:\/\/|\/)/.test(picture) ? picture : `/storage/${picture}`)
        : null;

    return (
        <section className="relative isolate min-w-0 overflow-hidden rounded-3xl border border-slate-800 bg-[#080f22] p-5 text-white shadow-xl shadow-slate-200 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,#373070_0%,transparent_60%),radial-gradient(ellipse_at_20%_100%,#103b46_0%,transparent_60%)]" />
            <NetworkBackground />
            <div className="relative">
                <div className="mb-7 flex items-start justify-between gap-4">
                    <p className="flex items-center gap-2 text-[10px] font-semibold uppercase leading-5 tracking-[0.15em] text-indigo-200 sm:text-xs">
                        <SparklesIcon className="h-4 w-4 shrink-0" aria-hidden="true" />{t('learning_space')}
                    </p>
                </div>
                <article aria-label={t('student_profile')} className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-200 to-cyan-200 ring-4 ring-white/15">
                        <span className="flex h-full items-center justify-center text-4xl font-semibold text-slate-600" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
                        {pictureUrl && failedPicture !== pictureUrl && <img src={pictureUrl} alt={t('student_profile')} onError={() => setFailedPicture(pictureUrl)} className="absolute inset-0 h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                        <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">{name}</h1>
                        <p className="mt-3 break-words text-sm leading-6 text-slate-300">{school}</p>
                    </div>
                </article>
                <div className="mt-6 max-w-xl border-l-2 border-teal-200 pl-4">
                    <blockquote className="text-base leading-7 text-teal-50 sm:text-lg">“{t('learning_encouragement')}”</blockquote>
                    <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-teal-200">{t('learning_small_steps')}</p>
                </div>
            </div>
        </section>
    );
}
