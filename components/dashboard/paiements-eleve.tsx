"use client";

import { useState } from "react";

interface PaiementItem {
  id: string;
  mois: number;
  annee: number;
  montant: number;
  statut: "PAYE" | "NON_PAYE";
  recu_numero: string | null;
  date_paiement: string | null;
  mode: string | null;
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

export function PaiementsEleve({ eleveId }: { eleveId: string }) {
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/paiements?eleve_id=${eleveId}`);
      if (res.ok) setPaiements(await res.json());
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  if (!loaded) load();

  const payes = paiements.filter((p) => p.statut === "PAYE");
  const nonPayes = paiements.filter((p) => p.statut === "NON_PAYE");

  return (
    <div className="dash-section overflow-hidden">
      <div className="dash-section-header">
        <span className="dash-section-title">Mes paiements</span>
        {loaded && paiements.length > 0 && <span className="dash-count">{paiements.length} mensualité(s)</span>}
      </div>
      <div className="px-6 py-5">
        {loading && !loaded && (
          <div className="flex items-center justify-center py-12">
            <div className="dash-spinner" />
          </div>
        )}

        {loaded && paiements.length === 0 && (
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <p className="text-sm font-medium text-neutral-600">Aucun paiement enregistré pour le moment.</p>
          </div>
        )}

        {loaded && paiements.length > 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Mois payés</p>
                <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">{payes.length}</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50/40 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Mois restants</p>
                <p className="text-3xl font-extrabold text-red-700 tracking-tight">{nonPayes.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Mois</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Montant</th>
                    <th className="text-center">Mode</th>
                    <th className="text-center">Date</th>
                    <th className="text-center">Reçu</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-800">{MOIS_NOMS[p.mois]} {p.annee}</td>
                      <td className="text-center">
                        <span className={`dash-badge ${p.statut === "PAYE" ? "dash-badge-success" : "dash-badge-danger"}`}>
                          {p.statut === "PAYE" ? "Payé" : "Non payé"}
                        </span>
                      </td>
                      <td className="text-center text-sm text-slate-600 font-medium">
                        {p.statut === "PAYE" ? `${p.montant.toLocaleString("fr-FR")} FCFA` : "—"}
                      </td>
                      <td className="text-center">
                        {p.mode ? <span className="dash-badge dash-badge-neutral">{MODE_LABELS[p.mode] || p.mode}</span> : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="text-center text-xs text-slate-500">
                        {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="text-center">
                        {p.statut === "PAYE" && p.recu_numero ? (
                          <a
                            href={`/api/paiements/recu?paiement_id=${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
