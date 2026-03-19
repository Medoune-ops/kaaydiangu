import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    <>
      <section className="relative bg-white py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-fade" />
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-cyan-400/[0.06] blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link href="/nos-classes" className="text-neutral-500 hover:text-cyan-600 text-sm mb-6 inline-flex items-center gap-1.5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Retour aux classes
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight glow-text" style={{ fontFamily: "var(--font-heading)" }}>{classe.nom}</h1>
            {classe.filiere && (
              <span className="text-sm font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl px-3.5 py-1.5">
                {classe.filiere}
              </span>
            )}
          </div>
          <p className="mt-3 text-neutral-500 text-[16px]">
            {classe.niveau} — {classe._count.eleves} eleve(s) — {classe.matieres.length} matiere(s)
          </p>
        </div>
      </section>

      <section className="py-20 bg-neutral-50/50 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16 relative z-10">
          {/* Matieres */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-1 h-8 rounded-full bg-gradient-to-b from-cyan-500 to-teal-500" />
              Matieres enseignees
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classe.matieres.map((m) => (
                <div key={m.id} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-neutral-900 text-[15px]">{m.nom}</h3>
                    <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1">
                      Coef. {m.coefficient}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[15px]">
                    {m.professeur
                      ? `${m.professeur.prenom} ${m.professeur.nom}`
                      : "Professeur non assigne"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emploi du temps */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-1 h-8 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" />
              Emploi du temps
            </h2>
            <EmploiDuTempsViewer classeId={id} />
          </div>

          <div className="pt-4">
            <Link
              href="/nos-classes"
              className="inline-flex h-10 px-5 items-center font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Retour aux classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
