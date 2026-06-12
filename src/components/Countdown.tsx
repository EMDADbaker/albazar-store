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
  const [remaining, setRemaining] = useState(() => launchAtMs - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(launchAtMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [launchAtMs]);

  let s = Math.max(0, Math.floor(remaining / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;

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
          <div className="font-mono text-[30px] text-ink leading-none tabular-nums">
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
