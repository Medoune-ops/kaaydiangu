"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface AnneeScolaire {
  id: string;
  libelle: string;
  date_debut: string;
  date_fin: string;
  est_active: boolean;
  est_cloturee: boolean;
  _count: { classes: number; paiements: number; notes: number; absences: number };
}

export function GestionAnneesScolaires() {
  const { toast } = useToast();
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchAnnees = useCallback(() => {
    fetch("/api/admin/annees-scolaires")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAnnees(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAnnees(); }, [fetchAnnees]);

  const showMsg = (type: "success" | "error", text: string) => {
    toast({ type, title: type === "success" ? "Succès" : "Erreur", description: text });
  };

  const action = async (id: string, act: "activer" | "cloturer" | "rouvrir", libelle: string) => {
    const labels: Record<string, string> = {
      activer: `Activer l'année ${libelle} ? Elle deviendra l'année en cours et désactivera l'année active actuelle.`,
      cloturer: `Clôturer l'année ${libelle} ? Plus aucune donnée ne pourra y être ajoutée.`,
      rouvrir: `Rouvrir l'année ${libelle} ?`,
    };
    if (!confirm(labels[act])) return;
    setBusy(id);
    const res = await fetch("/api/admin/annees-scolaires", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: act }),
    });
    setBusy(null);
    if (res.ok) {
      showMsg("success", `Année ${libelle} : ${act === "activer" ? "activée" : act === "cloturer" ? "clôturée" : "rouverte"}`);
      fetchAnnees();
    } else {
      const data = await res.json().catch(() => ({}));
      showMsg("error", data.error || "Erreur");
    }
  };

  const handleDelete = async (annee: AnneeScolaire) => {
    if (!confirm(`Supprimer l'année ${annee.libelle} ? Cette action est irréversible.`)) return;
    setBusy(annee.id);
    const res = await fetch(`/api/admin/annees-scolaires?id=${annee.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      showMsg("success", `Année ${annee.libelle} supprimée`);
      fetchAnnees();
    } else {
      const data = await res.json().catch(() => ({}));
      showMsg("error", data.error || "Erreur");
    }
  };

  return (
    <div className="dash-section overflow-hidden">
      <div className="dash-section-header">
        <div>
          <span className="dash-section-title">Années scolaires</span>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gérez vos années scolaires : créez la suivante, activez-la et clôturez les anciennes. Une seule année est active à la fois.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="dash-btn-primary">
          + Nouvelle année
        </button>
      </div>

      <div className="overflow-x-auto px-2 pb-2 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="dash-spinner" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Année</th>
                <th className="text-left">Période</th>
                <th className="text-left">Statut</th>
                <th className="text-left">Données</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {annees.map((a) => {
                const total = a._count.classes + a._count.paiements + a._count.notes + a._count.absences;
                return (
                  <tr key={a.id}>
                    <td className="font-semibold text-slate-800">{a.libelle}</td>
                    <td className="text-sm text-slate-500">
                      {new Date(a.date_debut).toLocaleDateString("fr-FR")} → {new Date(a.date_fin).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      {a.est_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : a.est_cloturee ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-500">
                          Clôturée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-slate-500">
                      <span className="text-xs">
                        {a._count.classes} cl. · {a._count.paiements} paie. · {a._count.notes} notes
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!a.est_active && (
                          <button
                            onClick={() => action(a.id, "activer", a.libelle)}
                            disabled={busy === a.id}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            Activer
                          </button>
                        )}
                        {a.est_active && !a.est_cloturee && (
                          <button
                            onClick={() => action(a.id, "cloturer", a.libelle)}
                            disabled={busy === a.id}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            Clôturer
                          </button>
                        )}
                        {a.est_cloturee && (
                          <button
                            onClick={() => action(a.id, "rouvrir", a.libelle)}
                            disabled={busy === a.id}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            Rouvrir
                          </button>
                        )}
                        {!a.est_active && total === 0 && (
                          <button
                            onClick={() => handleDelete(a)}
                            disabled={busy === a.id}
                            className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {annees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-neutral-400">
                    Aucune année scolaire. Créez votre première année — elle deviendra active et rattachera automatiquement vos données existantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AnneeModal
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { showMsg("success", msg); fetchAnnees(); setShowModal(false); }}
          onError={(msg) => showMsg("error", msg)}
          estPremiere={annees.length === 0}
        />
      )}
    </div>
  );
}

// ─── Modal création ───

function AnneeModal({
  onClose,
  onSaved,
  onError,
  estPremiere,
}: {
  onClose: () => void;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
  estPremiere: boolean;
}) {
  // Suggestion : année scolaire courante basée sur la date du jour (oct → juin).
  const now = new Date();
  const anneeDebut = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const [libelle, setLibelle] = useState(`${anneeDebut}-${anneeDebut + 1}`);
  const [dateDebut, setDateDebut] = useState(`${anneeDebut}-10-01`);
  const [dateFin, setDateFin] = useState(`${anneeDebut + 1}-06-30`);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libelle.trim()) { onError("Le libellé est obligatoire"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/annees-scolaires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libelle, date_debut: dateDebut, date_fin: dateFin }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved(estPremiere
        ? `Année ${libelle} créée et activée — données existantes rattachées`
        : `Année ${libelle} créée`);
    } else {
      const data = await res.json().catch(() => ({}));
      onError(data.error || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-lg flex flex-col overflow-hidden">
        <div className="dash-section-header !rounded-none shrink-0">
          <span className="dash-section-title">Nouvelle année scolaire</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-indigo-100/60 flex items-center justify-center text-neutral-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {estPremiere && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-3.5 py-3 text-xs text-indigo-700">
              C&apos;est votre première année scolaire. Elle deviendra <strong>active</strong> et toutes vos
              données déjà saisies (classes, paiements…) y seront automatiquement rattachées.
            </div>
          )}

          <div>
            <label className="dash-label">Libellé <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Ex: 2025-2026"
              className="dash-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">Date de début</label>
              <input type="date" required value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Date de fin</label>
              <input type="date" required value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="dash-input" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="dash-btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="dash-btn-primary inline-flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
              {saving ? "Création..." : "Créer l'année"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
