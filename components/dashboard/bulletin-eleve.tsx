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
      const res = await fetch(
        `/api/bulletins/consulter?eleve_id=${eleveId}&sequence=${sequence}`
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erreur");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Erreur reseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Mes bulletins</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-500">
            Selectionnez une sequence pour consulter votre bulletin de notes.
          </p>
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Sequence</label>
              <select
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Sequence {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleConsulter}
              disabled={loading}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Chargement..." : "Consulter"}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {data && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100 bg-indigo-50">
            <div className="text-center space-y-1">
              <p className="font-bold text-indigo-700 text-base">{data.ecole}</p>
              <p className="text-sm text-indigo-500">
                Annee scolaire {data.annee_scolaire}
              </p>
              <p className="font-semibold text-neutral-900 pt-2 text-sm">
                Bulletin de notes -- Sequence {data.sequence}
              </p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Infos eleve */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm bg-neutral-50 rounded-lg p-4">
              <div>
                <span className="text-neutral-500">Nom :</span>{" "}
                <span className="font-medium text-neutral-900">
                  {data.eleve.prenom} {data.eleve.nom}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Matricule :</span>{" "}
                <span className="font-mono font-medium text-neutral-900">{data.eleve.matricule}</span>
              </div>
              <div>
                <span className="text-neutral-500">Classe :</span>{" "}
                <span className="font-medium text-neutral-900">{data.classe}</span>
              </div>
            </div>

            {/* Tableau des notes */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Matiere</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500 w-14">Coef.</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Notes</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500 w-16">Moy.</th>
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Appreciation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matieres.map((m, i) => (
                    <tr
                      key={m.nom}
                      className={`border-b border-neutral-100 ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}
                    >
                      <td className="px-3 py-2 text-sm font-medium text-neutral-900">{m.nom}</td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">{m.coefficient}</td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {m.notes.length > 0
                          ? m.notes.map((n) => n.valeur.toFixed(1)).join(" / ")
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {m.moyenne !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                              m.moyenne >= 10
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {m.moyenne.toFixed(2)}
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-neutral-500">
                        {m.appreciation || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resume */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-indigo-500">Moyenne generale</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {data.moyenneGenerale !== null
                    ? `${data.moyenneGenerale.toFixed(2)}/20`
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-500">Rang</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {data.rang}
                  {data.rang === 1 ? "er" : "eme"} / {data.totalEleves}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-500">Absences</p>
                <p className="text-2xl font-bold text-indigo-700">{data.totalAbsences}</p>
                <p className="text-sm text-neutral-500">{data.totalHeuresAbsences}h</p>
              </div>
              <div>
                <p className="text-sm text-indigo-500">Appreciation</p>
                <p className="text-sm font-medium text-neutral-500 mt-1">
                  {data.appreciationGenerale || "--"}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 text-center">
              Ce bulletin est consultable en ligne uniquement. Pour obtenir une
              version imprimable, adressez-vous au secretariat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
