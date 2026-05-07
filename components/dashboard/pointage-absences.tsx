"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

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
  const { toast } = useToast();
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
      toast({ type: "success", title: "Absences enregistrees", description: `${data.saved} absence(s) sauvegardee(s)` });

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
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Paramètres du cours</span>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="dash-label">Matière / Classe <span className="text-red-400">*</span></label>
              <select
                value={matiereId}
                onChange={(e) => setMatiereId(e.target.value)}
                className="dash-input"
              >
                <option value="">Choisir</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>{m.nom} — {m.classe.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="dash-label">Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="dash-input"
              />
            </div>
            <div>
              <label className="dash-label">Durée (heures)</label>
              <input
                type="number"
                min={1}
                max={4}
                value={duree}
                onChange={(e) => setDuree(Number(e.target.value))}
                className="dash-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des eleves */}
      {matiereId && (
        <div className="dash-section overflow-hidden">
          <div className="dash-section-header">
            <span className="dash-section-title">
              Pointage — {selectedMatiere?.nom} ({selectedMatiere?.classe.nom})
            </span>
            {nbAbsents > 0 && (
              <span className="dash-badge dash-badge-danger">{nbAbsents} absent(s)</span>
            )}
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
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-center w-16">Absent</th>
                        <th className="text-left">Matricule</th>
                        <th className="text-left">Nom & Prénom</th>
                        <th className="text-left">Motif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eleves.map((eleve) => {
                        const input = absencesInput[eleve.id];
                        return (
                          <tr
                            key={eleve.id}
                            className={`transition-colors ${
                              input?.absent ? "!bg-red-50/60" : ""
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
                  <div className={`mt-4 text-sm px-4 py-2.5 rounded-xl font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end mt-5">
                  <button
                    onClick={handleSubmit}
                    disabled={saving || nbAbsents === 0}
                    className="dash-btn-primary"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
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
