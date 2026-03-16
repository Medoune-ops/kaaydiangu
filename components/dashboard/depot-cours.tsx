"use client";

import { useState, useRef } from "react";

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
    if (!file) {
      setMessage("Veuillez selectionner un fichier.");
      return;
    }
    if (!matiereId || !titre) {
      setMessage("Titre et matiere requis.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload du fichier
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload/cours", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setMessage(err.error || "Erreur lors de l'upload");
        return;
      }
      const { url } = await uploadRes.json();

      // 2. Creer le cours en base
      const res = await fetch("/api/cours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre,
          description,
          fichier_url: url,
          matiere_id: matiereId,
          classe_id: selectedMatiere!.classe.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "Erreur");
        return;
      }

      setMessage("Cours depose avec succes !");
      setTitre("");
      setDescription("");
      setMatiereId("");
      if (fileRef.current) fileRef.current.value = "";
      loadCours();
    } catch {
      setMessage("Erreur reseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce cours ?")) return;
    const res = await fetch(`/api/cours?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCours((prev) => prev.filter((c) => c.id !== id));
    }
  }

  // Charger les cours au premier rendu
  if (!loaded) loadCours();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Deposer un cours</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1">Matiere / Classe</label>
                <select
                  value={matiereId}
                  onChange={(e) => setMatiereId(e.target.value)}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  <option value="">Selectionner...</option>
                  {matieres.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom} -- {m.classe.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1">Titre</label>
                <input
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Chapitre 3 -- Les fonctions"
                  required
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resume du contenu..."
                rows={2}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Fichier (PDF, Word, Image -- max 10 Mo)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "Deposer le cours"}
            </button>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("succes") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Mes cours deposes</h2>
        </div>
        <div className="p-6">
          {cours.length === 0 ? (
            <p className="text-sm text-neutral-500">Aucun cours depose pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {cours.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-neutral-900">{c.titre}</span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-50 text-neutral-500">
                        {c.matiere.nom}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-50 text-neutral-500 border border-neutral-200">
                        {c.classe.nom}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-sm text-neutral-500">{c.description}</p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {new Date(c.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={c.fichier_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-500 hover:underline font-medium"
                    >
                      Voir
                    </a>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="h-9 px-4 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Supprimer
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
