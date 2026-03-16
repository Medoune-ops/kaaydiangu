"use client";

import { useState } from "react";

interface CoursItem {
  id: string;
  titre: string;
  description: string | null;
  fichier_url: string;
  date: string;
  matiere: { nom: string };
  classe: { nom: string };
  depose_par: { nom: string; prenom: string };
}

export function CoursEleve() {
  const [cours, setCours] = useState<CoursItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadCours() {
    setLoading(true);
    try {
      const res = await fetch("/api/cours");
      if (res.ok) setCours(await res.json());
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  if (!loaded) loadCours();

  return (
    <div className="bg-white rounded-xl border border-neutral-200">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Cours de ma classe</h2>
      </div>
      <div className="p-6">
        {loading && !loaded && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
          </div>
        )}
        {loaded && cours.length === 0 && (
          <p className="text-sm text-neutral-500">Aucun cours disponible pour le moment.</p>
        )}
        {cours.length > 0 && (
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
                  </div>
                  {c.description && (
                    <p className="text-sm text-neutral-500">{c.description}</p>
                  )}
                  <p className="text-xs text-neutral-400">
                    Par {c.depose_par.prenom} {c.depose_par.nom} --{" "}
                    {new Date(c.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <a
                  href={c.fichier_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-500 hover:underline shrink-0 font-medium"
                >
                  Consulter
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
