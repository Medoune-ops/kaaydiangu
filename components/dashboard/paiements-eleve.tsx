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
  ESPECES: "Especes",
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
    <div className="bg-white rounded-xl border border-neutral-200">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Mes paiements</h2>
      </div>
      <div className="p-6">
        {loading && !loaded && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
          </div>
        )}

        {loaded && paiements.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <p className="text-sm text-neutral-500">Aucun paiement enregistre pour le moment.</p>
          </div>
        )}

        {loaded && paiements.length > 0 && (
          <div className="space-y-4">
            {/* Resume */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-600">Mois payes</p>
                <p className="text-2xl font-bold text-green-700">{payes.length}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-sm text-red-600">Mois restants</p>
                <p className="text-2xl font-bold text-red-700">{nonPayes.length}</p>
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mois</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Statut</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Montant</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mode</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Date</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Recu</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100">
                      <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                        {MOIS_NOMS[p.mois]} {p.annee}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            p.statut === "PAYE"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {p.statut === "PAYE" ? "Paye" : "Non paye"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {p.statut === "PAYE"
                          ? `${p.montant.toLocaleString("fr-FR")} FCFA`
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {p.mode ? MODE_LABELS[p.mode] || p.mode : "--"}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {p.date_paiement
                          ? new Date(p.date_paiement).toLocaleDateString("fr-FR")
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.statut === "PAYE" && p.recu_numero ? (
                          <a
                            href={`/api/paiements/recu?paiement_id=${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Telecharger
                          </a>
                        ) : (
                          "--"
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
