"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/ui/toast";

interface Matiere {
  id: string;
  nom: string;
  classe: { id: string; nom: string; niveau: string };
}

interface CoursItem {
  id: string;
  titre: string;
  description: string | null;
  fichier_url: string;
  date: string;
  matiere: { nom: string };
  classe: { nom: string };
}

export function DepotCours({ matieres }: { matieres: Matiere[] }) {
  const { toast } = useToast();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [matiereId, setMatiereId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cours, setCours] = useState<CoursItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedMatiere = matieres.find((m) => m.id === matiereId);

  async function loadCours() {
    const res = await fetch("/api/cours");
    if (res.ok) setCours(await res.json());
    setLoaded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const file = fileRef.current?.files?.[0];
    if (!file) { setMessage("Veuillez sélectionner un fichier."); return; }
    if (!matiereId || !titre) { setMessage("Titre et matière requis."); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload/cours", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setMessage(err.error || "Erreur lors de l'upload");
        return;
      }
      const { url } = await uploadRes.json();

      const res = await fetch("/api/cours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre, description, fichier_url: url, matiere_id: matiereId, classe_id: selectedMatiere!.classe.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "Erreur");
        return;
      }

      setMessage("Cours déposé avec succès !");
      toast({ type: "success", title: "Cours déposé", description: titre });
      setTitre("");
      setDescription("");
      setMatiereId("");
      if (fileRef.current) fileRef.current.value = "";
      loadCours();
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce cours ?")) return;
    const res = await fetch(`/api/cours?id=${id}`, { method: "DELETE" });
    if (res.ok) setCours((prev) => prev.filter((c) => c.id !== id));
  }

  if (!loaded) loadCours();

  return (
    <div className="space-y-6">
      {/* Formulaire dépôt */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Déposer un cours</span>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Matière / Classe <span className="text-red-400">*</span></label>
                <select value={matiereId} onChange={(e) => setMatiereId(e.target.value)} className="dash-input" required>
                  <option value="">Sélectionner...</option>
                  {matieres.map((m) => (
                    <option key={m.id} value={m.id}>{m.nom} — {m.classe.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="dash-label">Titre <span className="text-red-400">*</span></label>
                <input
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Chapitre 3 — Les fonctions"
                  required
                  className="dash-input"
                />
              </div>
            </div>

            <div>
              <label className="dash-label">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Résumé du contenu..."
                rows={2}
                className="w-full bg-neutral-50/80 border border-[rgba(99,102,241,0.12)] rounded-[0.625rem] px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.1)] focus:border-[rgba(99,102,241,0.45)] transition-all"
              />
            </div>

            <div>
              <label className="dash-label">
                Fichier <span className="text-red-400">*</span>
                <span className="text-neutral-400 font-normal normal-case ml-1">(PDF, Word, Image — max 10 Mo)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="dash-input file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-indigo-600"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button type="submit" disabled={loading} className="dash-btn-primary">
                {loading && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
                {loading ? "Envoi en cours..." : "Déposer le cours"}
              </button>
              {message && (
                <span className={`text-sm font-medium ${message.includes("succès") ? "text-emerald-600" : "text-red-600"}`}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
          <span className="dash-section-title">Mes cours déposés</span>
          {cours.length > 0 && <span className="dash-count">{cours.length} cours</span>}
        </div>
        <div className="px-6 py-5">
          {cours.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <p className="text-sm font-medium text-neutral-600">Aucun cours déposé pour le moment.</p>
              <p className="text-xs text-neutral-400 mt-1">Utilisez le formulaire ci-dessus pour déposer votre premier cours.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cours.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-100 bg-gradient-to-r from-neutral-50/60 to-transparent p-4 hover:border-indigo-100 hover:from-indigo-50/30 transition-all duration-200">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800">{c.titre}</span>
                      <span className="dash-badge dash-badge-info">{c.matiere.nom}</span>
                      <span className="dash-badge dash-badge-neutral">{c.classe.nom}</span>
                    </div>
                    {c.description && <p className="text-sm text-neutral-500">{c.description}</p>}
                    <p className="text-xs text-neutral-400">
                      {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={c.fichier_url} target="_blank" rel="noopener noreferrer" className="dash-btn-secondary text-xs">
                      Voir
                    </a>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center h-8 px-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs rounded-lg font-semibold shadow-sm shadow-red-500/20 hover:shadow-red-500/35 hover:-translate-y-px transition-all"
                    >
                      Suppr.
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
