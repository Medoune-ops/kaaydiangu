"use client";

import { useState, useEffect, useCallback } from "react";

interface Classe {
  id: string;
  nom: string;
  niveau: string;
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

  const alertes = stats.filter((s) => s.totalAbsences >= seuil);

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Classe</label>
              <select
                value={classeId}
                onChange={(e) => setClasseId(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Toutes les classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Date debut</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setClasseId(""); setDateDebut(""); setDateFin(""); }}
                className="h-9 px-4 bg-white border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Reinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("liste")}
          className={`h-9 px-4 text-sm font-medium rounded-lg transition-colors ${
            tab === "liste"
              ? "bg-indigo-500 text-white hover:bg-indigo-600"
              : "bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
          }`}
        >
          Liste des absences ({absences.length})
        </button>
        <button
          onClick={() => setTab("alertes")}
          className={`h-9 px-4 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
            tab === "alertes"
              ? "bg-indigo-500 text-white hover:bg-indigo-600"
              : "bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
          }`}
        >
          Alertes
          {alertes.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600">
              {alertes.length}
            </span>
          )}
        </button>
      </div>

      {tab === "liste" && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              </div>
            ) : absences.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm text-neutral-500">Aucune absence trouvee pour ces criteres.</p>
                <p className="text-xs text-neutral-400 mt-1">Modifiez les filtres pour affiner votre recherche.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Date</th>
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Eleve</th>
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Classe</th>
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Matiere</th>
                      <th className="text-center px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Heures</th>
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Motif</th>
                      <th className="text-center px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((a) => (
                      <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                        <td className="px-4 py-2 text-sm text-neutral-500">
                          {new Date(a.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-sm font-medium text-neutral-900">{a.eleve.nom} {a.eleve.prenom}</span>
                          <span className="block text-xs text-neutral-400 font-mono">{a.eleve.matricule}</span>
                        </td>
                        <td className="px-4 py-2 text-sm text-neutral-500">{a.eleve.classe.nom}</td>
                        <td className="px-4 py-2 text-sm text-neutral-500">{a.matiere.nom}</td>
                        <td className="px-4 py-2 text-center text-sm text-neutral-500">{a.duree_heures}h</td>
                        <td className="px-4 py-2 text-sm text-neutral-400">{a.motif || "—"}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => toggleJustifiee(a)} className="cursor-pointer">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                                a.justifiee
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {a.justifiee ? "Justifiee" : "Non justifiee"}
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
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Eleves ayant depasse le seuil d&apos;absences
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-500 whitespace-nowrap">Seuil :</label>
              <input
                type="number"
                min={1}
                value={seuil}
                onChange={(e) => setSeuil(Number(e.target.value))}
                className="w-20 h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="px-6 py-5">
            {!classeId ? (
              <div className="text-center py-12 text-sm text-neutral-500">
                Selectionnez une classe pour voir les alertes
              </div>
            ) : alertes.length === 0 ? (
              <div className="text-center py-12 text-sm text-green-600">
                Aucun eleve n&apos;a depasse le seuil de {seuil} absences
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Matricule</th>
                      <th className="text-left px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Nom & Prenom</th>
                      <th className="text-center px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Total absences</th>
                      <th className="text-center px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Heures cumulees</th>
                      <th className="text-center px-4 py-3 text-sm uppercase tracking-wider font-medium text-neutral-500">Non justifiees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertes
                      .sort((a, b) => b.totalAbsences - a.totalAbsences)
                      .map((s) => (
                        <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                          <td className="px-4 py-2 font-mono text-sm text-neutral-500">{s.matricule}</td>
                          <td className="px-4 py-2 text-sm font-medium text-neutral-900">
                            {s.nom} {s.prenom}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-50 text-red-600">
                              {s.totalAbsences}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-neutral-500">{s.totalHeures}h</td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                                s.nonJustifiees > 0
                                  ? "bg-red-50 text-red-600"
                                  : "bg-neutral-50 text-neutral-500"
                              }`}
                            >
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
    </div>
  );
}
