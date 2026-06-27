'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@/i18n/routing';

export type Slide = {
  image: string;
  title: string;
  subtitle: string | null;
  href?: string; // when set, the slide shows an "Enter" CTA linking here
};

// Auto-advancing hero carousel: crossfading background images, per-slide
// copy, clickable dots. Countdown / scroll cue render below via children.
export default function HeroCarousel({
  slides,
  eyebrow,
  enterLabel,
  children,
}: {
  slides: Slide[];
  eyebrow: string;
  enterLabel?: string;
  children?: ReactNode;
}) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const sectionRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onScreen = useRef(true);

  const clearTimer = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }, []);

  // (Re)start the auto-advance countdown from zero. Calling this on a manual
  // press resets the 6s window so the slide never jumps again right after a tap.
  const startTimer = useCallback(() => {
    clearTimer();
    if (n <= 1 || !onScreen.current) return;
    timer.current = setInterval(() => setI((x) => (x + 1) % n), 6000);
  }, [n, clearTimer]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      startTimer();
      return clearTimer;
    }
    // Only advance while the hero is actually on screen.
    const obs = new IntersectionObserver(([e]) => {
      onScreen.current = e.isIntersecting;
      if (e.isIntersecting) startTimer();
      else clearTimer();
    });
    obs.observe(el);
    return () => { clearTimer(); obs.disconnect(); };
  }, [startTimer, clearTimer]);

  const current = slides[Math.min(i, n - 1)];
  const go = (dir: number) => {
    setI((x) => (x + dir + n) % n);
    startTimer(); // reset the countdown so a manual press gets a full interval
  };

  // Touch swipe (mobile): swipe left → next slide, swipe right → previous.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || n <= 1) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      ref={sectionRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative px-6 h-[100svh] min-h-[480px] flex flex-col items-center justify-center text-center overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === i ? 'opacity-100' : 'opacity-0'
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
      {/* Light scrim — just enough darkening so the centred copy stays readable
          while the slide image still shows through clearly. */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-bg/30 via-bg/20 to-bg/45" aria-hidden />

      <div className="relative z-10 pt-8 w-full max-w-2xl px-2">
        <div className="font-mono text-[10px] tracking-[0.4em] text-accent uppercase mb-4 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
          {eyebrow}
        </div>
        {/* Reserve constant space so varying slide copy never shifts the layout */}
        <div className="min-h-[150px] sm:min-h-[180px] flex flex-col items-center justify-center mb-6">
          <h1 className="text-[clamp(36px,8vw,64px)] font-bold tracking-[-0.02em] leading-[0.98] transition-opacity duration-500 drop-shadow-[0_2px_18px_rgba(0,0,0,0.8)]">
            {current?.title}
          </h1>
          <p className="text-[13px] text-ink/85 max-w-md mx-auto mt-3 min-h-[36px] transition-opacity duration-500 drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)]">
            {current?.subtitle || ' '}
          </p>
        </div>
        {/* Either the slide's CTA (edit/landing slides) OR the scroll cue —
            never both, so they can't crowd each other. Centered on its own row. */}
        <div className="flex justify-center">
          {current?.href && enterLabel ? (
            <Link
              href={current.href}
              className="inline-flex items-center gap-3 border border-ink/55 text-ink bg-transparent backdrop-blur-[1px] font-mono text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-ink hover:text-bg hover:border-ink transition-colors"
            >
              {enterLabel} <span aria-hidden>→</span>
            </Link>
          ) : (
            children
          )}
        </div>
      </div>

      {n > 1 && (
        <>
          {/* Stable, fixed-position prev/next arrows — the slide control */}
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 left-0 sm:left-1 z-10 w-12 h-20 flex items-center justify-center text-ink/55 hover:text-accent transition-colors drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-0 sm:right-1 z-10 w-12 h-20 flex items-center justify-center text-ink/55 hover:text-accent transition-colors drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
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
