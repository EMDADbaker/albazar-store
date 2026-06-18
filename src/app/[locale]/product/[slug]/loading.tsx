// Instant skeleton shown the moment a product link is tapped, while the route
// segment streams in. Mirrors the product layout so nothing jumps.
export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-paper text-coal animate-pulse">
      <div className="h-14 border-b border-coal/10" />
      <section className="px-5 sm:px-8 py-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-[4/5] bg-coal/[0.06]" />
        <div className="md:py-2 space-y-5">
          <div className="h-3 w-24 bg-coal/10" />
          <div className="h-8 w-3/4 bg-coal/10" />
          <div className="h-4 w-32 bg-coal/[0.08]" />
          <div className="h-7 w-28 bg-coal/10" />
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-12 h-12 bg-coal/[0.06]" />
            ))}
          </div>
          <div className="h-12 w-full bg-coal/10 mt-4" />
          <div className="h-10 w-full bg-coal/[0.06]" />
        </div>
      </section>
    </div>
  );
}
