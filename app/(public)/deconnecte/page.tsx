import Link from "next/link";

export const metadata = {
  title: "Déconnecté — Mon École",
};

export default function DeconnectePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020c1b] px-4 relative overflow-hidden">

      {/* Aurora blobs */}
      <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.12] blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-teal-400/[0.10] blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-xl shadow-2xl p-10 text-center">

          {/* Icône */}
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full scale-150" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/25 flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#iconGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </div>

          {/* Texte */}
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-xs font-medium text-teal-400 tracking-wide">Session terminée</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              À bientôt&nbsp;!
            </h1>
            <p className="text-white/45 text-[15px] leading-relaxed max-w-xs mx-auto">
              Vous avez été déconnecté avec succès. Votre session est fermée en toute sécurité.
            </p>
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10] text-white/70 text-sm font-medium hover:bg-white/[0.10] hover:text-white transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Retour au site
            </Link>
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#020c1b] text-sm font-bold hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Se reconnecter
            </Link>
          </div>
        </div>

        {/* Petit label bas */}
        <p className="text-center text-white/20 text-xs mt-6">
          IREF — Système de gestion scolaire
        </p>
      </div>
    </div>
  );
}
