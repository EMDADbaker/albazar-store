'use client';

import { useState } from 'react';

// Light-theme collapsible (product detail accordions).
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
    <div className="border-b border-coal/15">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-start"
        aria-expanded={open}
      >
        <span className="font-mono text-[11px] tracking-label uppercase text-coal/80">
          {title}
        </span>
        <span className="font-mono text-[16px] text-coal/50 leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      {/* grid-rows 0fr→1fr animates height smoothly without a layout jump */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-[13px] text-coal/60 leading-relaxed space-y-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
