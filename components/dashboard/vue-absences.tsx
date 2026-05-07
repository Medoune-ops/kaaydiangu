"use client";

import { useState, useEffect, useCallback } from "react";

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  matieres?: { id: string; nom: string }[];
}

interface Absence {
  id: string;
  date: string;
  duree_heures: number;
  justifiee: boolean;
  motif: string | null;
  eleve: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
    classe: { nom: string };
  };
  matiere: { nom: string };
}

interface StatEleve {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  totalAbsences: number;
  totalHeures: number;
  nonJustifiees: number;
}

const SEUIL_DEFAUT = 10;

export function VueAbsences({ classes }: { classes: Classe[] }) {
  const [classeId, setClasseId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [stats, setStats] = useState<StatEleve[]>([]);
  const [seuil, setSeuil] = useState(SEUIL_DEFAUT);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"liste" | "alertes">("liste");
  const [recherche, setRecherche] = useState("");
  const [filtreJustifiee, setFiltreJustifiee] = useState<"tous" | "justifiee" | "non_justifiee">("tous");

  const [showForm, setShowForm] = useState(false);
  const [formEleves, setFormEleves] = useState<{ id: string; nom: string; prenom: string; matricule: string }[]>([]);
  const [formClasseId, setFormClasseId] = useState("");
  const [formMatiereId, setFormMatiereId] = useState("");
  const [formEleveId, setFormEleveId] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDuree, setFormDuree] = useState(2);
  const [formMotif, setFormMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!formClasseId) {
      setFormEleves([]);
      return;
    }
    fetch(`/api/eleves?classe_id=${formClasseId}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setFormEleves(data.data);
        } else if (Array.isArray(data)) {
          setFormEleves(data);
        }
      })
      .catch(console.error);
  }, [formClasseId]);

  const loadAbsences = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classeId) params.set("classe_id", classeId);
      if (dateDebut) params.set("date_debut", dateDebut);
      if (dateFin) params.set("date_fin", dateFin);
      const res = await fetch(`/api/absences?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setAbsences(data);
    } finally {
      setLoading(false);
    }
  }, [classeId, dateDebut, dateFin]);

  const loadStats = useCallback(async () => {
    if (!classeId) { setStats([]); return; }
    try {
      const res = await fetch(`/api/absences/stats?classe_id=${classeId}`);
      const data = await res.json();
      if (Array.isArray(data)) setStats(data);
    } catch { /* ignore */ }
  }, [classeId]);

  useEffect(() => {
    loadAbsences();
    loadStats();
  }, [loadAbsences, loadStats]);

  async function toggleJustifiee(absence: Absence) {
    const res = await fetch("/api/absences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: absence.id, justifiee: !absence.justifiee }),
    });
    if (res.ok) loadAbsences();
  }

  async function handleSubmitAbsence(e: React.FormEvent) {
    e.preventDefault();
    if (!formMatiereId || !formEleveId || !formDate || !formDuree) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matiere_id: formMatiereId,
          date: new Date(formDate).toISOString(),
          duree_heures: Number(formDuree),
          absences: [{ eleve_id: formEleveId, motif: formMotif || null }],
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setFormEleveId("");
        setFormMotif("");
        loadAbsences();
        loadStats();
      } else {
        alert("Erreur lors de l'enregistrement de l'absence");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  }

  const alertes = stats.filter((s) => s.totalAbsences >= seuil);

  const absencesFiltrees = absences.filter((a) => {
    if (filtreJustifiee === "justifiee" && !a.justifiee) return false;
    if (filtreJustifiee === "non_justifiee" && a.justifiee) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      return (
        a.eleve.nom.toLowerCase().includes(q) ||
        a.eleve.prenom.toLowerCase().includes(q) ||
        a.eleve.matricule.toLowerCase().includes(q) ||
        a.eleve.classe.nom.toLowerCase().includes(q) ||
        a.matiere.nom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Filtres</span>
          {!loading && <span className="dash-count">{absencesFiltrees.length} résultat(s)</span>}
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="dash-label">Classe</label>
              <select value={classeId} onChange={(e) => setClasseId(e.target.value)} className="dash-input">
                <option value="">Toutes les classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="dash-label">Date début</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Date fin</label>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Statut</label>
              <select
                value={filtreJustifiee}
                onChange={(e) => setFiltreJustifiee(e.target.value as "tous" | "justifiee" | "non_justifiee")}
                className="dash-input"
              >
                <option value="tous">Toutes</option>
                <option value="justifiee">Justifiées</option>
                <option value="non_justifiee">Non justifiées</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                data-search-input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un élève, une matière..."
                className="dash-input pl-9 w-72"
              />
            </div>
            {(classeId || dateDebut || dateFin || recherche || filtreJustifiee !== "tous") && (
              <button
                onClick={() => { setClasseId(""); setDateDebut(""); setDateFin(""); setRecherche(""); setFiltreJustifiee("tous"); }}
                className="dash-btn-secondary text-xs"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Onglets + bouton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("liste")}
            className={tab === "liste" ? "dash-btn-primary" : "dash-btn-secondary"}
          >
            Liste ({absencesFiltrees.length})
          </button>
          <button
            onClick={() => setTab("alertes")}
            className={`${tab === "alertes" ? "dash-btn-primary" : "dash-btn-secondary"} inline-flex items-center gap-2`}
          >
            Alertes
            {alertes.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                {alertes.length}
              </span>
            )}
          </button>
        </div>
        <button onClick={() => setShowForm(true)} className="dash-btn-primary inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Signaler une absence
        </button>
      </div>

      {tab === "liste" && (
        <div className="dash-section overflow-hidden">
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="dash-spinner" />
              </div>
            ) : absencesFiltrees.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm font-medium text-neutral-600">Aucune absence pour ces critères.</p>
                <p className="text-xs text-neutral-400 mt-1">Modifiez les filtres pour affiner votre recherche.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Date</th>
                      <th className="text-left">Élève</th>
                      <th className="text-left">Classe</th>
                      <th className="text-left">Matière</th>
                      <th className="text-center">Heures</th>
                      <th className="text-left">Motif</th>
                      <th className="text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absencesFiltrees.map((a) => (
                      <tr key={a.id}>
                        <td className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString("fr-FR")}</td>
                        <td>
                          <span className="text-sm font-semibold text-slate-800">{a.eleve.nom} {a.eleve.prenom}</span>
                          <span className="block text-xs text-indigo-500 font-mono">{a.eleve.matricule}</span>
                        </td>
                        <td className="text-sm text-slate-500">{a.eleve.classe.nom}</td>
                        <td className="text-sm text-slate-600 font-medium">{a.matiere.nom}</td>
                        <td className="text-center">
                          <span className="dash-badge dash-badge-neutral">{a.duree_heures}h</span>
                        </td>
                        <td className="text-sm text-slate-400">{a.motif || "—"}</td>
                        <td className="text-center">
                          <button onClick={() => toggleJustifiee(a)}>
                            <span className={`dash-badge ${a.justifiee ? "dash-badge-info" : "dash-badge-danger"}`}>
                              {a.justifiee ? "Justifiée" : "Non justifiée"}
                            </span>
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

      {tab === "alertes" && (
        <div className="dash-section overflow-hidden">
          <div className="dash-section-header">
            <span className="dash-section-title">Élèves ayant dépassé le seuil d&apos;absences</span>
            <div className="flex items-center gap-2">
              <label className="dash-label !mb-0 whitespace-nowrap">Seuil :</label>
              <input
                type="number"
                min={1}
                value={seuil}
                onChange={(e) => setSeuil(Number(e.target.value))}
                className="dash-input w-20"
              />
            </div>
          </div>
          <div className="px-6 py-5">
            {!classeId ? (
              <div className="dash-empty">
                <p className="text-sm font-medium text-neutral-600">Sélectionnez une classe pour voir les alertes.</p>
              </div>
            ) : alertes.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm font-medium text-emerald-600">Aucun élève n&apos;a dépassé le seuil de {seuil} absences.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Matricule</th>
                      <th className="text-left">Nom & Prénom</th>
                      <th className="text-center">Total absences</th>
                      <th className="text-center">Heures cumulées</th>
                      <th className="text-center">Non justifiées</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertes
                      .sort((a, b) => b.totalAbsences - a.totalAbsences)
                      .map((s) => (
                        <tr key={s.id}>
                          <td className="font-mono text-xs text-indigo-500 font-semibold">{s.matricule}</td>
                          <td className="font-semibold text-slate-800">{s.nom} {s.prenom}</td>
                          <td className="text-center">
                            <span className="dash-badge dash-badge-danger">{s.totalAbsences}</span>
                          </td>
                          <td className="text-center text-sm text-slate-500">{s.totalHeures}h</td>
                          <td className="text-center">
                            <span className={`dash-badge ${s.nonJustifiees > 0 ? "dash-badge-danger" : "dash-badge-neutral"}`}>
                              {s.nonJustifiees}
                            </span>
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

      {/* Modal ajout d'absence */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-lg overflow-hidden">
            <div className="dash-section-header !rounded-none">
              <span className="dash-section-title">Signaler une absence</span>
              <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg hover:bg-indigo-100/60 flex items-center justify-center text-neutral-400 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmitAbsence} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Classe <span className="text-red-400">*</span></label>
                  <select
                    required
                    value={formClasseId}
                    onChange={(e) => { setFormClasseId(e.target.value); setFormMatiereId(""); setFormEleveId(""); }}
                    className="dash-input"
                  >
                    <option value="">Sélectionner</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dash-label">Matière <span className="text-red-400">*</span></label>
                  <select
                    required
                    disabled={!formClasseId}
                    value={formMatiereId}
                    onChange={(e) => setFormMatiereId(e.target.value)}
                    className="dash-input disabled:opacity-50"
                  >
                    <option value="">Sélectionner</option>
                    {classes.find(c => c.id === formClasseId)?.matieres?.map((m) => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="dash-label">Élève absent <span className="text-red-400">*</span></label>
                <select
                  required
                  disabled={!formClasseId || formEleves.length === 0}
                  value={formEleveId}
                  onChange={(e) => setFormEleveId(e.target.value)}
                  className="dash-input disabled:opacity-50"
                >
                  <option value="">Sélectionner un élève</option>
                  {formEleves.map((e) => (
                    <option key={e.id} value={e.id}>{e.nom} {e.prenom} ({e.matricule})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Date <span className="text-red-400">*</span></label>
                  <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="dash-input" />
                </div>
                <div>
                  <label className="dash-label">Durée (heures) <span className="text-red-400">*</span></label>
                  <input type="number" required min={1} max={8} value={formDuree} onChange={(e) => setFormDuree(Number(e.target.value))} className="dash-input" />
                </div>
              </div>

              <div>
                <label className="dash-label">Motif (optionnel)</label>
                <input
                  type="text"
                  value={formMotif}
                  onChange={(e) => setFormMotif(e.target.value)}
                  placeholder="Ex: Maladie, retard..."
                  className="dash-input"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
                <button type="button" onClick={() => setShowForm(false)} className="dash-btn-secondary">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="dash-btn-primary">
                  {submitting && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
