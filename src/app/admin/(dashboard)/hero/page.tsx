import { prisma } from '@/lib/prisma';
import { createHeroSlide, deleteHeroSlide } from '@/app/admin/actions';
import HeroSlideToggle from '@/components/admin/HeroSlideToggle';
import DeleteButton from '@/components/admin/DeleteButton';
import ImageUpload from '@/components/admin/ImageUpload';

export const dynamic = 'force-dynamic';

const input =
  'w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50 transition-colors';

export default async function HeroAdmin() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Hero slides</h1>
      <p className="font-mono text-[11px] text-white/60 mb-8">
        The homepage cover carousel — image, headline, and subtitle per slide.
        Active slides rotate every 6 seconds, ordered by sort.
      </p>

      {/* Create */}
      <details className="mb-10 group">
        <summary className="cursor-pointer list-none font-mono text-[11px] tracking-wide uppercase text-accent border border-accent/30 px-4 py-2.5 inline-flex items-center gap-2 hover:bg-accent/10 transition-colors">
          <span className="group-open:hidden">+ New slide</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>
        <form action={createHeroSlide} className="border border-white/12 p-5 mt-3 grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Lbl>Cover image</Lbl>
            <ImageUpload name="image" />
          </div>
          <div>
            <Lbl>Headline (EN)</Lbl>
            <input name="titleEn" required className={input} />
          </div>
          <div>
            <Lbl>Headline (AR)</Lbl>
            <input name="titleAr" required dir="rtl" className={input} />
          </div>
          <div>
            <Lbl>Subtitle (EN, optional)</Lbl>
            <input name="subtitleEn" className={input} />
          </div>
          <div>
            <Lbl>Subtitle (AR, optional)</Lbl>
            <input name="subtitleAr" dir="rtl" className={input} />
          </div>
          <div>
            <Lbl>Sort order</Lbl>
            <input name="sortOrder" type="number" defaultValue={slides.length} className={input} />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-accent text-bg font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
              Create slide
            </button>
          </div>
        </form>
      </details>

      {/* List */}
      <div className="space-y-3">
        {slides.length === 0 && (
          <p className="text-[13px] text-white/60">No slides — the homepage falls back to the default cover.</p>
        )}
        {slides.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center gap-4 border border-white/12 p-3"
          >
            <div
              className="w-20 h-14 bg-cover bg-center border border-white/15 shrink-0"
              style={{ backgroundImage: `url('${s.image}')` }}
            />
            <div className="flex-1 min-w-[180px]">
              <div className="text-[13px] font-medium">{s.titleEn}</div>
              <div className="font-mono text-[10px] text-white/60 mt-0.5 truncate">
                {s.titleAr} · {s.image} · sort {s.sortOrder}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeroSlideToggle id={s.id} active={s.active} />
              <DeleteButton action={deleteHeroSlide.bind(null, s.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">
      {children}
    </div>
  );
}
