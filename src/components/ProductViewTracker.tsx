'use client';

import { useEffect } from 'react';

// Fire-and-forget product-view event for personalization.
export default function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', productId }),
    }).catch(() => {});
  }, [productId]);
  return null;
}
