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
  "", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Especes",
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
        <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
      </div>
    );
  if (!data) return <p className="text-sm text-red-500">Erreur de chargement.</p>;

  return (
    <div className="space-y-6">
      {/* BULLETINS */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Mes bulletins</h2>
        </div>
        <div className="p-6">
          {data.sequences.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aucun bulletin disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {data.sequences.map((seq) => (
                <div
                  key={seq}
                  className="border border-neutral-200 bg-neutral-50 rounded-lg p-4 text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Sequence {seq}
                  </p>
                  <a
                    href={`/api/bulletins/consulter?eleve_id=${data.eleveId}&sequence=${seq}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-indigo-500 hover:underline font-medium"
                  >
                    Consulter
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECUS DE PAIEMENT */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Mes recus de paiement</h2>
        </div>
        <div className="p-6">
          {data.paiements.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aucun recu disponible.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mois</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Montant</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mode</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Date de paiement</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">N Recu</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paiements.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                        {MOIS_NOMS[p.mois]} {p.annee}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {p.montant.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-50 text-neutral-500">
                          {MODE_LABELS[p.mode || ""] || p.mode || "--"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {p.date_paiement
                          ? new Date(p.date_paiement).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-sm text-neutral-500">
                        {p.recu_numero || "--"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.recu_numero ? (
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
          )}
        </div>
      </div>

      {/* MES COURS */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Mes cours</h2>
        </div>
        <div className="p-6">
          {data.cours.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aucun cours disponible pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {data.cours.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-neutral-900">{c.titre}</span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-50 text-neutral-500">
                        {c.matiere.nom}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-sm text-neutral-500 line-clamp-1">
                        {c.description}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400">
                      Par {c.depose_par.prenom} {c.depose_par.nom} --{" "}
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
                    Telecharger
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
