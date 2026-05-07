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

  const [tousLesPaiements, notesRaw, absences, cours] = await Promise.all([
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
      select: {
        valeur: true,
        type: true,
        sequence: true,
        matiere: { select: { nom: true, coefficient: true } },
      },
      orderBy: [{ sequence: "asc" }, { matiere: { nom: "asc" } }],
    }),
    prisma.absence.findMany({
      where: { eleve_id: eleve.id },
      select: {
        id: true,
        date: true,
        duree_heures: true,
        justifiee: true,
        motif: true,
        matiere: { select: { nom: true } },
      },
      orderBy: { date: "desc" },
      take: 10,
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

  // Group notes by sequence then by matière for moyennes
  type NoteEntry = { valeur: number; type: string; matiere: { nom: string; coefficient: number } };
  const notesBySequence = notesRaw.reduce<Record<number, NoteEntry[]>>((acc, n) => {
    if (!acc[n.sequence]) acc[n.sequence] = [];
    acc[n.sequence].push(n);
    return acc;
  }, {});

  const sequences = Object.keys(notesBySequence)
    .map(Number)
    .sort((a, b) => a - b);

  type MatiereStats = {
    nom: string;
    coefficient: number;
    moyenneCoeff: number;
    notes: { valeur: number; type: string }[];
  };

  function computeSequenceStats(notes: NoteEntry[]): { matieres: MatiereStats[]; moyenneGenerale: number } {
    const byMatiere: Record<string, MatiereStats> = {};
    for (const n of notes) {
      const key = n.matiere.nom;
      if (!byMatiere[key]) {
        byMatiere[key] = { nom: n.matiere.nom, coefficient: n.matiere.coefficient, moyenneCoeff: 0, notes: [] };
      }
      byMatiere[key].notes.push({ valeur: n.valeur, type: n.type });
    }
    const matieres = Object.values(byMatiere).map((m) => {
      const avg = m.notes.reduce((s, x) => s + x.valeur, 0) / m.notes.length;
      return { ...m, moyenneCoeff: avg };
    });
    const totalCoeff = matieres.reduce((s, m) => s + m.coefficient, 0);
    const moyenneGenerale = totalCoeff > 0
      ? matieres.reduce((s, m) => s + m.moyenneCoeff * m.coefficient, 0) / totalCoeff
      : 0;
    return { matieres, moyenneGenerale };
  }

  const totalAbsences = absences.reduce((s, a) => s + a.duree_heures, 0);
  const absencesNonJustifiees = absences.filter((a) => !a.justifiee).length;

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

      {/* Paiement vérifié — mis en avant */}
      <div className="bg-white rounded-xl border border-emerald-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Paiement vérifié
          </span>
          <span className="text-sm text-neutral-500">
            {MOIS_NOMS[paiement.mois]} {paiement.annee}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Montant</p>
            <p className="text-lg font-bold text-neutral-900">{paiement.montant.toLocaleString("fr-FR")} <span className="text-sm font-normal text-neutral-500">FCFA</span></p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Mode</p>
            <p className="text-sm font-medium text-neutral-700">
              {MODE_LABELS[paiement.mode ?? ""] ?? paiement.mode ?? "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Date</p>
            <p className="text-sm font-medium text-neutral-700">
              {paiement.date_paiement
                ? new Date(paiement.date_paiement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Reçu</p>
            {paiement.recu_numero ? (
              <a
                href={`/api/paiements/recu?paiement_id=${paiement.id}&print=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-500 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {paiement.recu_numero}
              </a>
            ) : <p className="text-sm text-neutral-400">--</p>}
          </div>
        </div>
      </div>

      {/* Notes / Moyennes par séquence */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Notes et moyennes</h2>
        </div>
        <div className="p-6">
          {sequences.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucune note disponible.</p>
          ) : (
            <div className="space-y-6">
              {sequences.map((seq) => {
                const { matieres, moyenneGenerale } = computeSequenceStats(notesBySequence[seq]);
                return (
                  <div key={seq}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-neutral-700">Séquence {seq}</h3>
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${moyenneGenerale >= 10 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        Moy. générale : {moyenneGenerale.toFixed(2)}/20
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-100 text-neutral-500 uppercase text-xs tracking-wider">
                            <th className="text-left px-3 py-2">Matière</th>
                            <th className="text-center px-3 py-2">Coeff.</th>
                            <th className="text-center px-3 py-2">Notes</th>
                            <th className="text-center px-3 py-2">Moyenne</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matieres.map((m) => (
                            <tr key={m.nom} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="px-3 py-2 font-medium text-neutral-900">{m.nom}</td>
                              <td className="px-3 py-2 text-center text-neutral-500">{m.coefficient}</td>
                              <td className="px-3 py-2 text-center text-neutral-500">
                                {m.notes.map((n, i) => (
                                  <span key={i} className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-neutral-100 text-xs text-neutral-600">
                                    {n.valeur}/20
                                  </span>
                                ))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`font-semibold text-sm ${m.moyenneCoeff >= 10 ? "text-emerald-600" : "text-red-500"}`}>
                                  {m.moyenneCoeff.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-right">
                      <a
                        href={`/api/bulletins/consulter?eleve_id=${eleve.id}&sequence=${seq}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                        Bulletin complet
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Absences récentes */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">Absences récentes</h2>
          {absences.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span>Total : <span className="font-semibold text-neutral-700">{totalAbsences}h</span></span>
              {absencesNonJustifiees > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                  {absencesNonJustifiees} non justifiée{absencesNonJustifiees > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-6">
          {absences.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucune absence enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-500 uppercase text-xs tracking-wider">
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Matière</th>
                    <th className="text-center px-3 py-2">Durée</th>
                    <th className="text-center px-3 py-2">Statut</th>
                    <th className="text-left px-3 py-2">Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map((a) => (
                    <tr key={a.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-3 py-2 text-neutral-700">
                        {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-900">{a.matiere.nom}</td>
                      <td className="px-3 py-2 text-center text-neutral-600">{a.duree_heures}h</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.justifiee ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {a.justifiee ? "Justifiée" : "Non justifiée"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-neutral-500 text-xs">{a.motif ?? "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <tr key={p.id} className={`border-b border-neutral-100 hover:bg-neutral-50 ${p.id === paiement_id ? "bg-emerald-50/40" : ""}`}>
                      <td className="px-3 py-2 font-medium text-neutral-900">
                        {MOIS_NOMS[p.mois]} {p.annee}
                        {p.id === paiement_id && (
                          <span className="ml-2 text-xs text-emerald-600 font-normal">actuel</span>
                        )}
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
