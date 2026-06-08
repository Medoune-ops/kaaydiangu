"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface ProfInfo {
  id: string;
  nom: string;
  prenom: string;
  fonction: string | null;
  age: number | null;
  diplome_academique: string | null;
  diplome_professionnel: string | null;
  numero_autorisation: string | null;
  telephone: string | null;
  classe_tenue: string | null;
  adresse: string | null;
}

type FormState = {
  nom: string;
  prenom: string;
  fonction: string;
  age: string;
  diplome_academique: string;
  diplome_professionnel: string;
  numero_autorisation: string;
  telephone: string;
  classe_tenue: string;
  adresse: string;
};

const EMPTY: FormState = {
  nom: "", prenom: "", fonction: "", age: "", diplome_academique: "",
  diplome_professionnel: "", numero_autorisation: "", telephone: "",
  classe_tenue: "", adresse: "",
};

export function RegistreProfesseurs() {
  const { toast } = useToast();
  const [profs, setProfs] = useState<ProfInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProf, setEditProf] = useState<ProfInfo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

  const fetchProfs = useCallback(() => {
    fetch("/api/admin/professeurs")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProfs(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProfs(); }, [fetchProfs]);

  const showMsg = (type: "success" | "error", text: string) => {
    toast({ type, title: type === "success" ? "Succès" : "Erreur", description: text });
  };

  const handleDelete = async (prof: ProfInfo) => {
    if (!confirm(`Supprimer la fiche de ${prof.prenom} ${prof.nom} ? Cette action est irréversible.`)) return;
    setDeleting(prof.id);
    const res = await fetch(`/api/admin/professeurs?id=${prof.id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      showMsg("success", `Fiche de ${prof.prenom} ${prof.nom} supprimée`);
      fetchProfs();
    } else {
      const data = await res.json().catch(() => ({}));
      showMsg("error", data.error || "Erreur");
    }
  };

  const filtered = profs.filter((p) => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      (p.fonction || "").toLowerCase().includes(q) ||
      (p.classe_tenue || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="dash-section overflow-hidden">
      <div className="dash-section-header">
        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <span className="dash-section-title">Registre des professeurs</span>
            <p className="text-xs text-neutral-500 mt-0.5">
              Fiches du personnel enseignant (sans compte de connexion). Seuls les noms apparaissent sur le site public.
            </p>
          </div>
        </div>
        <button onClick={() => { setEditProf(null); setShowModal(true); }} className="dash-btn-primary">
          + Nouveau professeur
        </button>
      </div>

      <div className="px-6 pt-4 flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un professeur..."
            className="dash-input pl-9 w-56"
          />
        </div>
        <span className="dash-count">{filtered.length} professeur(s)</span>
      </div>

      <div className="overflow-x-auto px-2 pb-2 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="dash-spinner" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Nom & prénom</th>
                <th className="text-left">Fonction</th>
                <th className="text-left">Classe tenue</th>
                <th className="text-left">Diplômes</th>
                <th className="text-left">N° autorisation</th>
                <th className="text-left">Contact</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-slate-800">
                    {p.prenom} {p.nom}
                    {p.age ? <span className="text-xs font-normal text-neutral-400"> · {p.age} ans</span> : null}
                  </td>
                  <td className="text-sm text-slate-500">{p.fonction || "—"}</td>
                  <td className="text-sm text-slate-500">{p.classe_tenue || "—"}</td>
                  <td className="text-sm text-slate-500">
                    {p.diplome_academique || p.diplome_professionnel ? (
                      <div className="flex flex-col gap-0.5">
                        {p.diplome_academique && <span className="text-xs"><span className="text-neutral-400">Acad. :</span> {p.diplome_academique}</span>}
                        {p.diplome_professionnel && <span className="text-xs"><span className="text-neutral-400">Prof. :</span> {p.diplome_professionnel}</span>}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="text-sm text-slate-500">{p.numero_autorisation || "—"}</td>
                  <td className="text-sm text-slate-500">{p.telephone || "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditProf(p); setShowModal(true); }} className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deleting === p.id}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {deleting === p.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-neutral-400">
                    Aucun professeur enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ProfesseurModal
          prof={editProf}
          onClose={() => { setShowModal(false); setEditProf(null); }}
          onSaved={(msg) => { showMsg("success", msg); fetchProfs(); setShowModal(false); setEditProf(null); }}
          onError={(msg) => showMsg("error", msg)}
        />
      )}
    </div>
  );
}

// ─── Modal création / modification ───

function ProfesseurModal({
  prof,
  onClose,
  onSaved,
  onError,
}: {
  prof: ProfInfo | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const isEdit = !!prof;
  const [form, setForm] = useState<FormState>(
    prof
      ? {
          nom: prof.nom,
          prenom: prof.prenom,
          fonction: prof.fonction || "",
          age: prof.age != null ? String(prof.age) : "",
          diplome_academique: prof.diplome_academique || "",
          diplome_professionnel: prof.diplome_professionnel || "",
          numero_autorisation: prof.numero_autorisation || "",
          telephone: prof.telephone || "",
          classe_tenue: prof.classe_tenue || "",
          adresse: prof.adresse || "",
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim()) { onError("Nom et prénom obligatoires"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/professeurs", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { id: prof.id, ...form } : form),
    });
    setSaving(false);
    if (res.ok) {
      onSaved(isEdit ? `Fiche de ${form.prenom} ${form.nom} modifiée` : `Professeur ${form.prenom} ${form.nom} ajouté`);
    } else {
      const data = await res.json().catch(() => ({}));
      onError(data.error || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="dash-section-header !rounded-none shrink-0">
          <span className="dash-section-title">{isEdit ? "Modifier le professeur" : "Nouveau professeur"}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-indigo-100/60 flex items-center justify-center text-neutral-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">Prénom <span className="text-red-400">*</span></label>
              <input type="text" required value={form.prenom} onChange={(e) => set("prenom", e.target.value)} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Nom <span className="text-red-400">*</span></label>
              <input type="text" required value={form.nom} onChange={(e) => set("nom", e.target.value)} className="dash-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">Fonction</label>
              <input type="text" value={form.fonction} onChange={(e) => set("fonction", e.target.value)} placeholder="Ex: Professeur de Mathématiques" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Âge</label>
              <input type="number" min={18} max={99} value={form.age} onChange={(e) => set("age", e.target.value)} className="dash-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">Diplôme académique</label>
              <input type="text" value={form.diplome_academique} onChange={(e) => set("diplome_academique", e.target.value)} placeholder="Ex: Licence, Master..." className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Diplôme professionnel</label>
              <input type="text" value={form.diplome_professionnel} onChange={(e) => set("diplome_professionnel", e.target.value)} placeholder="Ex: CAES, CAEM..." className="dash-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">N° autorisation d&apos;enseigner</label>
              <input type="text" value={form.numero_autorisation} onChange={(e) => set("numero_autorisation", e.target.value)} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Contact (téléphone)</label>
              <input type="tel" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="Ex: 77 123 45 67" className="dash-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">Classe tenue</label>
              <input type="text" value={form.classe_tenue} onChange={(e) => set("classe_tenue", e.target.value)} placeholder="Ex: 6ème A" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Adresse</label>
              <input type="text" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} className="dash-input" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="dash-btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="dash-btn-primary inline-flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
              {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
