'use client';

import { useTransition } from 'react';
import { flashAdmin } from './flash';

// Generic show/hide pill. `action` is a server action pre-bound with the id,
// taking the next active state.
export default function HideToggle({
  active,
  action,
}: {
  active: boolean;
  action: (next: boolean) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await action(!active); flashAdmin(!active ? 'Now visible' : 'Now hidden'); })}
      className={`font-mono text-[9px] uppercase tracking-wide px-2.5 py-1 border transition-colors disabled:opacity-50 ${
        active
          ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10'
          : 'border-ink/15 text-ink/40 hover:text-ink hover:border-ink/30'
      }`}
    >
      {pending ? '…' : active ? 'Visible' : 'Hidden'}
    </button>
  );
}
