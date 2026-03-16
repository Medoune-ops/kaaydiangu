import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#030303] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Kaaydiangu</span>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              L&apos;excellence au service de l&apos;education.
              Former les leaders de demain.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-widest">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/a-propos" className="text-neutral-500 hover:text-emerald-400 transition-colors">A propos</Link></li>
              <li><Link href="/nos-classes" className="text-neutral-500 hover:text-emerald-400 transition-colors">Nos classes</Link></li>
              <li><Link href="/revisions" className="text-neutral-500 hover:text-emerald-400 transition-colors">Revisions</Link></li>
              <li><Link href="/actualites" className="text-neutral-500 hover:text-emerald-400 transition-colors">Actualites</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3 text-neutral-500">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500/50"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/></svg>
                Dakar, Senegal
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500/50"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +221 77 000 00 00
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500/50"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                contact@kaaydiangu.sn
              </li>
            </ul>
          </div>

          {/* Acces */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-widest">Acces rapide</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-neutral-500 hover:text-emerald-400 transition-colors">Espace eleve</Link></li>
              <li><Link href="/login" className="text-neutral-500 hover:text-emerald-400 transition-colors">Espace professeur</Link></li>
              <li><Link href="/contact" className="text-neutral-500 hover:text-emerald-400 transition-colors">Nous contacter</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} Kaaydiangu. Tous droits reserves.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-sm text-neutral-600">Propulse par</span>
            <span className="text-sm font-semibold text-emerald-500">Kaaydiangu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
