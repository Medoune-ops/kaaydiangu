import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const MOIS_NOMS = [
  "Inscription", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement",
};

export const dynamic = "force-dynamic";

export default async function ElevePublicPage({
  params,
}: {
  params: Promise<{ paiement_id: string }>;
}) {
  const { paiement_id } = await params;

  const paiement = await prisma.paiement.findUnique({
    where: { id: paiement_id, statut: "PAYE" },
    include: {
      eleve: {
        include: { classe: { select: { id: true, nom: true } } },
      },
    },
  });

  if (!paiement) notFound();

  const eleve = paiement.eleve;

  const [tousLesPaiements, notes, cours] = await Promise.all([
    prisma.paiement.findMany({
      where: { eleve_id: eleve.id, statut: "PAYE" },
      orderBy: [{ annee: "asc" }, { mois: "asc" }],
      select: {
        id: true,
        mois: true,
        annee: true,
        montant: true,
        mode: true,
        recu_numero: true,
        date_paiement: true,
      },
    }),
    prisma.note.findMany({
      where: { eleve_id: eleve.id },
      select: { sequence: true },
      distinct: ["sequence"],
      orderBy: { sequence: "asc" },
    }),
    prisma.cours.findMany({
      where: { classe_id: eleve.classe_id },
      include: {
        matiere: { select: { nom: true } },
        depose_par: { select: { nom: true, prenom: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const sequences = notes.map((n) => n.sequence);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* En-tête élève */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {eleve.prenom} {eleve.nom}
          </h1>
          <p className="text-sm text-neutral-500">
            {eleve.classe.nom} &middot; Matricule : <span className="font-mono">{eleve.matricule}</span>
          </p>
        </div>
      </div>

      {/* Bulletins */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Bulletins</h2>
        </div>
        <div className="p-6">
          {sequences.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucun bulletin disponible.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sequences.map((seq) => (
                <a
                  key={seq}
                  href={`/api/bulletins/consulter?eleve_id=${eleve.id}&sequence=${seq}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-neutral-200 rounded-lg p-4 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">Séquence {seq}</p>
                  <p className="text-xs text-indigo-500 mt-1">Consulter</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reçus de paiement */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Reçus de paiement</h2>
        </div>
        <div className="p-6">
          {tousLesPaiements.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucun reçu disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-500 uppercase text-xs tracking-wider">
                    <th className="text-left px-3 py-2">Mois</th>
                    <th className="text-center px-3 py-2">Montant</th>
                    <th className="text-center px-3 py-2">Mode</th>
                    <th className="text-center px-3 py-2">Date</th>
                    <th className="text-center px-3 py-2">Reçu</th>
                  </tr>
                </thead>
                <tbody>
                  {tousLesPaiements.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-3 py-2 font-medium text-neutral-900">
                        {MOIS_NOMS[p.mois]} {p.annee}
                      </td>
                      <td className="px-3 py-2 text-center text-neutral-600">
                        {p.montant.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-500">
                          {MODE_LABELS[p.mode ?? ""] ?? p.mode ?? "--"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-neutral-500">
                        {p.date_paiement
                          ? new Date(p.date_paiement).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.recu_numero ? (
                          <a
                            href={`/api/paiements/recu?paiement_id=${p.id}&print=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-500 hover:underline font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            {p.recu_numero}
                          </a>
                        ) : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cours */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Cours disponibles</h2>
        </div>
        <div className="p-6">
          {cours.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucun cours disponible.</p>
          ) : (
            <div className="space-y-3">
              {cours.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-neutral-900">{c.titre}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-500">
                        {c.matiere.nom}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {c.depose_par.prenom} {c.depose_par.nom} &middot;{" "}
                      {new Date(c.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <a
                    href={c.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline font-medium shrink-0 ml-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Télécharger
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
