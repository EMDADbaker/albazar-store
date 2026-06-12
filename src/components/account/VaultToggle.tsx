'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { setVault } from '@/app/account/actions';

export default function VaultToggle({ optIn }: { optIn: boolean }) {
  const t = useTranslations('Account');
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 border border-coal/15 p-4">
      <p className="text-[13px] text-coal/70">{optIn ? t('vaultIn') : t('vaultOut')}</p>
      <button
        disabled={pending}
        onClick={() => start(() => setVault(!optIn))}
        className={`shrink-0 font-mono text-[10px] uppercase tracking-wide px-3 py-2 transition-colors disabled:opacity-50 ${
          optIn
            ? 'border border-coal/30 text-coal hover:bg-coal hover:text-paper'
            : 'bg-coal text-paper hover:opacity-90'
        }`}
      >
        {pending ? '…' : optIn ? t('vaultLeave') : t('vaultJoin')}
      </button>
    </div>
  );
}
