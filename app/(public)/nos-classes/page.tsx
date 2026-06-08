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
            <ClassesListe classes={classes} />
          )}
        </div>
      </section>
    </ScrollAnimateProvider>
  );
}
