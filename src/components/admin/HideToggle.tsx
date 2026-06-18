'use client';

import { useEffect, useState, useTransition } from 'react';
import { flashAdmin } from './flash';

// Generic show/hide pill. `action` is a server action pre-bound with the id,
// taking the next active state. Optimistic: flips instantly, syncs in the
// background, reverts if the server rejects.
export default function HideToggle({
  active,
  action,
}: {
  active: boolean;
  action: (next: boolean) => Promise<void>;
}) {
  const [on, setOn] = useState(active);
  const [pending, start] = useTransition();
  useEffect(() => setOn(active), [active]);

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    start(async () => {
      try {
        await action(next);
        flashAdmin(next ? 'Now visible' : 'Now hidden');
      } catch {
        setOn(!next); // revert
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
          ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10'
          : 'border-ink/15 text-ink/40 hover:text-ink hover:border-ink/30'
      }`}
    >
      {on ? 'Visible' : 'Hidden'}
    </button>
  );
}
