'use client';

import { useState } from 'react';

export default function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ink/[0.08]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-start"
        aria-expanded={open}
      >
        <span className="font-mono text-[11px] tracking-label uppercase text-ink/80">
          {title}
        </span>
        <span className="font-mono text-[16px] text-ink/50 leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="pb-5 text-[13px] text-ink/55 leading-relaxed space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
