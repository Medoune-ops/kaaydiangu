"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { ListeImpayes } from "@/components/public/liste-impayes";

const articles = [
  {
    id: 1,
    titre: "Rentrée scolaire 2024-2025",
    extrait: "La rentrée des classes est fixée au 7 octobre. Tous les élèves sont attendus à 8h00 avec leurs fournitures complètes. Un accueil spécial est prévu pour les nouveaux inscrits.",
    date: "2024-09-15",
    categorie: "Rentrée",
    readTime: 2,
  },
  {
    id: 2,
    titre: "Résultats du BFEM : 96% de réussite",
    extrait: "Nous sommes fiers d'annoncer un taux de réussite exceptionnel au BFEM cette année. Félicitations à tous nos élèves et à l'ensemble du corps enseignant pour ce résultat historique !",
    date: "2024-08-20",
    categorie: "Résultats",
    readTime: 3,
  },
  {
    id: 3,
    titre: "Journée portes ouvertes",
    extrait: "IREF ouvre ses portes le samedi 28 septembre. Venez découvrir nos locaux, rencontrer l'équipe pédagogique et poser toutes vos questions sur les programmes et les inscriptions.",
    date: "2024-09-10",
    categorie: "Événement",
    readTime: 2,
  },
  {
    id: 4,
    titre: "Lancement de la plateforme en ligne",
    extrait: "Parents et élèves peuvent désormais suivre les notes, paiements et emplois du temps depuis notre nouvelle plateforme numérique accessible 24h/24.",
    date: "2024-09-25",
    categorie: "Numérique",
    readTime: 4,
  },
  {
    id: 5,
    titre: "Tournoi inter-classes de football",
    extrait: "Le tournoi annuel de football aura lieu du 15 au 20 décembre. Les inscriptions sont ouvertes pour toutes les classes. Que le meilleur gagne !",
    date: "2024-11-01",
    categorie: "Sport",
    readTime: 2,
  },
  {
    id: 6,
    titre: "Distribution des bulletins du 1er semestre",
    extrait: "Les bulletins seront remis aux parents lors de la réunion du samedi 25 janvier à partir de 9h. La présence des tuteurs légaux est obligatoire.",
    date: "2024-12-15",
    categorie: "Pédagogie",
    readTime: 2,
  },
];

const CATEGORIES = ["Toutes", "Rentrée", "Résultats", "Événement", "Numérique", "Sport", "Pédagogie"];

