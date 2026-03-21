import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-neutral-900 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="text-cyan-400">IREF</span>
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed max-w-xs">
              Un etablissement d&apos;excellence dedie a la reussite
              de chaque eleve depuis plus de 15 ans.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-neutral-500 mb-5 uppercase tracking-[0.2em]">Pages</h3>
            <ul className="space-y-3.5">
              {[
                { href: "/a-propos", label: "A propos" },
                { href: "/nos-classes", label: "Nos classes" },
                { href: "/revisions", label: "Revisions" },
                { href: "/actualites", label: "Actualites" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-neutral-400 hover:text-cyan-400 hover:translate-x-0.5 transition-all duration-250 inline-block text-[15px]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-neutral-500 mb-5 uppercase tracking-[0.2em]">Acces</h3>
            <ul className="space-y-3.5">
              {[
                { href: "/login", label: "Espace eleve" },
                { href: "/login", label: "Espace prof" },
                { href: "/login", label: "Administration" },
                { href: "/contact", label: "Contact" },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-neutral-400 hover:text-cyan-400 hover:translate-x-0.5 transition-all duration-250 inline-block text-[15px]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-bold text-neutral-500 mb-5 uppercase tracking-[0.2em]">Contact</h3>
            <ul className="space-y-4 text-neutral-400 text-[15px]">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-cyan-400"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/></svg>
                </span>
                Dakar, Senegal
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-cyan-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                +221 77 000 00 00
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-cyan-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                contact@monecole.sn
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-600">&copy; {new Date().getFullYear()} IREF. Tous droits reserves.</p>
          <p className="text-sm text-neutral-600">Concu avec <span className="text-cyan-500">&hearts;</span> au Senegal</p>
        </div>
      </div>
    </footer>
  );
}
