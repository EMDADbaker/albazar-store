'use client';

import { useEffect, useState, useTransition } from 'react';
import { toggleHeroSlide } from '@/app/admin/actions';
import { flashAdmin } from './flash';

export default function HeroSlideToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [on, setOn] = useState(active);
  const [pending, start] = useTransition();
  useEffect(() => setOn(active), [active]);

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    start(async () => {
      try {
        await toggleHeroSlide(id, next);
        flashAdmin(next ? 'Slide live' : 'Slide hidden');
      } catch {
        setOn(!next);
        flashAdmin('Could not save — reverted');
      }
    });
  }

  return (
    <button
      onClick={toggle}
      className={`font-mono text-[9px] uppercase tracking-wide px-2.5 py-1 border transition-colors ${
        pending ? 'opacity-70' : ''
      } ${
        on
          ? 'border-accent/40 text-accent bg-accent/10'
          : 'border-ink/15 text-ink/40 hover:text-ink hover:border-ink/30'
      }`}
    >
      {on ? 'Live' : 'Hidden'}
    </button>
  );
}
