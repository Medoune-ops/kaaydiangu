export default function ComptableLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-52 bg-neutral-200 rounded-lg animate-pulse" />
        <div className="h-4 w-36 bg-neutral-200 rounded-md animate-pulse" />
      </div>

      {/* Financial stat cards - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["bg-emerald-100", "bg-indigo-100", "bg-amber-100", "bg-red-100"].map(
          (color, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-xl ${color} animate-pulse`} />
                <div className="h-4 w-16 bg-neutral-200 rounded-md animate-pulse" />
              </div>
              <div className="h-7 w-28 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-neutral-100 rounded-md animate-pulse" />
            </div>
          )
        )}
      </div>

      {/* Two sections: chart + recent payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 bg-neutral-200 rounded-md animate-pulse" />
            <div className="flex gap-2">
              <div className="h-7 w-16 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-7 w-16 bg-neutral-200 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="h-56 bg-neutral-100 rounded-xl animate-pulse" />
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"
              >
                <div className="space-y-1.5">
                  <div
                    className="h-3.5 bg-neutral-200 rounded-md animate-pulse"
                    style={{ width: `${100 - i * 10}px` }}
                  />
                  <div className="h-3 w-16 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-emerald-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments table skeleton */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="h-5 w-44 bg-neutral-200 rounded-md animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-32 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-8 w-28 bg-indigo-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-4 bg-neutral-200 rounded-md animate-pulse"
                  style={{ width: `${50 - i * 5}%` }}
                />
                <div
                  className="h-3 bg-neutral-100 rounded-md animate-pulse"
                  style={{ width: `${30 - i * 3}%` }}
                />
              </div>
              <div className="h-5 w-24 bg-neutral-200 rounded-md animate-pulse shrink-0" />
              <div className="h-6 w-16 bg-emerald-100 rounded-full animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
