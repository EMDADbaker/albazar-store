// Instant skeleton for category browse pages.
export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-paper text-coal animate-pulse">
      <div className="h-14 border-b border-coal/10" />
      <section className="px-5 sm:px-8 pt-12 pb-6 max-w-6xl mx-auto w-full space-y-3">
        <div className="h-3 w-20 bg-coal/10" />
        <div className="h-10 w-1/2 bg-coal/10" />
      </section>
      <section className="px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] bg-coal/[0.06]" />
              <div className="h-3 w-2/3 bg-coal/10" />
              <div className="h-3 w-1/3 bg-coal/[0.08]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
