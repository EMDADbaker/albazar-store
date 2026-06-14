import { useTranslations } from 'next-intl';

const PAYMENTS = ['Mada', 'Visa', 'Mastercard', 'Apple Pay', 'STC Pay', 'Tabby', 'Tamara'];

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-bg text-ink border-t border-ink/[0.06] px-6 pt-[30px] pb-[22px]">
      <div className="flex justify-between items-start gap-6 flex-wrap">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/albazar-logo.png" alt="ALBAZAR" className="h-9 w-[200px] object-cover invert mb-3" />
          <div className="font-mono text-[9px] text-ink/20 leading-[2] tracking-[0.04em]">
            {t('verified')}
            <br />
            {t('vatNumber')} · {t('crNumber')}
          </div>
          <div className="inline-flex items-center gap-1.5 border border-accent/25 px-[11px] py-[5px] rounded-sm mt-2.5">
            <span className="font-mono text-[8px] tracking-[0.1em] text-accent/70">
              {t('muthooq')}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap justify-end max-w-[280px]">
          {PAYMENTS.map((p) => (
            <div
              key={p}
              className="border border-ink/[0.12] px-[9px] py-1 font-mono text-[8px] tracking-[0.08em] text-ink/40 rounded-sm"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
