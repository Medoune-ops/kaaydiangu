export default function EleveLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-44 bg-neutral-200 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-neutral-200 rounded-md animate-pulse" />
      </div>

      {/* Stat cards - Eleve: moyenne, absences, paiements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["bg-indigo-100", "bg-amber-100", "bg-emerald-100"].map((color, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${color} animate-pulse`} />
              <div className="h-4 w-14 bg-neutral-200 rounded-md animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-3 w-24 bg-neutral-100 rounded-md animate-pulse" />
          </div>
        ))}
      </div>

      {/* Two columns: notes + paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Notes recentes */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"
              >
                <div className="space-y-1.5">
                  <div
                    className="h-3.5 bg-neutral-200 rounded-md animate-pulse"
                    style={{ width: `${110 - i * 15}px` }}
                  />
                  <div className="h-3 w-20 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="h-7 w-12 bg-indigo-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Paiements */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-32 bg-neutral-200 rounded-md animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"
              >
                <div className="space-y-1.5">
                  <div
                    className="h-3.5 bg-neutral-200 rounded-md animate-pulse"
                    style={{ width: `${90 - i * 10}px` }}
                  />
                  <div className="h-3 w-16 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-emerald-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cours / Documents table skeleton */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
        </div>
        <div className="divide-y divide-neutral-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-100 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-4 bg-neutral-200 rounded-md animate-pulse"
                  style={{ width: `${55 - i * 6}%` }}
                />
                <div
                  className="h-3 bg-neutral-100 rounded-md animate-pulse"
                  style={{ width: `${35 - i * 4}%` }}
                />
              </div>
              <div className="h-8 w-24 bg-neutral-200 rounded-lg animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
