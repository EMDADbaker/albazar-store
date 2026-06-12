import { useTranslations } from 'next-intl';

// Placeholder teaser frame matching the design reference's classified-piece box.
// Swap the inner silhouette for the Cloudinary teaser image once uploaded.
export default function Teaser({ image }: { image?: string | null }) {
  const t = useTranslations('Countdown');

  return (
    <div className="mx-auto mb-10 w-[230px] aspect-[3/4] bg-ink/[0.035] border border-ink/[0.08] relative flex items-center justify-center overflow-hidden">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-[110px] h-[128px] bg-[#0d0d0d] border border-ink/10 relative">
          <div className="absolute -top-[18px] left-[27px] w-14 h-[18px] bg-[#0d0d0d] border border-ink/10 rounded-t-[28px]" />
        </div>
      )}
      <div className="absolute top-3 ltr:right-3 rtl:left-3 font-mono text-[9px] text-accent/70 tracking-[0.1em]">
        12 / 150
      </div>
      <div className="absolute bottom-3 font-mono text-[8px] tracking-[0.3em] text-ink/25 uppercase">
        {t('teaserTag')}
      </div>
    </div>
  );
}
