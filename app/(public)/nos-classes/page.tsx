import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NosClassesPage() {
  const classes = await prisma.classe.findMany({
    include: {
      _count: { select: { eleves: true, matieres: true } },
    },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
  });

  // Grouper par niveau
  const grouped = classes.reduce<Record<string, typeof classes>>((acc, classe) => {
    const key = classe.niveau;
    if (!acc[key]) acc[key] = [];
    acc[key].push(classe);
    return acc;
  }, {});

  return (
    <>
      <section className="relative bg-[#050505] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Formation</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            Nos classes
          </h1>
          <p className="mt-5 text-neutral-400 max-w-2xl mx-auto text-lg">
            Decouvrez l&apos;ensemble de nos classes et filieres pour cette annee scolaire.
          </p>
        </div>
      </section>

      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {classes.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Aucune classe disponible</h3>
              <p className="text-neutral-500 mt-2">Les classes seront bientot ajoutees.</p>
            </div>
          ) : (
            <div className="space-y-14">
              {Object.entries(grouped).map(([niveau, classesDuNiveau]) => (
                <div key={niveau}>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
                    <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
                    {niveau}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classesDuNiveau.map((classe) => (
                      <Link key={classe.id} href={`/nos-classes/${classe.id}`}>
                        <div className="group bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                          <div className="p-7">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>{classe.nom}</h3>
                              {classe.filiere && (
                                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                                  {classe.filiere}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-6 text-neutral-400">
                              <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                {classe._count.eleves} eleves
                              </span>
                              <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
                                {classe._count.matieres} matieres
                              </span>
                            </div>
                            <p className="text-sm text-emerald-400 mt-4 group-hover:underline">Voir le detail &rarr;</p>
                          </div>
                        </div>
                      </Link>
                    ))}
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
