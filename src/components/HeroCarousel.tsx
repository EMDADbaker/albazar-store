'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type Slide = { image: string; title: string; subtitle: string | null };

// Auto-advancing hero carousel: crossfading background images, per-slide
// copy, clickable dots. Countdown / scroll cue render below via children.
export default function HeroCarousel({
  slides,
  eyebrow,
  children,
}: {
  slides: Slide[];
  eyebrow: string;
  children?: ReactNode;
}) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (n <= 1) return;
    const el = sectionRef.current;
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (!id) id = setInterval(() => setI((x) => (x + 1) % n), 6000); };
    const stop = () => { if (id) { clearInterval(id); id = null; } };
    // Only advance while the hero is actually on screen.
    if (!el || typeof IntersectionObserver === 'undefined') { start(); return stop; }
    const obs = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    obs.observe(el);
    return () => { stop(); obs.disconnect(); };
  }, [n]);

  const current = slides[Math.min(i, n - 1)];
  const go = (dir: number) => setI((x) => (x + dir + n) % n);

  return (
    <section ref={sectionRef} className="relative px-6 h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === i ? 'opacity-[0.25]' : 'opacity-0'
          }`}
          aria-hidden
        >
          <Image
            src={s.image}
            alt=""
            fill
            sizes="100vw"
            priority={idx === 0}
            className="object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/30 to-bg" aria-hidden />

      <div className="relative pt-8 w-full max-w-2xl px-2">
        <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-4">
          {eyebrow}
        </div>
        {/* Reserve constant space so varying slide copy never shifts the layout */}
        <div className="min-h-[150px] sm:min-h-[180px] flex flex-col items-center justify-center mb-6">
          <h1 className="text-[clamp(36px,8vw,64px)] font-bold tracking-[-0.02em] leading-[0.98] transition-opacity duration-500">
            {current?.title}
          </h1>
          <p className="text-[13px] text-ink/45 max-w-md mx-auto mt-3 min-h-[36px] transition-opacity duration-500">
            {current?.subtitle || ' '}
          </p>
        </div>
        {children}
      </div>

      {n > 1 && (
        <>
          {/* Stable, fixed-position prev/next arrows — the slide control */}
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-5 z-10 w-11 h-11 flex items-center justify-center border border-ink/20 bg-bg/40 backdrop-blur-sm text-ink/80 hover:bg-accent hover:text-bg hover:border-accent transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-5 z-10 w-11 h-11 flex items-center justify-center border border-ink/20 bg-bg/40 backdrop-blur-sm text-ink/80 hover:bg-accent hover:text-bg hover:border-accent transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Plain progress indicators (not interactive) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden>
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`block h-[3px] transition-all ${
                  idx === i ? 'w-9 bg-accent' : 'w-4 bg-ink/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
