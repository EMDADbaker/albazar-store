'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function LangSwitch() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      onClick={() => router.replace(pathname, { locale: next })}
      className="font-mono text-[10px] text-gold/85 border border-gold/30 px-2.5 py-1 rounded-sm transition-colors hover:bg-gold/10"
      aria-label="Switch language"
    >
      {t('switchTo')}
    </button>
  );
}
