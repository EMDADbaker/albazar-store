'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
  const t = useTranslations('Account');
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="font-mono text-[10px] uppercase tracking-wide text-coal/50 border border-coal/20 px-3 py-1.5 hover:bg-coal hover:text-paper transition-colors"
    >
      {t('logout')}
    </button>
  );
}
