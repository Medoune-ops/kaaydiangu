import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { EmploiDuTempsViewer } from "@/components/public/emploi-du-temps-viewer";

export const dynamic = "force-dynamic";

export default async function ClasseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const classe = await prisma.classe.findUnique({
    where: { id },
    include: {
      matieres: {
        include: {
          professeur: { select: { nom: true, prenom: true } },
        },
        orderBy: { nom: "asc" },
      },
      _count: { select: { eleves: true } },
    },
  });

  if (!classe) notFound();

  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique sombre                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#020c1b]">
        <div className="film-grain z-[1]" />
        <div className="absolute inset-0 dot-grid opacity-30 z-[3] pointer-events-none" />

        <div className="absolute top-[5%] right-[5%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[5%] -left-[5%] w-[400px] h-[400px] rounded-full bg-teal-500/[0.07] blur-[160px] animate-aurora-mid z-[2] pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%] z-[5]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full py-28">
          {/* Breadcrumb */}
          <Link
            href="/nos-classes"
            className="animate-slide-up inline-flex items-center gap-1.5 text-sm font-medium text-white/40 hover:text-cyan-300 transition-colors duration-200 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Toutes les classes
          </Link>

          <div className="animate-slide-up-delay-1 flex flex-wrap items-center gap-4 mt-2">
            <h1
              className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-shimmer">{classe.nom}</span>
            </h1>
            {classe.filiere && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold glass-dark border border-cyan-500/20 text-cyan-300 rounded-xl px-3.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {classe.filiere}
              </span>
            )}
          </div>

          {/* Stats de la classe */}
          <div className="animate-fade-in mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="text-white/50 text-[12px]">{classe._count.eleves} élève{classe._count.eleves > 1 ? "s" : ""}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
              <span className="text-white/50 text-[12px]">{classe.matieres.length} matière{classe.matieres.length > 1 ? "s" : ""}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span className="text-white/50 text-[12px]">{classe.niveau}</span>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  MATIÈRES — Section claire                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-white relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-400/[0.04] blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-12">
          <div className="mb-10 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Programme</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-1 h-10 rounded-full bg-gradient-to-b from-cyan-500 to-teal-500 shrink-0" />
              Matières enseignées
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classe.matieres.map((m, i) => (
              <div key={m.id} className={`gradient-border p-6 group hover:-translate-y-1 scroll-animate scroll-animate-delay-${(i % 3) + 1}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-neutral-900 text-[15px] group-hover:text-cyan-700 transition-colors duration-200">{m.nom}</h3>
                  <span className="shrink-0 text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1">
                    Coef. {m.coefficient}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/15 to-teal-500/10 border border-cyan-200/50 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <p className="text-neutral-500 text-[14px]">
                    {m.professeur
                      ? `${m.professeur.prenom} ${m.professeur.nom}`
                      : "Professeur non assigné"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  EMPLOI DU TEMPS — Section sombre                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#020c1b] relative overflow-hidden clip-angle-both section-lazy">
        <div className="absolute top-[5%] right-[8%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.08] blur-[170px] animate-aurora-slow pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />
        <div className="film-grain z-[1] opacity-40" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">
          <div className="mb-10 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border border-cyan-500/20 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <span className="text-sm font-semibold text-cyan-300 tracking-wide">Planning</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-1 h-10 rounded-full bg-gradient-to-b from-teal-400 to-cyan-400 shrink-0" />
              Emploi du temps
            </h2>
          </div>

          <div className="scroll-animate">
            <EmploiDuTempsViewer classeId={id} />
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[8%] right-[8%]" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  RETOUR + CTA — Section claire                        */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-white clip-angle-top relative overflow-hidden section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 flex flex-col sm:flex-row items-center justify-between gap-6 scroll-animate">
          <Link
            href="/nos-classes"
            className="inline-flex h-11 px-5 items-center font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Retour aux classes
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 px-6 items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl text-[15px] hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/25 transition-all duration-300"
          >
            Inscrire mon enfant dans cette classe
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
