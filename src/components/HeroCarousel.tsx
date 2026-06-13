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
    <section className="relative px-6 h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
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
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="group px-2 py-3"
            >
              <span
                className={`block h-[3px] transition-all ${
                  idx === i ? 'w-9 bg-accent' : 'w-4 bg-ink/30 group-hover:bg-ink/60'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
