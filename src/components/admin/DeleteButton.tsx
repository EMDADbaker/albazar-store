'use client';

import { useState, useTransition } from 'react';

// Two-step confirm delete. `action` is a server action pre-bound with the id.
export default function DeleteButton({
  action,
  label = 'Delete',
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  if (armed) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() => start(() => action())}
          className="font-mono text-[9px] uppercase tracking-wide text-red-300 border border-red-400/40 bg-red-500/10 px-2 py-1 hover:bg-red-500/20 disabled:opacity-50"
        >
          {pending ? '…' : 'Confirm'}
        </button>
        <button
          onClick={() => setArmed(false)}
          className="font-mono text-[9px] uppercase tracking-wide text-ink/40 hover:text-ink"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setArmed(true)}
      className="font-mono text-[9px] uppercase tracking-wide text-ink/40 border border-ink/15 px-2 py-1 hover:text-red-300 hover:border-red-400/40 transition-colors"
    >
      {label}
    </button>
  );
}
