'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

// launchAtMs is computed on the server and passed in — we only use the client
// clock for the visible tick, never as the source of truth for the target.
export default function Countdown({ launchAtMs }: { launchAtMs: number }) {
  const t = useTranslations('Countdown');
  // null until mounted, so SSR + first client render are identical ("00") and
  // there's no hydration mismatch from the ever-changing clock.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(launchAtMs - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [launchAtMs]);

  let d = 0;
  let h = 0;
  let m = 0;
  let s = 0;
  if (remaining !== null) {
    let rem = Math.max(0, Math.floor(remaining / 1000));
    d = Math.floor(rem / 86400);
    rem -= d * 86400;
    h = Math.floor(rem / 3600);
    rem -= h * 3600;
    m = Math.floor(rem / 60);
    s = rem - m * 60;
  }

  const cells = [
    { num: pad(d), label: t('days') },
    { num: pad(h), label: t('hours') },
    { num: pad(m), label: t('minutes') },
    { num: pad(s), label: t('seconds') },
  ];

  return (
    <div className="flex justify-center gap-2.5 mb-10 flex-wrap">
      {cells.map((c, i) => (
        <div
          key={i}
          className="bg-ink/[0.04] border border-ink/[0.09] w-[86px] pt-4 pb-3"
        >
          <div
            className="font-mono text-[30px] text-ink leading-none tabular-nums"
            suppressHydrationWarning
          >
            {c.num}
          </div>
          <div className="font-mono text-[8px] tracking-label uppercase text-accent/80 mt-2">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
