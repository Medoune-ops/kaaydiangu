export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-neutral-200 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-neutral-200 rounded-md animate-pulse" />
      </div>

      {/* Stat cards skeleton - Admin has 4 main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 animate-pulse" />
              <div className="h-4 w-14 bg-neutral-200 rounded-md animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-3 w-28 bg-neutral-100 rounded-md animate-pulse" />
          </div>
        ))}
      </div>

      {/* Two-column layout: chart + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart skeleton */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
          <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
        </div>

        {/* Activity list skeleton */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-40 bg-neutral-200 rounded-md animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-3.5 bg-neutral-200 rounded-md animate-pulse"
                    style={{ width: `${70 - i * 8}%` }}
                  />
                  <div className="h-3 w-20 bg-neutral-100 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="h-5 w-44 bg-neutral-200 rounded-md animate-pulse" />
          <div className="h-8 w-24 bg-indigo-100 rounded-lg animate-pulse" />
        </div>
        <div className="divide-y divide-neutral-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-neutral-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-4 bg-neutral-200 rounded-md animate-pulse"
                  style={{ width: `${55 - i * 5}%` }}
                />
                <div
                  className="h-3 bg-neutral-100 rounded-md animate-pulse"
                  style={{ width: `${35 - i * 3}%` }}
                />
              </div>
              <div className="h-6 w-16 bg-neutral-200 rounded-full animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
