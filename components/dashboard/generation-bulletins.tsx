"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer } from "lucide-react";

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
  const [printing, setPrinting] = useState<string | null>(null);

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
        alert(err.error || "Erreur lors de la génération");
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
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  async function printBulletin(eleveId: string) {
    setPrinting(eleveId);
    try {
      const res = await fetch(`/api/bulletins?eleve_id=${eleveId}&sequence=${sequence}`);
      if (!res.ok) { alert("Erreur lors de la génération"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) setTimeout(() => win.print(), 1200);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setPrinting(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Paramètres */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Paramètres</span>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="dash-label">Classe <span className="text-red-400">*</span></label>
              <select value={classeId} onChange={(e) => setClasseId(e.target.value)} className="dash-input">
                <option value="">Choisir une classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="dash-label">Séquence <span className="text-red-400">*</span></label>
              <select value={sequence} onChange={(e) => setSequence(Number(e.target.value))} className="dash-input">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>Séquence {s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {eleves.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={downloadAll} disabled={!!downloading || !!printing} className="dash-btn-secondary">
                    Télécharger tous
                  </button>
                  <button
                    onClick={async () => { for (const e of eleves) { await printBulletin(e.id); await new Promise(r => setTimeout(r, 600)); } }}
                    disabled={!!downloading || !!printing}
                    className="dash-btn-secondary flex items-center gap-1.5"
                  >
                    <Printer size={14} /> Imprimer tous
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des élèves */}
      {classeId && (
        <div className="dash-section overflow-hidden">
          <div className="dash-section-header">
            <span className="dash-section-title">Bulletins — Séquence {sequence}</span>
            {eleves.length > 0 && <span className="dash-count">{eleves.length} élève(s)</span>}
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="dash-spinner" />
              </div>
            ) : eleves.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <p className="text-sm font-medium text-neutral-600">Aucun élève dans cette classe.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Matricule</th>
                      <th className="text-left">Nom & Prénom</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.map((eleve) => (
                      <tr key={eleve.id}>
                        <td className="font-mono text-xs text-indigo-500 font-semibold">{eleve.matricule}</td>
                        <td className="font-semibold text-slate-800">{eleve.nom} {eleve.prenom}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => downloadBulletin(eleve.id, eleve.matricule)}
                              disabled={downloading === eleve.id || !!printing}
                              className="dash-btn-secondary text-xs disabled:opacity-50"
                            >
                              {downloading === eleve.id ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <div className="w-3 h-3 border-2 border-indigo-200 rounded-full animate-spin border-t-indigo-500" />
                                  Génération...
                                </span>
                              ) : "Télécharger PDF"}
                            </button>
                            <button
                              onClick={() => printBulletin(eleve.id)}
                              disabled={printing === eleve.id || !!downloading}
                              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {printing === eleve.id ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <div className="w-3 h-3 border-2 border-slate-200 rounded-full animate-spin border-t-slate-500" />
                                  Impression...
                                </span>
                              ) : (
                                <><Printer size={13} /> Imprimer</>
                              )}
                            </button>
                          </div>
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
