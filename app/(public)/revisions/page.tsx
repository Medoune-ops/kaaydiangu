import { prisma } from "@/lib/prisma";
import { RevisionsSearch } from "./search";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

export const dynamic = "force-dynamic";

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
      <section className="relative bg-white py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-fade" />
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-cyan-400/[0.06] blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <span className="text-sm font-semibold text-cyan-700 tracking-wide">Ressources</span>
          </div>
          <h1 className="animate-slide-up-delay-1 text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight glow-text" style={{ fontFamily: "var(--font-heading)" }}>
            Revisions
          </h1>
          <p className="animate-slide-up-delay-2 mt-6 text-neutral-500 max-w-2xl mx-auto text-lg">
            Retrouvez tous les cours et supports deposes par vos professeurs.
          </p>
        </div>
      </section>

      <section className="py-20 bg-neutral-50/50 relative section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="scroll-animate">
            <RevisionsSearch
              classes={classes}
              matieres={matieres.map((m) => m.nom)}
              currentMatiere={params.matiere}
              currentClasse={params.classe}
            />
          </div>

          {cours.length === 0 ? (
            <div className="text-center py-24 scroll-animate">
              <div className="h-16 w-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Aucun cours trouve</h3>
              <p className="text-neutral-500 mt-2">
                {params.matiere || params.classe
                  ? "Essayez de modifier vos filtres."
                  : "Les cours seront bientot disponibles."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {cours.map((c, i) => (
                <div key={c.id} className={`gradient-border p-7 group hover:-translate-y-1 scroll-animate scroll-animate-delay-${(i % 3) + 1}`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-lg font-bold text-neutral-900 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>{c.titre}</h3>
                    <span className="shrink-0 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1">
                      {c.matiere.nom}
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-neutral-500 line-clamp-2 leading-relaxed text-[15px] mb-4">{c.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-neutral-400 mb-3">
                    <span>{c.classe.nom}</span>
                    <span>Par {c.depose_par.prenom} {c.depose_par.nom}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-sm text-neutral-400">
                      {new Date(c.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <a
                      href={c.fichier_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 transition-colors duration-250 inline-flex items-center gap-1"
                    >
                      Telecharger
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform duration-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ScrollAnimateProvider>
  );
}
