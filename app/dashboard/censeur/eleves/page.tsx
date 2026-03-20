import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CenseurElevesPage() {
  const session = await auth();
  if (!session) return null;

  const eleves = await prisma.eleve.findMany({
    where: { classe: { ecole_id: session.user.ecoleId } },
    include: {
      classe: { select: { nom: true, niveau: true } },
      user: { select: { email: true } },
    },
    orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Gestion des eleves</h2>
          <p className="text-neutral-500 text-sm">
            {eleves.length} eleve(s) inscrit(s)
          </p>
        </div>
        <Link
          href="/dashboard/censeur/eleves/nouveau"
          className="h-9 px-4 inline-flex items-center bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shrink-0"
        >
          + Inscrire un eleve
        </Link>
      </div>

      {eleves.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
          <div className="w-14 h-14 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p className="text-neutral-500 text-sm">Aucun eleve inscrit pour le moment.</p>
          <p className="text-xs text-neutral-400 mt-1">Commencez par inscrire votre premier eleve.</p>
          <Link
            href="/dashboard/censeur/eleves/nouveau"
            className="mt-4 inline-flex h-9 px-4 items-center text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Inscrire le premier eleve
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Matricule</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Nom & Prenom</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Classe</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((eleve) => (
                  <tr key={eleve.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-indigo-500">{eleve.matricule}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {eleve.nom} {eleve.prenom}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5">{eleve.classe.nom}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{eleve.user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium rounded-md px-2 py-0.5 ${
                        eleve.actif
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}>
                        {eleve.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