const CAT_STYLE: Record<string, { cls: string; dot: string; bg: string; accent: string }> = {
  Rentrée:   { cls: "bg-cyan-50 text-cyan-700 border-cyan-200",     dot: "bg-cyan-500",    bg: "from-cyan-500/[0.06] to-transparent",    accent: "from-cyan-500 to-teal-500"   },
  Résultats: { cls: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500",   bg: "from-amber-500/[0.06] to-transparent",   accent: "from-amber-500 to-orange-500" },
  Événement: { cls: "bg-teal-50 text-teal-700 border-teal-200",     dot: "bg-teal-500",    bg: "from-teal-500/[0.06] to-transparent",    accent: "from-teal-500 to-cyan-500"   },
  Numérique: { cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", bg: "from-violet-500/[0.06] to-transparent",  accent: "from-violet-500 to-indigo-500"},
  Sport:     { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", bg: "from-orange-500/[0.06] to-transparent",  accent: "from-orange-500 to-red-500"  },
  Pédagogie: { cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", bg: "from-indigo-500/[0.06] to-transparent",  accent: "from-indigo-500 to-violet-500"},
};

const FALLBACK = { cls: "bg-neutral-50 text-neutral-500 border-neutral-200", dot: "bg-neutral-400", bg: "from-neutral-100 to-transparent", accent: "from-neutral-400 to-neutral-500" };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ActualitesPage() {
  const [activeCategory, setActiveCategory] = useState("Toutes");

  const filtered = activeCategory === "Toutes"
    ? articles
    : articles.filter((a) => a.categorie === activeCategory);

  const [featured, ...rest] = filtered;

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

          {/* Stat pills */}
          <div className="animate-fade-in mt-8 flex flex-wrap gap-3 justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              <span className="text-white/50 text-[12px]">{articles.length} articles</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <span className="text-white/50 text-[12px]">Mis à jour 2024-2025</span>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  LISTE IMPAYÉS                                         */}
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
      <section className="bg-[#f1f3f9] relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.05] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">

          {/* Section header */}
          <div className="text-center mb-10 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Toutes les actualités</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Dernières nouvelles
            </h2>
            <p className="text-neutral-500 mt-5 max-w-lg mx-auto text-lg leading-relaxed">
              Retrouvez toute l&apos;actualité de notre établissement.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-12 scroll-animate">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">Aucun article dans cette catégorie.</p>
              <button
                onClick={() => setActiveCategory("Toutes")}
                className="mt-4 inline-flex h-9 px-4 items-center gap-1.5 text-sm font-medium text-cyan-700 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
              >
                Voir tout
              </button>
            </div>
          ) : (
            <>
              {/* Featured article — first card, full-width hero */}
              {featured && (() => {
                const style = CAT_STYLE[featured.categorie] ?? FALLBACK;
                return (
                  <div className="mb-8 scroll-animate">
                    <div className="relative bg-white rounded-3xl border border-neutral-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_8px_32px_rgba(15,23,42,0.04)] overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
                      {/* Category accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${style.accent}`} />

                      {/* Large pale number */}
                      <span className="absolute right-8 top-4 text-[8rem] font-black text-neutral-100 leading-none select-none pointer-events-none" style={{ fontFamily: "var(--font-heading)" }}>
                        01
                      </span>

                      <div className="p-10 md:p-14 relative">
                        <div className="flex items-center gap-3 mb-6">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-2.5 py-1 ${style.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {featured.categorie}
                          </span>
                          <span className="text-sm text-neutral-400">{formatDate(featured.date)}</span>
                          <span className="text-sm text-neutral-300">·</span>
                          <span className="text-sm text-neutral-400">{featured.readTime} min de lecture</span>
                          <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[11px] font-bold text-cyan-700 uppercase tracking-wide">
                            À la une
                          </span>
                        </div>
                        <h3
                          className="text-3xl md:text-4xl font-extrabold text-neutral-900 leading-tight mb-4 group-hover:text-cyan-700 transition-colors duration-200 max-w-2xl"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {featured.titre}
                        </h3>
                        <p className="text-neutral-500 text-[17px] leading-relaxed max-w-xl">{featured.extrait}</p>
                        <div className="mt-8">
                          <span className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-neutral-900 text-white font-semibold text-[15px] hover:bg-neutral-800 transition-colors cursor-pointer group-hover:gap-3 duration-200">
                            Lire l&apos;article
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Remaining articles grid */}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((article, i) => {
                    const style = CAT_STYLE[article.categorie] ?? FALLBACK;
                    const num = String(i + 2).padStart(2, "0");
                    return (
                      <div
                        key={article.id}
                        className={`relative bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.05),0_4px_16px_rgba(15,23,42,0.03)] p-7 group hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden scroll-animate scroll-animate-delay-${(i % 3) + 1}`}
                      >
                        {/* Category accent bar */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${style.accent}`} />

                        {/* Pale number in background */}
                        <span className="absolute right-5 bottom-3 text-[4.5rem] font-black text-neutral-100 leading-none select-none pointer-events-none" style={{ fontFamily: "var(--font-heading)" }}>
                          {num}
                        </span>

                        <div className="flex items-start justify-between gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-2.5 py-1 ${style.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {article.categorie}
                          </span>
                          <span className="text-xs text-neutral-400 shrink-0">{article.readTime} min</span>
                        </div>

                        <h3
                          className="text-[17px] font-bold text-neutral-900 leading-snug mb-3 group-hover:text-cyan-700 transition-colors duration-200"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {article.titre}
                        </h3>
                        <p className="text-neutral-500 leading-relaxed text-[14px] flex-1 line-clamp-3">{article.extrait}</p>

                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[13px] text-neutral-400">{formatDate(article.date)}</span>
                          <span className="text-sm font-semibold text-cyan-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                            Lire
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
