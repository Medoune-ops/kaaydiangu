"use client";

import { useState, useEffect, useCallback } from "react";

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

export function SaisieNotes() {
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

  // Charger les matieres du prof
  useEffect(() => {
    fetch("/api/professeur/matieres")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMatieres(data);
      });
  }, []);

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
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Parametres de l&apos;evaluation</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Matiere <span className="text-red-500">*</span></label>
              <select
                value={matiereId}
                onChange={(e) => setMatiereId(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Choisir une matiere</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} — {m.classe.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Type <span className="text-red-500">*</span></label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="CONTROLE">Controle</option>
                <option value="DEVOIR">Devoir</option>
                <option value="EXAMEN">Examen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Sequence <span className="text-red-500">*</span></label>
              <select
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Sequence {s}
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

            <div className="flex items-end">
              {selectedMatiere && (
                <span className="inline-flex items-center h-9 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-900">
                  {selectedMatiere.classe.nom} — Coef. {selectedMatiere.coefficient}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau de saisie */}
      {matiereId && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Saisie des notes — {selectedMatiere?.nom}
            </h3>
            {eleves.length > 0 && (
              <span className="text-sm text-neutral-500">
                {eleves.length} eleve(s)
              </span>
            )}
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
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium text-neutral-500 w-8">#</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium text-neutral-500">Matricule</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium text-neutral-500">Nom & Prenom</th>
                        <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-medium text-neutral-500 w-28">Note / 20</th>
                        <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-medium text-neutral-500 w-28">Moyenne</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eleves.map((eleve, index) => (
                        <tr key={eleve.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                          <td className="px-4 py-2 text-sm text-neutral-400">{index + 1}</td>
                          <td className="px-4 py-2 font-mono text-xs text-neutral-500">{eleve.matricule}</td>
                          <td className="px-4 py-2 text-sm font-medium text-neutral-900">
                            {eleve.nom} {eleve.prenom}
                          </td>
                          <td className="px-4 py-2">
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.25}
                                placeholder="--"
                                value={notesInput[eleve.id]?.valeur ?? ""}
                                onChange={(e) => handleNoteChange(eleve.id, e.target.value)}
                                className={`w-24 h-9 mx-auto block bg-neutral-50 border rounded-lg px-3 text-sm text-center text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                  notesInput[eleve.id]?.valeur !== "" && (Number(notesInput[eleve.id]?.valeur) < 0 || Number(notesInput[eleve.id]?.valeur) > 20)
                                    ? "border-red-400 bg-red-50"
                                    : "border-neutral-200"
                                }`}
                              />
                              {notesInput[eleve.id]?.valeur !== "" && (Number(notesInput[eleve.id]?.valeur) < 0 || Number(notesInput[eleve.id]?.valeur) > 20) && (
                                <p className="text-xs text-red-500 text-center mt-0.5">0-20</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {eleve.moyenne !== null ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                  eleve.moyenne >= 10
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {eleve.moyenne.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {message && (
                  <p
                    className={`mt-4 text-sm px-4 py-2 rounded-lg ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={loadEleves}
                    disabled={saving}
                    className="h-9 px-4 bg-white border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                  >
                    Recharger
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="h-9 px-4 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
                    )}
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
