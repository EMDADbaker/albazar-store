'use client';

import { useState, useTransition } from 'react';
import { setPaymentDisabled } from '@/app/admin/actions';
import { flashAdmin } from './flash';

type Method = { id: string; label: string };

// Toggle individual payment methods on/off, or all at once. Optimistic: the UI
// updates instantly and syncs in the background, reverting if the save fails.
export default function PaymentMethodsManager({
  methods,
  initialDisabled,
}: {
  methods: Method[];
  initialDisabled: string[];
}) {
  const [disabled, setDisabled] = useState<string[]>(initialDisabled);
  const [pending, start] = useTransition();

  function persist(next: string[], msg: string) {
    const prev = disabled;
    setDisabled(next); // optimistic
    start(async () => {
      try {
        await setPaymentDisabled(next);
        flashAdmin(msg);
      } catch {
        setDisabled(prev);
        flashAdmin('Could not save — reverted');
      }
    });
  }

  const toggle = (id: string, label: string) =>
    disabled.includes(id)
      ? persist(disabled.filter((x) => x !== id), `${label} enabled`)
      : persist([...disabled, id], `${label} disabled`);

  const activeCount = methods.filter((m) => !disabled.includes(m.id)).length;

  return (
    <div>
      {/* Bulk controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-wide text-white/45 me-2">
          {activeCount} of {methods.length} active
        </span>
        <button
          onClick={() => persist([], 'All methods enabled')}
          className="font-mono text-[10px] uppercase tracking-wide px-3 py-1.5 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 transition-colors"
        >
          Activate all
        </button>
        <button
          onClick={() => persist(methods.map((m) => m.id), 'All methods disabled')}
          className="font-mono text-[10px] uppercase tracking-wide px-3 py-1.5 border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors"
        >
          Deactivate all
        </button>
      </div>

      {/* Per-method rows */}
      <div className="border border-white/12 divide-y divide-white/[0.08]">
        {methods.map((m) => {
          const active = !disabled.includes(m.id);
          return (
            <div key={m.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-white/25'}`} />
                <span className="text-[13px]">{m.label}</span>
              </div>
              <button
                onClick={() => toggle(m.id, m.label)}
                className={`font-mono text-[9px] uppercase tracking-wide px-2.5 py-1 border transition-colors ${pending ? 'opacity-70' : ''} ${
                  active
                    ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10'
                    : 'border-white/15 text-white/40 hover:text-white hover:border-white/30'
                }`}
              >
                {active ? 'Active' : 'Off'}
              </button>
            </div>
          );
        })}
      </div>

      {activeCount === 0 && (
        <p className="font-mono text-[10px] text-red-300/80 mt-4">
          All payment methods are off — customers won&apos;t be able to pay.
        </p>
      )}
    </div>
  );
}
