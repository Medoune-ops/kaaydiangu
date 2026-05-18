import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { ClassesListe } from "@/components/public/classes-liste";

export const dynamic = "force-dynamic";

export default async function NosClassesPage() {
  const classes = await prisma.classe.findMany({
    include: {
      _count: { select: { eleves: true, matieres: true } },
    },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
  });

  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique sombre                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#020c1b]">
        <div className="film-grain z-[1]" />
        <div className="absolute inset-0 dot-grid opacity-30 z-[3] pointer-events-none" />

        <div className="absolute top-[5%] -right-[5%] w-[700px] h-[700px] rounded-full bg-cyan-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-teal-500/[0.07] blur-[160px] animate-aurora-mid z-[2] pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%] z-[5]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full text-center py-32">
          <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-dark border border-cyan-500/20 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide">Formation & parcours</span>
          </div>
          <h1
            className="animate-slide-up-delay-1 text-[clamp(2.6rem,5.5vw,4.2rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Nos <span className="text-shimmer">classes</span>
          </h1>
          <p className="animate-slide-up-delay-2 mt-5 text-[15px] text-white/50 leading-relaxed max-w-lg mx-auto">
            Découvrez l&apos;ensemble de nos classes et filières pour cette année scolaire{" "}
            {classes.length > 0 && (
              <span className="text-white/70 font-semibold">— {classes.length} classe{classes.length > 1 ? "s" : ""} disponible{classes.length > 1 ? "s" : ""}</span>
            )}.
          </p>
          {/* Navigation rapide */}
          <div className="animate-fade-in mt-8 flex flex-wrap gap-2 justify-center">
            <Link href="/contact" className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-medium glass-dark border border-cyan-500/20 text-cyan-300 rounded-xl hover:border-cyan-500/40 transition-colors duration-200">
              Inscrire mon enfant
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link href="/revisions" className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-medium glass-dark border border-white/[0.07] text-white/50 rounded-xl hover:text-white/70 transition-colors duration-200">
              Cours & révisions
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  LISTE DES CLASSES — Section claire                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#f1f3f9] relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.04] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-400/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">
          {classes.length === 0 ? (
            <div className="text-center py-24 scroll-animate">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-cyan-400">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Aucune classe disponible</h3>
              <p className="text-neutral-500 mt-2">Les classes seront bientôt ajoutées.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12 scroll-animate">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cyan-200/80 shadow-sm mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span className="text-sm font-semibold text-cyan-700 tracking-wide">Année scolaire 2024-2025</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Toutes nos classes
                </h2>
              </div>
              <ClassesListe classes={classes} />
            </>
          )}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA — Gradient                                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-28 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.08] blur-[160px] rounded-full animate-glow-pulse" />
        <div className="absolute top-8 left-8 w-24 h-24 rounded-full border border-white/15" />
        <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full border border-white/12" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10 scroll-animate">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Prêt à rejoindre nos classes ?
          </h2>
          <p className="text-cyan-100/75 max-w-lg mx-auto text-lg mt-5 leading-relaxed">
            Les inscriptions sont ouvertes pour la rentrée 2025-2026. Places limitées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/contact" className="btn-primary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-bold text-[16px] hover:bg-cyan-50 shadow-xl shadow-black/15 transition-all duration-300">
              S&apos;inscrire maintenant
            </Link>
            <Link href="/revisions" className="btn-secondary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl border-2 border-white/30 text-white font-semibold text-[16px] hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              Cours & révisions
            </Link>
          </div>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
