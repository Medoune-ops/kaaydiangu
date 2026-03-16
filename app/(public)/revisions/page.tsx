import { prisma } from "@/lib/prisma";
import { RevisionsSearch } from "./search";

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
    <>
      <section className="relative bg-[#050505] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Ressources</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            Revisions
          </h1>
          <p className="mt-5 text-neutral-400 max-w-2xl mx-auto text-lg">
            Retrouvez tous les cours et supports deposes par vos professeurs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevisionsSearch
            classes={classes}
            matieres={matieres.map((m) => m.nom)}
            currentMatiere={params.matiere}
            currentClasse={params.classe}
          />

          {cours.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Aucun cours trouve</h3>
              <p className="text-neutral-500 mt-2">
                {params.matiere || params.classe
                  ? "Essayez de modifier vos filtres."
                  : "Les cours seront bientot disponibles."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {cours.map((c) => (
                <div key={c.id} className="group bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300">
                  <div className="p-7 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white leading-snug" style={{ fontFamily: "var(--font-heading)" }}>{c.titre}</h3>
                      <span className="shrink-0 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                        {c.matiere.nom}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-neutral-400 line-clamp-2 leading-relaxed">{c.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-neutral-600">
                      <span>{c.classe.nom}</span>
                      <span>
                        Par {c.depose_par.prenom} {c.depose_par.nom}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm text-neutral-600">
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
                        className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                      >
                        Telecharger &darr;
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
