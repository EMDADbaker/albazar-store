// Instant skeleton shown in the admin content area while a page's (live,
// session-gated) data loads — so navigating the panel feels immediate instead
// of a blank 3–5s wait on the remote DB. The header/nav stay from the layout.
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-white/10 mb-6" />

      {/* KPI / filter row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-white/10 p-4">
            <div className="h-2.5 w-20 bg-white/10 mb-3" />
            <div className="h-6 w-16 bg-white/10" />
          </div>
        ))}
      </div>

      {/* List rows */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-white/10 p-4 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-white/10" />
              <div className="h-2.5 w-1/2 bg-white/[0.07]" />
            </div>
            <div className="h-7 w-20 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
