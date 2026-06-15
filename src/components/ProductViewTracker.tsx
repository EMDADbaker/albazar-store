'use client';

import { useEffect } from 'react';

// Fire-and-forget product-view event for personalization. Deferred to idle and
// sent via sendBeacon so it never competes with rendering or blocks unload.
export default function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const send = () => {
      const body = JSON.stringify({ type: 'view', productId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };
    // Optional — not all browsers (e.g. older Safari) implement idle callbacks.
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const ric = w.requestIdleCallback;
    const id = ric ? ric(send) : window.setTimeout(send, 200);
    return () => {
      if (ric) w.cancelIdleCallback?.(id);
      else clearTimeout(id);
    };
  }, [productId]);
  return null;
}
