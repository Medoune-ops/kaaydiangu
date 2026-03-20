"use client";

import { useState, useEffect, useCallback } from "react";

interface Classe {
  id: string;
  nom: string;
  niveau: string;
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
}

export function GenerationBulletins({ classes }: { classes: Classe[] }) {
  const [classeId, setClasseId] = useState("");
  const [sequence, setSequence] = useState(1);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadEleves = useCallback(async () => {
    if (!classeId) { setEleves([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/eleves?classe_id=${classeId}`);
      const data = await res.json();
      if (Array.isArray(data)) setEleves(data);
    } finally {
      setLoading(false);
    }
  }, [classeId]);

  useEffect(() => { loadEleves(); }, [loadEleves]);

  async function downloadBulletin(eleveId: string, matricule: string) {
    setDownloading(eleveId);
    try {
      const res = await fetch(`/api/bulletins?eleve_id=${eleveId}&sequence=${sequence}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erreur lors de la generation");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulletin_${matricule}_seq${sequence}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAll() {
    for (const eleve of eleves) {
      await downloadBulletin(eleve.id, eleve.matricule);
      // Petit delai entre chaque pour ne pas surcharger
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Classe</label>
              <select
                value={classeId}
                onChange={(e) => setClasseId(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Choisir une classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.niveau})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Sequence</label>
              <select
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>Sequence {s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {eleves.length > 0 && (
                <button
                  onClick={downloadAll}
                  disabled={!!downloading}
                  className="h-9 px-4 bg-white border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                >
                  Telecharger tous les bulletins
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {classeId && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2">
              Bulletins — Sequence {sequence}
              {eleves.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-neutral-50 text-neutral-500">
                  {eleves.length} eleves
                </span>
              )}
            </h3>
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              </div>
            ) : eleves.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <p className="text-sm text-neutral-500">Aucun eleve dans cette classe.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Matricule</th>
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Nom & Prenom</th>
                      <th className="text-right px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.map((eleve) => (
                      <tr key={eleve.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                        <td className="px-4 py-2 font-mono text-sm text-neutral-500">{eleve.matricule}</td>
                        <td className="px-4 py-2 text-sm font-medium text-neutral-900">{eleve.nom} {eleve.prenom}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => downloadBulletin(eleve.id, eleve.matricule)}
                            disabled={downloading === eleve.id}
                            className="h-9 px-4 bg-white border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                          >
                            {downloading === eleve.id ? "Generation..." : "Telecharger PDF"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
