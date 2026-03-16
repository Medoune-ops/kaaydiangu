"use client";

import { useState, useEffect, useCallback } from "react";

interface Matiere {
  id: string;
  nom: string;
  classe: { id: string; nom: string; niveau: string };
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
}

interface AbsenceInput {
  eleve_id: string;
  absent: boolean;
  motif: string;
}

export function PointageAbsences() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [matiereId, setMatiereId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duree, setDuree] = useState(1);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [absencesInput, setAbsencesInput] = useState<Record<string, AbsenceInput>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedMatiere = matieres.find((m) => m.id === matiereId);

  useEffect(() => {
    fetch("/api/professeur/matieres")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMatieres(data); });
  }, []);

  const loadEleves = useCallback(async () => {
    if (!selectedMatiere) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/eleves?classe_id=${selectedMatiere.classe.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEleves(data);
        const inputs: Record<string, AbsenceInput> = {};
        for (const e of data) {
          inputs[e.id] = { eleve_id: e.id, absent: false, motif: "" };
        }
        setAbsencesInput(inputs);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMatiere]);

  useEffect(() => {
    if (matiereId) loadEleves();
  }, [matiereId, loadEleves]);

  function toggleAbsent(eleveId: string) {
    setAbsencesInput((prev) => ({
      ...prev,
      [eleveId]: { ...prev[eleveId], absent: !prev[eleveId].absent },
    }));
  }

  function setMotif(eleveId: string, motif: string) {
    setAbsencesInput((prev) => ({
      ...prev,
      [eleveId]: { ...prev[eleveId], motif },
    }));
  }

  const nbAbsents = Object.values(absencesInput).filter((a) => a.absent).length;

  async function handleSubmit() {
    const absents = Object.values(absencesInput)
      .filter((a) => a.absent)
      .map((a) => ({ eleve_id: a.eleve_id, motif: a.motif || undefined }));

    if (absents.length === 0) {
      setMessage({ type: "error", text: "Aucun eleve marque absent" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matiere_id: matiereId,
          date,
          duree_heures: duree,
          absences: absents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erreur" });
        return;
      }

      setMessage({
        type: "success",
        text: `${data.saved} absence(s) enregistree(s)`,
      });

      // Reinitialiser les checkboxes
      setAbsencesInput((prev) => {
        const reset = { ...prev };
        for (const key of Object.keys(reset)) {
          reset[key] = { ...reset[key], absent: false, motif: "" };
        }
        return reset;
      });
    } catch {
      setMessage({ type: "error", text: "Erreur reseau" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selecteurs */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Parametres du cours</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Matiere / Classe</label>
              <select
                value={matiereId}
                onChange={(e) => setMatiereId(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Choisir</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} — {m.classe.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Duree (heures)</label>
              <input
                type="number"
                min={1}
                max={4}
                value={duree}
                onChange={(e) => setDuree(Number(e.target.value))}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des eleves */}
      {matiereId && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Pointage — {selectedMatiere?.nom} ({selectedMatiere?.classe.nom})
            </h3>
            {nbAbsents > 0 && (
              <span className="text-sm font-medium text-red-600">
                {nbAbsents} absent(s)
              </span>
            )}
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              </div>
            ) : eleves.length === 0 ? (
              <div className="text-center py-12 text-sm text-neutral-500">Aucun eleve dans cette classe</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="text-center px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500 w-16">Absent</th>
                        <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Matricule</th>
                        <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Nom & Prenom</th>
                        <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Motif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eleves.map((eleve) => {
                        const input = absencesInput[eleve.id];
                        return (
                          <tr
                            key={eleve.id}
                            className={`border-b border-neutral-100 last:border-0 transition-colors ${
                              input?.absent ? "bg-red-50" : "hover:bg-neutral-50"
                            }`}
                          >
                            <td className="px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={input?.absent ?? false}
                                onChange={() => toggleAbsent(eleve.id)}
                                className="h-4 w-4 rounded border-neutral-300 text-indigo-500 focus:ring-indigo-500/20"
                              />
                            </td>
                            <td className="px-4 py-2 font-mono text-sm text-neutral-500">{eleve.matricule}</td>
                            <td className="px-4 py-2 text-sm font-medium text-neutral-900">
                              {eleve.nom} {eleve.prenom}
                            </td>
                            <td className="px-4 py-2">
                              {input?.absent && (
                                <input
                                  placeholder="Motif (optionnel)"
                                  value={input.motif}
                                  onChange={(e) => setMotif(eleve.id, e.target.value)}
                                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {message && (
                  <p
                    className={`mt-4 text-sm px-4 py-2 rounded-lg ${
                      message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={saving || nbAbsents === 0}
                    className="h-9 px-4 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Enregistrement..." : `Enregistrer ${nbAbsents} absence(s)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
