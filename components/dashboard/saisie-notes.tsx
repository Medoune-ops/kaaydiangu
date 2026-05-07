"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
  classe: { id: string; nom: string; niveau: string };
}

interface EleveNote {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  notes: { id: string; valeur: number; type: string; sequence: number }[];
  moyenne: number | null;
}

interface NoteInput {
  eleve_id: string;
  valeur: string;
  appreciation: string;
}

interface SaisieNotesProps {
  matieresApiUrl?: string;
}

export function SaisieNotes({ matieresApiUrl = "/api/professeur/matieres" }: SaisieNotesProps) {
  const { toast } = useToast();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [matiereId, setMatiereId] = useState("");
  const [type, setType] = useState<"CONTROLE" | "DEVOIR" | "EXAMEN">("CONTROLE");
  const [sequence, setSequence] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [eleves, setEleves] = useState<EleveNote[]>([]);
  const [notesInput, setNotesInput] = useState<Record<string, NoteInput>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Charger les matieres selon le role (prof ou censeur)
  useEffect(() => {
    fetch(matieresApiUrl)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMatieres(data);
      });
  }, [matieresApiUrl]);

  const selectedMatiere = matieres.find((m) => m.id === matiereId);

  // Charger les eleves quand matiere/sequence changent
  const loadEleves = useCallback(async () => {
    if (!selectedMatiere) return;

    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({
        classe_id: selectedMatiere.classe.id,
        matiere_id: matiereId,
        sequence: String(sequence),
      });
      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setEleves(data);
        // Pre-remplir les notes existantes
        const inputs: Record<string, NoteInput> = {};
        for (const eleve of data) {
          const existingNote = eleve.notes.find(
            (n: { type: string; sequence: number }) => n.type === type && n.sequence === sequence
          );
          inputs[eleve.id] = {
            eleve_id: eleve.id,
            valeur: existingNote ? String(existingNote.valeur) : "",
            appreciation: "",
          };
        }
        setNotesInput(inputs);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMatiere, matiereId, sequence, type]);

  useEffect(() => {
    if (matiereId && sequence) loadEleves();
  }, [matiereId, sequence, loadEleves]);

  function handleNoteChange(eleveId: string, valeur: string) {
    // Valider 0-20 avec decimales
    if (valeur !== "" && (isNaN(Number(valeur)) || Number(valeur) < 0 || Number(valeur) > 20)) {
      return;
    }
    setNotesInput((prev) => ({
      ...prev,
      [eleveId]: { ...prev[eleveId], valeur },
    }));
  }

  async function handleSubmit() {
    // Filtrer uniquement les eleves avec une note saisie
    const notesToSave = Object.values(notesInput)
      .filter((n) => n.valeur !== "")
      .map((n) => ({
        eleve_id: n.eleve_id,
        valeur: parseFloat(n.valeur),
        appreciation: n.appreciation || undefined,
      }));

    if (notesToSave.length === 0) {
      setMessage({ type: "error", text: "Aucune note saisie." });
      return;
    }

    // Validation des notes hors limites
    const notesInvalides = notesToSave.filter((n) => n.valeur < 0 || n.valeur > 20);
    if (notesInvalides.length > 0) {
      setMessage({ type: "error", text: "Certaines notes sont hors limites (0-20). Veuillez les corriger." });
      return;
    }

    // Confirmation avant enregistrement
    const confirmMsg = `Vous allez enregistrer ${notesToSave.length} note(s) pour ${selectedMatiere?.nom} (${type}, Sequence ${sequence}). Confirmer ?`;
    if (!confirm(confirmMsg)) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matiere_id: matiereId,
          type,
          sequence,
          date,
          notes: notesToSave,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erreur" });
        return;
      }

      setMessage({
        type: "success",
        text: `${data.saved} note(s) enregistree(s) avec succes`,
      });
      toast({ type: "success", title: "Notes enregistrees", description: `${data.saved} note(s) sauvegardee(s)` });

      // Mettre a jour les moyennes affichees
      if (data.moyennes) {
        setEleves((prev) =>
          prev.map((e) => {
            const moy = data.moyennes.find(
              (m: { eleve_id: string }) => m.eleve_id === e.id
            );
            return moy ? { ...e, moyenne: moy.moyenne } : e;
          })
        );
      }
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
          <span className="dash-section-title">Paramètres de l&apos;évaluation</span>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="dash-label">Matière <span className="text-red-400">*</span></label>
              <select
                value={matiereId}
                onChange={(e) => setMatiereId(e.target.value)}
                className="dash-input"
              >
                <option value="">Choisir une matière</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} — {m.classe.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="dash-label">Type <span className="text-red-400">*</span></label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="dash-input"
              >
                <option value="CONTROLE">Contrôle</option>
                <option value="DEVOIR">Devoir</option>
                <option value="EXAMEN">Examen</option>
              </select>
            </div>

            <div>
              <label className="dash-label">Séquence <span className="text-red-400">*</span></label>
              <select
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="dash-input"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>Séquence {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="dash-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="dash-input"
              />
            </div>

            <div className="flex items-end">
              {selectedMatiere && (
                <span className="dash-badge dash-badge-info h-auto py-1.5 px-3">
                  {selectedMatiere.classe.nom} — Coef. {selectedMatiere.coefficient}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau de saisie */}
      {matiereId && (
        <div className="dash-section overflow-hidden">
          <div className="dash-section-header">
            <span className="dash-section-title">Saisie des notes — {selectedMatiere?.nom}</span>
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
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left w-8">#</th>
                        <th className="text-left">Matricule</th>
                        <th className="text-left">Nom & Prénom</th>
                        <th className="text-center w-28">Note / 20</th>
                        <th className="text-center w-28">Moyenne</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eleves.map((eleve, index) => (
                        <tr key={eleve.id}>
                          <td className="text-xs text-neutral-400 font-medium">{index + 1}</td>
                          <td className="font-mono text-xs text-indigo-500 font-semibold">{eleve.matricule}</td>
                          <td className="font-semibold text-slate-800">{eleve.nom} {eleve.prenom}</td>
                          <td>
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.25}
                                placeholder="—"
                                value={notesInput[eleve.id]?.valeur ?? ""}
                                onChange={(e) => handleNoteChange(eleve.id, e.target.value)}
                                className={`w-24 mx-auto block text-center dash-input ${
                                  notesInput[eleve.id]?.valeur !== "" && (Number(notesInput[eleve.id]?.valeur) < 0 || Number(notesInput[eleve.id]?.valeur) > 20)
                                    ? "!border-red-400 !bg-red-50"
                                    : ""
                                }`}
                              />
                              {notesInput[eleve.id]?.valeur !== "" && (Number(notesInput[eleve.id]?.valeur) < 0 || Number(notesInput[eleve.id]?.valeur) > 20) && (
                                <p className="text-xs text-red-500 text-center mt-0.5">0-20</p>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            {eleve.moyenne !== null ? (
                              <span className={`dash-badge ${eleve.moyenne >= 10 ? "dash-badge-info" : "dash-badge-danger"}`}>
                                {eleve.moyenne.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {message && (
                  <div className={`mt-4 text-sm px-4 py-2.5 rounded-xl font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end mt-5 gap-3">
                  <button onClick={loadEleves} disabled={saving} className="dash-btn-secondary">
                    Recharger
                  </button>
                  <button onClick={handleSubmit} disabled={saving} className="dash-btn-primary">
                    {saving && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
                    {saving ? "Enregistrement..." : "Enregistrer les notes"}
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
