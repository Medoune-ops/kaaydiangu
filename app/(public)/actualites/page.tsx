import Link from "next/link";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { ListeImpayes } from "@/components/public/liste-impayes";

const articles = [
  {
    id: 1,
    titre: "Rentrée scolaire 2024-2025",
    extrait: "La rentrée des classes est fixée au 7 octobre. Tous les élèves sont attendus à 8h00 avec leurs fournitures.",
    date: "2024-09-15",
    categorie: "Rentrée",
  },
  {
    id: 2,
    titre: "Résultats du BFEM : 96% de réussite",
    extrait: "Nous sommes fiers d'annoncer un taux de réussite exceptionnel au BFEM cette année. Félicitations à tous nos élèves !",
    date: "2024-08-20",
    categorie: "Résultats",
  },
  {
    id: 3,
    titre: "Journée portes ouvertes",
    extrait: "IREF ouvre ses portes le samedi 28 septembre. Venez découvrir nos locaux et rencontrer l'équipe pédagogique.",
    date: "2024-09-10",
    categorie: "Événement",
  },
  {
    id: 4,
    titre: "Lancement de la plateforme en ligne",
    extrait: "Parents et élèves peuvent désormais suivre les notes, paiements et emplois du temps depuis notre nouvelle plateforme.",
    date: "2024-09-25",
    categorie: "Numérique",
  },
  {
    id: 5,
    titre: "Tournoi inter-classes de football",
    extrait: "Le tournoi annuel de football aura lieu du 15 au 20 décembre. Les inscriptions sont ouvertes pour toutes les classes.",
    date: "2024-11-01",
    categorie: "Sport",
  },
  {
    id: 6,
    titre: "Distribution des bulletins du 1er semestre",
    extrait: "Les bulletins seront remis aux parents lors de la réunion du samedi 25 janvier à partir de 9h.",
    date: "2024-12-15",
    categorie: "Pédagogie",
  },
];

const CAT_STYLE: Record<string, { cls: string; dot: string }> = {
  Rentrée:   { cls: "bg-cyan-50 text-cyan-700 border-cyan-200",   dot: "bg-cyan-500"   },
  Résultats: { cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500"  },
  Événement: { cls: "bg-teal-50 text-teal-700 border-teal-200",   dot: "bg-teal-500"   },
  Numérique: { cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  Sport:     { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Pédagogie: { cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
};

export default function ActualitesPage() {
  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique sombre                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#020c1b]">
        <div className="film-grain z-[1]" />
        <div className="absolute inset-0 dot-grid opacity-30 z-[3] pointer-events-none" />

        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-teal-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.07] blur-[160px] animate-aurora-mid z-[2] pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%] z-[5]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full text-center py-32">
          <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-dark border border-cyan-500/20 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide">Fil d&apos;info</span>
          </div>
          <h1
            className="animate-slide-up-delay-1 text-[clamp(2.6rem,5.5vw,4.2rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Actualités <span className="text-shimmer">de l&apos;école</span>
          </h1>
          <p className="animate-slide-up-delay-2 mt-5 text-[15px] text-white/50 leading-relaxed max-w-lg mx-auto">
            Restez informé de toute l&apos;actualité de notre établissement — événements, résultats, annonces.
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  LISTE IMPAYÉS — Section sombre                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#020c1b] relative overflow-hidden section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-16">
          <ListeImpayes />
        </div>
        <div className="gradient-line absolute bottom-0 left-[8%] right-[8%]" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  ARTICLES — Section claire                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-white relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.04] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Toutes les actualités</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Dernières nouvelles
            </h2>
            <p className="text-neutral-500 mt-5 max-w-lg mx-auto text-lg leading-relaxed">
              Retrouvez toute l&apos;actualité de notre établissement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => {
              const style = CAT_STYLE[article.categorie] ?? { cls: "bg-neutral-50 text-neutral-500 border-neutral-200", dot: "bg-neutral-400" };
              return (
                <div
                  key={article.id}
                  className={`gradient-border p-8 group hover:-translate-y-1 scroll-animate scroll-animate-delay-${(i % 3) + 1} flex flex-col`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-2.5 py-1 ${style.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {article.categorie}
                    </span>
                    <span className="text-sm text-neutral-400 shrink-0">
                      {new Date(article.date).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug mb-3 group-hover:text-cyan-700 transition-colors duration-200" style={{ fontFamily: "var(--font-heading)" }}>
                    {article.titre}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed text-[15px] flex-1">{article.extrait}</p>
                  <div className="mt-5 pt-4 border-t border-neutral-100">
                    <span className="text-sm font-semibold text-cyan-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                      Lire la suite
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA — Gradient                                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-28 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.08] blur-[160px] rounded-full animate-glow-pulse" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10 scroll-animate">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Votre enfant mérite le meilleur
          </h2>
          <p className="text-cyan-100/75 max-w-lg mx-auto text-lg mt-5 leading-relaxed">
            Contactez-nous pour en savoir plus sur nos formations et les inscriptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/contact" className="btn-primary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-bold text-[16px] hover:bg-cyan-50 shadow-xl shadow-black/15 transition-all duration-300">
              Nous contacter
            </Link>
            <Link href="/nos-classes" className="btn-secondary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl border-2 border-white/30 text-white font-semibold text-[16px] hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              Découvrir les classes
            </Link>
          </div>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
