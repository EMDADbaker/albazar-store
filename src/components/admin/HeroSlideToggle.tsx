'use client';

import { useTransition } from 'react';
import { toggleHeroSlide } from '@/app/admin/actions';

export default function HeroSlideToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => toggleHeroSlide(id, !active))}
      className={`font-mono text-[9px] uppercase tracking-wide px-2.5 py-1 border transition-colors disabled:opacity-50 ${
        active
          ? 'border-accent/40 text-accent bg-accent/10'
          : 'border-ink/15 text-ink/40 hover:text-ink hover:border-ink/30'
      }`}
    >
      {pending ? '…' : active ? 'Live' : 'Hidden'}
    </button>
  );
}
