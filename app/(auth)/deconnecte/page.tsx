import Link from "next/link";

export default function DeconnectePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900">Vous êtes déconnecté</h1>
          <p className="text-sm text-neutral-500">À bientôt sur Mon École.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retour au site
          </Link>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Se reconnecter
          </Link>
        </div>
      </div>
    </div>
  );
}
