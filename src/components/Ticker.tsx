import { useLocale, useTranslations } from 'next-intl';

export default function Ticker() {
  const t = useTranslations('Ticker');
  const locale = useLocale();
  const items = t.raw('items') as string[];
  // Duplicate the list so the -50% / +50% loop is seamless.
  const loop = [...items, ...items];

  return (
    <div className="border-y border-ink/[0.06] py-[9px] overflow-hidden whitespace-nowrap">
      <div
        className={`inline-flex gap-11 will-change-transform ${
          locale === 'ar' ? 'animate-ticker-rtl' : 'animate-ticker'
        }`}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="font-mono text-[10px] tracking-wide uppercase text-ink/45 inline-flex items-center gap-2.5"
          >
            <span className="w-[3px] h-[3px] rounded-full bg-accent/50 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
