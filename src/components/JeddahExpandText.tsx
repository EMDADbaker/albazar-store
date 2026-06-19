'use client';

import { useState } from 'react';

// Footer paragraph with a CSS-mask fade + chevron expand (the NY "read more"
// pattern), restyled for the monochrome theme.
export default function JeddahExpandText({
  text,
  expandLabel,
  collapseLabel,
}: {
  text: string;
  expandLabel: string;
  collapseLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const fade = 'linear-gradient(to bottom, black 35%, transparent 95%)';

  return (
    <div className="max-w-2xl mx-auto">
      <p
        className="text-[14px] text-ink/55 leading-relaxed overflow-hidden"
        style={{
          maxHeight: open ? 600 : 88,
          transition: 'max-height 0.8s ease-in-out',
          maskImage: open ? 'none' : fade,
          WebkitMaskImage: open ? 'none' : fade,
        }}
      >
        {text}
      </p>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 hover:text-accent transition-colors"
      >
        {open ? collapseLabel : expandLabel}
        <span className={`w-6 h-6 flex items-center justify-center rounded-full border border-ink/25 transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
