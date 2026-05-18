import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RevisionsSearch } from "./search";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

export const dynamic = "force-dynamic";

const MATIERE_COLOR: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  Mathématiques: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   accent: "from-blue-500 to-indigo-500"   },
  Français:      { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", accent: "from-violet-500 to-purple-500" },
  Histoire:      { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  accent: "from-amber-500 to-orange-500"  },
  Géographie:    { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   accent: "from-teal-500 to-cyan-500"     },
  Physique:      { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", accent: "from-indigo-500 to-blue-500"   },
  SVT:           { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  accent: "from-green-500 to-teal-500"    },
  Anglais:       { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200",    accent: "from-sky-500 to-blue-500"      },
};

const DEFAULT_COLOR = { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", accent: "from-cyan-500 to-teal-500" };

function getMatiereColor(nom: string) {
  for (const key of Object.keys(MATIERE_COLOR)) {
    if (nom.toLowerCase().includes(key.toLowerCase())) return MATIERE_COLOR[key];
  }
  return DEFAULT_COLOR;
}

function isNew(date: Date) {
  return (Date.now() - date.getTime()) / 86400000 < 14;
}

export default async function RevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ matiere?: string; classe?: string }>;
}) {
  const params = await searchParams;

  const classes = await prisma.classe.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, niveau: true },
  });

  const matieres = await prisma.matiere.findMany({
    distinct: ["nom"],
    orderBy: { nom: "asc" },
    select: { nom: true },
  });

  const where: Record<string, unknown> = {};
  if (params.matiere) {
    where.matiere = { nom: { contains: params.matiere, mode: "insensitive" } };
  }
  if (params.classe) {
    where.classe_id = params.classe;
  }

  const cours = await prisma.cours.findMany({
    where,
    include: {
      matiere: true,
      classe: true,
      depose_par: { select: { nom: true, prenom: true } },
    },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique sombre                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#020c1b]">
        <div className="film-grain z-[1]" />
        <div className="absolute inset-0 dot-grid opacity-30 z-[3] pointer-events-none" />
        <div className="absolute top-[5%] left-[5%] w-[600px] h-[600px] rounded-full bg-indigo-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.07] blur-[160px] animate-aurora-mid z-[2] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%] z-[5]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full text-center py-32">
          <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-dark border border-cyan-500/20 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide">Ressources pédagogiques</span>
          </div>
          <h1
            className="animate-slide-up-delay-1 text-[clamp(2.6rem,5.5vw,4.2rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Cours &amp; <span className="text-shimmer">révisions</span>
          </h1>
          <p className="animate-slide-up-delay-2 mt-5 text-[15px] text-white/50 leading-relaxed max-w-lg mx-auto">
            Retrouvez tous les cours et supports déposés par vos professeurs.
            {cours.length > 0 && (
              <> <span className="text-white/70 font-semibold">{cours.length} document{cours.length > 1 ? "s" : ""}</span> disponible{cours.length > 1 ? "s" : ""}.</>
            )}
          </p>

          <div className="animate-fade-in mt-8 flex flex-wrap gap-3 justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              <span className="text-white/50 text-[12px]">{matieres.length} matière{matieres.length > 1 ? "s" : ""}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
              <span className="text-white/50 text-[12px]">{classes.length} classe{classes.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  RECHERCHE + COURS — Section claire                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#f1f3f9] relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.04] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-400/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">

          <div className="scroll-animate mb-10">
            <RevisionsSearch
              classes={classes}
              matieres={matieres.map((m) => m.nom)}
              currentMatiere={params.matiere}
              currentClasse={params.classe}
            />
          </div>

          {cours.length === 0 ? (
            <div className="text-center py-24 scroll-animate">
              <div className="h-16 w-16 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-400">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Aucun cours trouvé</h3>
              <p className="text-neutral-500 mt-2 text-[15px]">
                {params.matiere || params.classe
                  ? "Essayez de modifier vos filtres."
                  : "Les cours seront bientôt disponibles."}
              </p>
              {(params.matiere || params.classe) && (
                <Link href="/revisions" className="inline-flex mt-5 h-10 px-5 items-center gap-1.5 text-sm font-semibold text-cyan-700 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  Effacer les filtres
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 scroll-animate">
                <div>
                  <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    {params.matiere || params.classe ? "Résultats filtrés" : "Tous les cours"}
                  </h2>
                  <p className="text-neutral-500 text-sm mt-1">{cours.length} document{cours.length > 1 ? "s" : ""} trouvé{cours.length > 1 ? "s" : ""}</p>
                </div>
                {(params.matiere || params.classe) && (
                  <Link href="/revisions" className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Effacer
                  </Link>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cours.map((c, i) => {
                  const color = getMatiereColor(c.matiere.nom);
                  const nouveau = isNew(c.date);
                  return (
                    <div
                      key={c.id}
                      className={`relative bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.05),0_4px_16px_rgba(15,23,42,0.03)] group hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden scroll-animate scroll-animate-delay-${(i % 3) + 1}`}
                    >
                      {/* Top accent bar */}
                      <div className={`h-[2px] bg-gradient-to-r ${color.accent} shrink-0`} />

                      <div className="p-6 flex flex-col flex-1">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          {/* File icon */}
                          <div className={`shrink-0 w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={color.text}>
                              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                              <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                              <path d="M10 9H8"/>
                              <path d="M16 13H8"/>
                              <path d="M16 17H8"/>
                            </svg>
                          </div>
                          {/* Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {nouveau && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-bold text-cyan-700 uppercase tracking-wide">
                                <span className="w-1 h-1 rounded-full bg-cyan-500" />
                                Nouveau
                              </span>
                            )}
                            <span className={`text-xs font-semibold border rounded-lg px-2.5 py-1 ${color.bg} ${color.text} ${color.border}`}>
                              {c.matiere.nom}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className="text-[16px] font-bold text-neutral-900 leading-snug mb-2 group-hover:text-cyan-700 transition-colors duration-200"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {c.titre}
                        </h3>

                        {c.description && (
                          <p className="text-neutral-500 line-clamp-2 leading-relaxed text-[13px] mb-3">{c.description}</p>
                        )}

                        {/* Meta */}
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-[13px] text-neutral-400 mb-4 pt-2">
                            <span className="inline-flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                              <span className="font-medium text-neutral-600">{c.depose_par.prenom} {c.depose_par.nom}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] font-semibold text-neutral-600">
                              {c.classe.nom}
                            </span>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                            <span className="text-[12px] text-neutral-400">
                              {new Date(c.date).toLocaleDateString("fr-FR", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                            <a
                              href={c.fichier_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-[12px] font-bold hover:from-cyan-400 hover:to-teal-400 transition-all duration-200 shadow-sm group-hover:shadow-md"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform duration-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                              Télécharger
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA — Gradient                                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/[0.08] blur-[160px] rounded-full animate-glow-pulse" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Accédez à votre espace élève
          </h2>
          <p className="text-cyan-100/75 max-w-md mx-auto text-base mt-4 leading-relaxed">
            Connectez-vous pour accéder à toutes vos ressources, notes et paiements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-7">
            <Link href="/login" className="btn-primary h-[48px] px-8 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-bold text-[15px] hover:bg-cyan-50 shadow-xl shadow-black/15 transition-all duration-300">
              Se connecter
            </Link>
            <Link href="/nos-classes" className="btn-secondary h-[48px] px-8 inline-flex items-center justify-center rounded-2xl border-2 border-white/30 text-white font-semibold text-[15px] hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              Voir les classes
            </Link>
          </div>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
