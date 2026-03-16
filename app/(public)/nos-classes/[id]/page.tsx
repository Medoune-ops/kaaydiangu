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
      <section className="relative bg-[#050505] py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <Link href="/nos-classes" className="text-neutral-500 hover:text-emerald-400 text-sm mb-5 inline-flex items-center gap-1.5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Retour aux classes
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{classe.nom}</h1>
            {classe.filiere && (
              <span className="text-sm font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg px-3 py-1">
                {classe.filiere}
              </span>
            )}
          </div>
          <p className="mt-3 text-neutral-400">
            {classe.niveau} — {classe._count.eleves} eleve(s) — {classe.matieres.length} matiere(s)
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          {/* Matieres */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
              Matieres enseignees
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classe.matieres.map((m) => (
                <div key={m.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 hover:border-emerald-500/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{m.nom}</h3>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                      Coef. {m.coefficient}
                    </span>
                  </div>
                  <p className="text-neutral-400">
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
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
              Emploi du temps
            </h2>
            <EmploiDuTempsViewer classeId={id} />
          </div>

          <div className="pt-4">
            <Link
              href="/nos-classes"
              className="inline-flex h-10 px-5 items-center font-medium text-neutral-300 border border-white/[0.1] rounded-xl hover:bg-white/[0.04] transition-colors gap-2"
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
