"use client";

import { useState } from "react";

interface MatiereData {
  nom: string;
  coefficient: number;
  notes: { valeur: number; type: string }[];
  moyenne: number | null;
  appreciation: string | null;
}

interface BulletinJSON {
  ecole: string;
  annee_scolaire: string;
  eleve: { nom: string; prenom: string; matricule: string };
  classe: string;
  sequence: number;
  matieres: MatiereData[];
  moyenneGenerale: number | null;
  rang: number;
  totalEleves: number;
  appreciationGenerale: string | null;
  totalAbsences: number;
  totalHeuresAbsences: number;
}

export function BulletinEleve({
  eleveId,
}: {
  eleveId: string;
  matricule: string;
}) {
  const [sequence, setSequence] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<BulletinJSON | null>(null);

  async function handleConsulter() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/bulletins/consulter?eleve_id=${eleveId}&sequence=${sequence}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erreur");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Mes bulletins</span>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-neutral-500">
            Sélectionnez une séquence pour consulter votre bulletin de notes.
          </p>
          <div className="flex items-end gap-4">
            <div>
              <label className="dash-label">Séquence</label>
              <select
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="dash-input w-40"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>Séquence {s}</option>
                ))}
              </select>
            </div>
            <button onClick={handleConsulter} disabled={loading} className="dash-btn-primary">
              {loading && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
              {loading ? "Chargement..." : "Consulter"}
            </button>
          </div>
          {error && (
            <div className="text-sm px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-medium">
              {error}
            </div>
          )}
        </div>
      </div>

      {data && (
        <div className="dash-section overflow-hidden">
          {/* En-tête bulletin */}
          <div className="px-6 py-5 text-center bg-gradient-to-br from-indigo-50 to-violet-50/40 border-b border-indigo-100/60">
            <p className="font-extrabold text-indigo-700 text-base tracking-tight">{data.ecole}</p>
            <p className="text-sm text-indigo-500 mt-0.5">Année scolaire {data.annee_scolaire}</p>
            <p className="font-semibold text-slate-800 mt-2 text-sm">
              Bulletin de notes — Séquence {data.sequence}
            </p>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Infos élève */}
            <div className="dash-selected-item p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-indigo-500 text-xs font-bold uppercase tracking-wider">Élève</span>
                <p className="font-semibold text-slate-800 mt-0.5">{data.eleve.prenom} {data.eleve.nom}</p>
              </div>
              <div>
                <span className="text-indigo-500 text-xs font-bold uppercase tracking-wider">Matricule</span>
                <p className="font-mono font-semibold text-slate-800 mt-0.5">{data.eleve.matricule}</p>
              </div>
              <div>
                <span className="text-indigo-500 text-xs font-bold uppercase tracking-wider">Classe</span>
                <p className="font-semibold text-slate-800 mt-0.5">{data.classe}</p>
              </div>
            </div>

            {/* Tableau des notes */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Matière</th>
                    <th className="text-center w-14">Coef.</th>
                    <th className="text-center">Notes</th>
                    <th className="text-center w-20">Moy.</th>
                    <th className="text-left">Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matieres.map((m) => (
                    <tr key={m.nom}>
                      <td className="font-semibold text-slate-800">{m.nom}</td>
                      <td className="text-center text-slate-500">{m.coefficient}</td>
                      <td className="text-center font-mono text-xs text-slate-600">
                        {m.notes.length > 0 ? m.notes.map((n) => n.valeur.toFixed(1)).join(" / ") : "—"}
                      </td>
                      <td className="text-center">
                        {m.moyenne !== null ? (
                          <span className={`dash-badge ${m.moyenne >= 10 ? "dash-badge-info" : "dash-badge-danger"}`}>
                            {m.moyenne.toFixed(2)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="text-sm text-slate-500">{m.appreciation || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/40 p-3.5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Moy. générale</p>
                <p className="text-2xl font-extrabold text-indigo-700 tracking-tight">
                  {data.moyenneGenerale !== null ? `${data.moyenneGenerale.toFixed(2)}` : "—"}
                </p>
                <p className="text-xs text-indigo-400">/20</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/40 p-3.5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Rang</p>
                <p className="text-2xl font-extrabold text-indigo-700 tracking-tight">
                  {data.rang}<span className="text-sm">{data.rang === 1 ? "er" : "e"}</span>
                </p>
                <p className="text-xs text-indigo-400">/ {data.totalEleves} élèves</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/40 p-3.5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Absences</p>
                <p className="text-2xl font-extrabold text-indigo-700 tracking-tight">{data.totalAbsences}</p>
                <p className="text-xs text-indigo-400">{data.totalHeuresAbsences}h cumulées</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/40 p-3.5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Appréciation</p>
                <p className="text-sm font-semibold text-indigo-700 mt-2">{data.appreciationGenerale || "—"}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 text-center">
              Ce bulletin est consultable en ligne uniquement. Pour une version imprimable, adressez-vous au secrétariat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
