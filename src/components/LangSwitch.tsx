'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function LangSwitch() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === 'ar' ? 'en' : 'ar';

  function switchTo(lang: 'ar' | 'en') {
    // Persist the choice so the middleware keeps it on every later navigation
    // (incl. no-prefix default-locale paths) — language stays constant.
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; samesite=lax`;
    router.replace(pathname, { locale: lang });
  }

  return (
    <button
      onClick={() => switchTo(next)}
      className="font-mono text-[10px] text-accent/85 border border-accent/30 w-[52px] py-1 text-center rounded-sm transition-colors hover:bg-accent/10"
      aria-label="Switch language"
    >
      {t('switchTo')}
    </button>
  );
}
