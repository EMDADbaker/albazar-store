'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Only first-time visitors (and not during a live drop) ever load the Entrance
// overlay — so framer-motion's chunk is never fetched for returning visitors.
// `ssr: false` keeps the motion code out of the server/initial bundle entirely.
const Entrance = dynamic(() => import('./Entrance'), { ssr: false });

const SEEN_KEY = 'albazar_entered';

export default function EntranceGate({ live }: { live: boolean }) {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (live) return; // never wall a buyer during a live drop
    if (typeof window !== 'undefined' && !localStorage.getItem(SEEN_KEY)) {
      setMount(true);
    }
  }, [live]);

  if (!mount) return null;
  return <Entrance live={live} />;
}
