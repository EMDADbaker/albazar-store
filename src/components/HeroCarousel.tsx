'use client';

import { useEffect, useState, type ReactNode } from 'react';

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

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n]);

  const current = slides[Math.min(i, n - 1)];

  return (
    <section className="relative px-6 min-h-[78vh] flex flex-col items-center justify-center text-center overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            idx === i ? 'opacity-[0.25]' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${s.image}')` }}
          aria-hidden
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/30 to-bg" aria-hidden />

      <div className="relative pt-8">
        <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-4">
          {eyebrow}
        </div>
        <h1 className="text-[clamp(36px,8vw,64px)] font-bold tracking-[-0.02em] leading-[0.98] mb-3 transition-opacity duration-500">
          {current?.title}
        </h1>
        {current?.subtitle && (
          <p className="text-[13px] text-ink/45 mb-10 max-w-md mx-auto">{current.subtitle}</p>
        )}
        {children}
      </div>

      {n > 1 && (
        <div className="relative mt-8 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1 transition-all ${
                idx === i ? 'w-7 bg-accent' : 'w-3 bg-ink/25 hover:bg-ink/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
