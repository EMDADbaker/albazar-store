'use client';

import { useEffect, useState, useTransition } from 'react';
import { setDropPublished } from '@/app/admin/actions';
import { flashAdmin } from './flash';

export default function PublishToggle({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [on, setOn] = useState(published);
  const [pending, start] = useTransition();
  useEffect(() => setOn(published), [published]);

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    start(async () => {
      try {
        await setDropPublished(id, next);
        flashAdmin(next ? 'Published' : 'Set to draft');
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
      {on ? 'Published' : 'Draft'}
    </button>
  );
}
