'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const SEEN_KEY = 'albazar_entered';
const MAX_MS = 4000;

// Lightweight CSS/Framer entrance — no WebGL (Hard rule 9).
// First visit only; auto-skipped when a drop is live; always skippable.
export default function Entrance({ live }: { live: boolean }) {
  const t = useTranslations('Entrance');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (live) return; // never wall a buyer during a live drop
    const seen =
      typeof window !== 'undefined' && localStorage.getItem(SEEN_KEY);
    if (seen) return;
    setShow(true);
  }, [live]);

  useEffect(() => {
    if (!show) return;
    const dismiss = () => {
      localStorage.setItem(SEEN_KEY, '1');
      setShow(false);
    };
    const timer = setTimeout(dismiss, MAX_MS);
    const onAny = () => dismiss();
    // Skippable by any interaction within ~0.5s of appearing
    const armed = setTimeout(() => {
      window.addEventListener('scroll', onAny, { once: true, passive: true });
      window.addEventListener('keydown', onAny, { once: true });
      window.addEventListener('pointerdown', onAny, { once: true });
    }, 500);
    return () => {
      clearTimeout(timer);
      clearTimeout(armed);
      window.removeEventListener('scroll', onAny);
      window.removeEventListener('keydown', onAny);
      window.removeEventListener('pointerdown', onAny);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-end pb-14 cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onClick={() => {
            localStorage.setItem(SEEN_KEY, '1');
            setShow(false);
          }}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/img/campaign/desert-dune.jpg')" }}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.22, scale: 1 }}
            transition={{ duration: 3.5, ease: 'easeOut' }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-bg/70 via-transparent to-bg/90"
            aria-hidden
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
            transition={{
              opacity: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1.2, ease: 'easeOut' },
            }}
          >
            <span className="font-display font-bold text-[clamp(40px,12vw,120px)] tracking-[-0.02em] text-gold/90">
              ALBAZAR
            </span>
          </motion.div>

          <div className="relative z-10 text-center">
            <div className="font-mono text-[10px] tracking-[0.4em] text-gold/90 uppercase mb-3">
              {t('eyebrow')}
            </div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-ink/35 uppercase animate-hint">
              {t('hint')}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
