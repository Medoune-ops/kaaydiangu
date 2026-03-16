"use client";

import { useState, useEffect, useCallback } from "react";

const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"] as const;
const JOURS_FR: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
};

const CRENEAUX = [
  { debut: "08:00", fin: "09:00" },
  { debut: "09:00", fin: "10:00" },
  { debut: "10:00", fin: "11:00" },
  { debut: "11:00", fin: "12:00" },
  { debut: "12:00", fin: "13:00" },
  { debut: "13:00", fin: "14:00" },
  { debut: "14:00", fin: "15:00" },
  { debut: "15:00", fin: "16:00" },
  { debut: "16:00", fin: "17:00" },
  { debut: "17:00", fin: "18:00" },
];

interface Classe {
  id: string;
  nom: string;
  niveau: string;
}

interface Matiere {
  id: string;
  nom: string;
  classe: { id: string; nom: string };
  professeur: { id: string; nom: string; prenom: string } | null;
}

interface Creneau {
  id: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string | null;
  matiere: {
    nom: string;
    professeur: { nom: string; prenom: string } | null;
  };
}

interface ModalData {
  jour: string;
  heure_debut: string;
  heure_fin: string;
  existing?: Creneau;
}

interface Props {
  classes: Classe[];
  matieres: Matiere[];
}

export function GestionEmploiDuTemps({ classes, matieres }: Props) {
  const [classeId, setClasseId] = useState("");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [formMatiereId, setFormMatiereId] = useState("");
  const [formSalle, setFormSalle] = useState("");
  const [saving, setSaving] = useState(false);

  // Matieres filtrees par classe selectionnee
  const matieresClasse = matieres.filter((m) => m.classe.id === classeId);

  const loadCreneaux = useCallback(async () => {
    if (!classeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/emplois-du-temps?classe_id=${classeId}`);
      const data = await res.json();
      if (Array.isArray(data)) setCreneaux(data);
    } finally {
      setLoading(false);
    }
  }, [classeId]);

  useEffect(() => {
    if (classeId) loadCreneaux();
    else setCreneaux([]);
  }, [classeId, loadCreneaux]);

  function getCreneau(jour: string, debut: string, fin: string) {
    return creneaux.find(
      (c) => c.jour === jour && c.heure_debut === debut && c.heure_fin === fin
    );
  }

  function openModal(jour: string, debut: string, fin: string) {
    const existing = getCreneau(jour, debut, fin);
    setModal({ jour, heure_debut: debut, heure_fin: fin, existing });
    setFormMatiereId("");
    setFormSalle(existing?.salle || "");
  }

  async function handleSave() {
    if (!formMatiereId || !modal) return;
    setSaving(true);
    try {
      const res = await fetch("/api/emplois-du-temps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classe_id: classeId,
          jour: modal.jour,
          heure_debut: modal.heure_debut,
          heure_fin: modal.heure_fin,
          matiere_id: formMatiereId,
          salle: formSalle || null,
        }),
      });
      if (res.ok) {
        setModal(null);
        await loadCreneaux();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!modal?.existing) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/emplois-du-temps?id=${modal.existing.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setModal(null);
        await loadCreneaux();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selecteur de classe */}
      <div className="max-w-xs">
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

      {classeId && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-5 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              </div>
            ) : (
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="w-20 p-2 text-sm uppercase tracking-wider font-medium text-neutral-400 border border-neutral-200 bg-neutral-50">
                      Heure
                    </th>
                    {JOURS.map((j) => (
                      <th
                        key={j}
                        className="p-2 text-sm uppercase tracking-wider font-medium text-neutral-500 border border-neutral-200 bg-neutral-50 min-w-[130px]"
                      >
                        {JOURS_FR[j]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRENEAUX.map((slot) => (
                    <tr key={slot.debut}>
                      <td className="p-2 text-sm text-center font-mono text-neutral-400 border border-neutral-200 bg-neutral-50 whitespace-nowrap">
                        {slot.debut}
                        <br />
                        {slot.fin}
                      </td>
                      {JOURS.map((jour) => {
                        const c = getCreneau(jour, slot.debut, slot.fin);
                        return (
                          <td
                            key={jour}
                            onClick={() => openModal(jour, slot.debut, slot.fin)}
                            className={`border border-neutral-200 p-1.5 cursor-pointer transition-colors align-top ${
                              c
                                ? "bg-indigo-50 hover:bg-indigo-100"
                                : "hover:bg-neutral-50"
                            }`}
                          >
                            {c ? (
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-indigo-600 leading-tight">
                                  {c.matiere.nom}
                                </p>
                                {c.matiere.professeur && (
                                  <p className="text-xs text-indigo-500">
                                    {c.matiere.professeur.prenom} {c.matiere.professeur.nom}
                                  </p>
                                )}
                                {c.salle && (
                                  <p className="text-xs text-neutral-400">
                                    Salle {c.salle}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-300">+</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                {JOURS_FR[modal.jour]} — {modal.heure_debut} a {modal.heure_fin}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Matiere & Professeur</label>
              <select
                value={formMatiereId}
                onChange={(e) => setFormMatiereId(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Selectionner</option>
                {matieresClasse.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                    {m.professeur
                      ? ` — ${m.professeur.prenom} ${m.professeur.nom}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Salle (optionnel)</label>
              <input
                placeholder="Ex: A12"
                value={formSalle}
                onChange={(e) => setFormSalle(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              {modal.existing && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="h-9 px-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={() => setModal(null)}
                className="h-9 px-4 bg-white border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!formMatiereId || saving}
                className="h-9 px-4 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {saving ? "..." : modal.existing ? "Modifier" : "Assigner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
