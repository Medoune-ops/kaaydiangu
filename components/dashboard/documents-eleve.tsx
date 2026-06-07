"use client";

import { useState, useEffect } from "react";

interface Paiement {
  id: string;
  mois: number;
  annee: number;
  montant: number;
  mode: string | null;
  recu_numero: string | null;
  date_paiement: string | null;
}

interface Cours {
  id: string;
  titre: string;
  description: string | null;
  fichier_url: string;
  date: string;
  matiere: { nom: string };
  depose_par: { nom: string; prenom: string };
}

interface DocsData {
  eleveId: string;
  sequences: number[];
  paiements: Paiement[];
  cours: Cours[];
}

const MOIS_NOMS = [
  "Inscription", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement",
};

export function DocumentsEleve() {
  const [data, setData] = useState<DocsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/eleve/documents")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="dash-spinner" />
      </div>
    );
  if (!data) return <p className="text-sm text-red-500">Erreur de chargement.</p>;

  return (
    <div className="space-y-6">
      {/* BULLETINS */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Mes bulletins</span>
          {data.sequences.length > 0 && <span className="dash-count">{data.sequences.length} séquence(s)</span>}
        </div>
        <div className="px-6 py-5">
          {data.sequences.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              </div>
              <p className="text-sm font-medium text-neutral-600">Aucun bulletin disponible pour le moment.</p>
              <p className="text-xs text-neutral-400 mt-1">Les bulletins apparaîtront ici une fois générés par l&apos;administration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {data.sequences.map((seq) => (
                <div key={seq} className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/20 p-4 text-center space-y-2 hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-md shadow-indigo-500/25">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Séq. {seq}</p>
                  <a
                    href={`/api/bulletins/consulter?eleve_id=${data.eleveId}&sequence=${seq}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Consulter
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REÇUS DE PAIEMENT */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Mes reçus de paiement</span>
          {data.paiements.length > 0 && <span className="dash-count">{data.paiements.length} reçu(s)</span>}
        </div>
        <div className="px-6 py-5">
          {data.paiements.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <p className="text-sm font-medium text-neutral-600">Aucun reçu de paiement disponible.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Mois</th>
                    <th className="text-center">Montant</th>
                    <th className="text-center">Mode</th>
                    <th className="text-center">Date</th>
                    <th className="text-center">N° Reçu</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paiements.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-800">{MOIS_NOMS[p.mois]} {p.annee}</td>
                      <td className="text-center font-bold text-slate-800">{p.montant.toLocaleString("fr-FR")} FCFA</td>
                      <td className="text-center">
                        <span className="dash-badge dash-badge-neutral">{MODE_LABELS[p.mode || ""] || p.mode || "—"}</span>
                      </td>
                      <td className="text-center text-xs text-slate-500">
                        {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                      </td>
                      <td className="text-center font-mono text-sm text-slate-500">{p.recu_numero || "—"}</td>
                      <td className="text-center">
                        {p.recu_numero ? (
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={`/api/paiements/recu?paiement_id=${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              PDF
                            </a>
                            <button
                              onClick={() => { const w = window.open(`/api/paiements/recu?paiement_id=${p.id}`, "_blank"); if (w) setTimeout(() => w.print(), 1200); }}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                              Imprimer
                            </button>
                          </div>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MES COURS */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Mes cours</span>
          {data.cours.length > 0 && <span className="dash-count">{data.cours.length} cours</span>}
        </div>
        <div className="px-6 py-5">
          {data.cours.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <p className="text-sm font-medium text-neutral-600">Aucun cours disponible pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.cours.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-100 bg-gradient-to-r from-neutral-50/60 to-transparent p-4 hover:border-indigo-100 hover:from-indigo-50/20 transition-all duration-200">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800">{c.titre}</span>
                      <span className="dash-badge dash-badge-info">{c.matiere.nom}</span>
                    </div>
                    {c.description && <p className="text-sm text-neutral-500 line-clamp-1">{c.description}</p>}
                    <p className="text-xs text-neutral-400">
                      Par {c.depose_par.prenom} {c.depose_par.nom} —{" "}
                      {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <a
                    href={c.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-btn-secondary text-xs shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
