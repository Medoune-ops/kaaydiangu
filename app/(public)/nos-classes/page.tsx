import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

export const dynamic = "force-dynamic";

export default async function NosClassesPage() {
  const classes = await prisma.classe.findMany({
    include: {
      _count: { select: { eleves: true, matieres: true } },
    },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
  });

  const grouped = classes.reduce<Record<string, typeof classes>>((acc, classe) => {
    const key = classe.niveau;
    if (!acc[key]) acc[key] = [];
    acc[key].push(classe);
    return acc;
  }, {});

  return (
    <ScrollAnimateProvider>
      <section className="relative bg-white py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-fade" />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-cyan-400/[0.06] blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <span className="text-sm font-semibold text-cyan-700 tracking-wide">Formation</span>
          </div>
          <h1 className="animate-slide-up-delay-1 text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight glow-text" style={{ fontFamily: "var(--font-heading)" }}>
            Nos classes
          </h1>
          <p className="animate-slide-up-delay-2 mt-6 text-neutral-500 max-w-2xl mx-auto text-lg">
            Decouvrez l&apos;ensemble de nos classes et filieres pour cette annee scolaire.
          </p>
        </div>
      </section>

      <section className="py-24 bg-neutral-50/50 relative section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {classes.length === 0 ? (
            <div className="text-center py-24 scroll-animate">
              <div className="h-16 w-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Aucune classe disponible</h3>
              <p className="text-neutral-500 mt-2">Les classes seront bientot ajoutees.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(grouped).map(([niveau, classesDuNiveau]) => (
                <div key={niveau} className="scroll-animate">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
                    <span className="w-1 h-8 rounded-full bg-gradient-to-b from-cyan-500 to-teal-500" />
                    {niveau}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classesDuNiveau.map((classe) => (
                      <Link key={classe.id} href={`/nos-classes/${classe.id}`}>
                        <div className="gradient-border p-7 group cursor-pointer hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{classe.nom}</h3>
                            {classe.filiere && (
                              <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1 transition-all duration-300 group-hover:bg-cyan-100">
                                {classe.filiere}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-6 text-neutral-500 text-[15px]">
                            <span className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                              {classe._count.eleves} eleves
                            </span>
                            <span className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
                              {classe._count.matieres} matieres
                            </span>
                          </div>
                          <div className="mt-5 pt-4 border-t border-neutral-100">
                            <span className="text-sm font-semibold text-cyan-600 group-hover:text-cyan-500 transition-colors duration-250 inline-flex items-center gap-1">
                              Voir le detail
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </span>
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
    </ScrollAnimateProvider>
  );
}
