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
      select: { id: true, mois: true, annee: true, montant: true, mode: true, recu_numero: true, date_paiement: true },
    }),
    prisma.note.findMany({
      where: { eleve_id: eleve.id },
      select: { valeur: true, type: true, sequence: true, matiere: { select: { nom: true, coefficient: true } } },
      orderBy: [{ sequence: "asc" }, { matiere: { nom: "asc" } }],
    }),
    prisma.absence.findMany({
      where: { eleve_id: eleve.id },
      select: { id: true, date: true, duree_heures: true, justifiee: true, motif: true, matiere: { select: { nom: true } } },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.cours.findMany({
      where: { classe_id: eleve.classe_id },
      include: { matiere: { select: { nom: true } }, depose_par: { select: { nom: true, prenom: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  type NoteEntry = { valeur: number; type: string; matiere: { nom: string; coefficient: number } };
  const notesBySequence = notesRaw.reduce<Record<number, NoteEntry[]>>((acc, n) => {
    if (!acc[n.sequence]) acc[n.sequence] = [];
    acc[n.sequence].push(n);
    return acc;
  }, {});
  const sequences = Object.keys(notesBySequence).map(Number).sort((a, b) => a - b);

  type MatiereStats = { nom: string; coefficient: number; moyenneCoeff: number; notes: { valeur: number; type: string }[] };
  function computeSequenceStats(notes: NoteEntry[]): { matieres: MatiereStats[]; moyenneGenerale: number } {
    const byMatiere: Record<string, MatiereStats> = {};
    for (const n of notes) {
      if (!byMatiere[n.matiere.nom]) byMatiere[n.matiere.nom] = { nom: n.matiere.nom, coefficient: n.matiere.coefficient, moyenneCoeff: 0, notes: [] };
      byMatiere[n.matiere.nom].notes.push({ valeur: n.valeur, type: n.type });
    }
    const matieres = Object.values(byMatiere).map((m) => ({ ...m, moyenneCoeff: m.notes.reduce((s, x) => s + x.valeur, 0) / m.notes.length }));
    const totalCoeff = matieres.reduce((s, m) => s + m.coefficient, 0);
    const moyenneGenerale = totalCoeff > 0 ? matieres.reduce((s, m) => s + m.moyenneCoeff * m.coefficient, 0) / totalCoeff : 0;
    return { matieres, moyenneGenerale };
  }

  const totalHeures = absences.reduce((s, a) => s + a.duree_heures, 0);
  const absNJ = absences.filter((a) => !a.justifiee).length;
  const initials = `${eleve.prenom[0] ?? ""}${eleve.nom[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#f1f3f9]">

      {/* ── Hero élève ── */}
      <div className="relative bg-[#020c1b] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.10] blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/[0.08] blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="h-[3px] bg-gradient-to-r from-cyan-500 via-teal-400 to-transparent" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 relative z-10">
          {/* Badge vérification */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">Espace élève vérifié</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full scale-150" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-xl font-black text-cyan-300">
                {initials}
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {eleve.prenom} {eleve.nom}
              </h1>
              <p className="text-white/45 text-[14px] mt-1 font-medium">
                {eleve.classe.nom} · Matricule{" "}
                <span className="text-cyan-300 font-mono">{eleve.matricule}</span>
              </p>
            </div>
          </div>

          {/* Résumé rapide */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Paiements", value: tousLesPaiements.length, accent: "text-cyan-300" },
              { label: "Séquences", value: sequences.length, accent: "text-teal-300" },
              { label: "Absences", value: absences.length, accent: absNJ > 0 ? "text-rose-300" : "text-emerald-300" },
              { label: "Cours", value: cours.length, accent: "text-violet-300" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-center">
                <p className={`text-xl font-black tabular-nums ${s.accent}`}>{s.value}</p>
                <p className="text-white/35 text-[11px] font-medium mt-0.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Paiement vérifié */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-emerald-50/60 to-transparent">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <h2 className="text-[0.875rem] font-bold text-slate-800">Paiement vérifié</h2>
              <p className="text-[0.72rem] text-slate-400">{MOIS_NOMS[paiement.mois]} {paiement.annee}</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div>
              <p className="text-[0.68rem] font-semibold text-slate-400 uppercase tracking-wider mb-1">Montant</p>
              <p className="text-[1.2rem] font-black text-slate-900 tabular-nums">
                {paiement.montant.toLocaleString("fr-FR")}
                <span className="text-sm font-normal text-slate-400 ml-1">FCFA</span>
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] font-semibold text-slate-400 uppercase tracking-wider mb-1">Mode</p>
              <p className="text-sm font-semibold text-slate-700">{MODE_LABELS[paiement.mode ?? ""] ?? paiement.mode ?? "—"}</p>
            </div>
            <div>
              <p className="text-[0.68rem] font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-700">
                {paiement.date_paiement ? new Date(paiement.date_paiement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] font-semibold text-slate-400 uppercase tracking-wider mb-1">Reçu</p>
              {paiement.recu_numero ? (
                <a
                  href={`/api/eleve/public/${paiement.id}/recu?print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {paiement.recu_numero}
                </a>
              ) : <p className="text-sm text-slate-400">—</p>}
            </div>
          </div>
        </div>

        {/* Notes / Moyennes */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            <h2 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Notes et moyennes</h2>
          </div>
          <div className="p-6">
            {sequences.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune note disponible.</p>
            ) : (
              <div className="space-y-6">
                {sequences.map((seq) => {
                  const { matieres, moyenneGenerale } = computeSequenceStats(notesBySequence[seq]);
                  const ok = moyenneGenerale >= 10;
                  return (
                    <div key={seq}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[0.8125rem] font-bold text-slate-700">Séquence {seq}</span>
                        <span className={`text-[0.75rem] font-black px-3 py-1 rounded-lg border ${ok ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                          {moyenneGenerale.toFixed(2)}/20
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                              <th className="text-left px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Matière</th>
                              <th className="text-center px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em] w-16">Coef.</th>
                              <th className="text-center px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Notes</th>
                              <th className="text-center px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em] w-20">Moy.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matieres.map((m, i) => (
                              <tr key={m.nom} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                                <td className="px-4 py-2.5 font-semibold text-slate-800">{m.nom}</td>
                                <td className="px-4 py-2.5 text-center text-slate-400 text-xs font-mono">{m.coefficient}</td>
                                <td className="px-4 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1 flex-wrap">
                                    {m.notes.map((n, j) => (
                                      <span key={j} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                                        {n.valeur}/20
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className={`font-black text-[0.8125rem] ${m.moyenneCoeff >= 10 ? "text-emerald-600" : "text-red-500"}`}>
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
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
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

        {/* Absences */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-rose-500 to-pink-500" />
              <h2 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Absences récentes</h2>
            </div>
            {absences.length > 0 && (
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold">
                <span className="text-slate-400">{totalHeures}h total</span>
                {absNJ > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                    {absNJ} NJ
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="p-6">
            {absences.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm font-semibold text-slate-500">Aucune absence enregistrée</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Date</th>
                      <th className="text-left px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Matière</th>
                      <th className="text-center px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Durée</th>
                      <th className="text-center px-4 py-2.5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((a, i) => (
                      <tr key={a.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2.5 text-slate-600 text-[0.8125rem]">
                          {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{a.matiere.nom}</td>
                        <td className="px-4 py-2.5 text-center text-slate-500 font-mono text-xs">{a.duree_heures}h</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${a.justifiee ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                            {a.justifiee ? "Justifiée" : "Non justifiée"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reçus */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            <h2 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Reçus de paiement</h2>
            <span className="ml-auto text-[0.72rem] font-bold text-slate-400">{tousLesPaiements.length} paiement{tousLesPaiements.length > 1 ? "s" : ""}</span>
          </div>
          <div className="p-5">
            {tousLesPaiements.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucun reçu disponible.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tousLesPaiements.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-3.5 transition-all duration-200 ${
                      p.id === paiement_id
                        ? "border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-emerald-50/30 shadow-[0_2px_8px_rgba(16,185,129,0.10)]"
                        : "border-slate-200/60 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <p className="text-xs font-bold text-slate-700 leading-tight">{MOIS_NOMS[p.mois]}<br /><span className="font-normal text-slate-400">{p.annee}</span></p>
                      {p.id === paiement_id && (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] font-black text-slate-800 tabular-nums">{p.montant.toLocaleString("fr-FR")} F</p>
                    {p.recu_numero && (
                      <a
                        href={`/api/eleve/public/${p.id}/recu?print=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors mt-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Reçu PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cours */}
        {cours.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
              <h2 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Cours disponibles</h2>
              <span className="ml-auto text-[0.72rem] font-bold text-slate-400">{cours.length} document{cours.length > 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {cours.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[0.8125rem] text-slate-800 truncate">{c.titre}</span>
                      <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100/70">
                        {c.matiere.nom}
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-slate-400 mt-0.5">
                      {c.depose_par.prenom} {c.depose_par.nom} ·{" "}
                      {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <a
                    href={c.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 ml-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Télécharger
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs pb-4">
          Espace élève sécurisé · IREF — Système de gestion scolaire
        </p>
      </div>
    </div>
  );
}
