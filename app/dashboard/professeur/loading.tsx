export default function ProfesseurLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-52 bg-neutral-200 rounded-lg animate-pulse" />
        <div className="h-4 w-36 bg-neutral-200 rounded-md animate-pulse" />
      </div>

      {/* Stat cards - Professeur: classes, matieres, notes, absences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["bg-indigo-100", "bg-violet-100", "bg-emerald-100"].map((color, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${color} animate-pulse`} />
              <div className="h-4 w-14 bg-neutral-200 rounded-md animate-pulse" />
            </div>
            <div className="h-7 w-16 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-3 w-28 bg-neutral-100 rounded-md animate-pulse" />
          </div>
        ))}
      </div>

      {/* Schedule + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Schedule skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-44 bg-neutral-200 rounded-md animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50"
              >
                <div className="h-10 w-16 bg-indigo-100 rounded-lg animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-3.5 bg-neutral-200 rounded-md animate-pulse"
                    style={{ width: `${60 - i * 6}%` }}
                  />
                  <div className="h-3 w-24 bg-neutral-200 rounded-md animate-pulse" />
                </div>
                <div className="h-6 w-14 bg-neutral-200 rounded-full animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <div className="h-5 w-32 bg-neutral-200 rounded-md animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-11 bg-neutral-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton - notes list */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="h-5 w-40 bg-neutral-200 rounded-md animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-28 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-indigo-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-neutral-200 animate-pulse shrink-0" />
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
              <div className="h-5 w-12 bg-neutral-200 rounded-md animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
