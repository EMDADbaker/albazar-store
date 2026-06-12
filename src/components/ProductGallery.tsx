'use client';

import { useState } from 'react';

// Urbn-Lot style gallery: large main image + thumbnail strip, click to swap.
export default function ProductGallery({
  images,
  name,
  badge,
}: {
  images: string[];
  name: string;
  badge?: string;
}) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div className="md:sticky md:top-6 h-fit">
      <div className="relative aspect-square bg-ink/[0.035] border border-ink/[0.06] overflow-hidden">
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[active]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[55%] h-[60%] bg-ink/[0.05] border border-ink/[0.08]" />
          </div>
        )}
        {badge && (
          <div className="absolute top-3 ltr:left-3 rtl:right-3 font-mono text-[9px] tracking-wide uppercase text-bg bg-accent px-2.5 py-1">
            {badge}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden border transition-colors ${
                i === active ? 'border-accent' : 'border-ink/[0.1] hover:border-ink/30'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
