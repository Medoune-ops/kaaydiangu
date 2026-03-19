"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface RevisionsSearchProps {
  classes: { id: string; nom: string; niveau: string }[];
  matieres: string[];
  currentMatiere?: string;
  currentClasse?: string;
}

const inputCls = "w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-[15px]";

export function RevisionsSearch({
  classes,
  matieres,
  currentMatiere,
  currentClasse,
}: RevisionsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [matiere, setMatiere] = useState(currentMatiere ?? "");
  const [classeId, setClasseId] = useState(currentClasse ?? "");

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (matiere) params.set("matiere", matiere);
    else params.delete("matiere");
    if (classeId) params.set("classe", classeId);
    else params.delete("classe");
    router.push(`/revisions?${params.toString()}`);
  }, [matiere, classeId, router, searchParams]);

  const handleReset = () => {
    setMatiere("");
    setClasseId("");
    router.push("/revisions");
  };

  return (
    <div className="gradient-border p-8">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-neutral-600 mb-2">Matiere</label>
          <input
            placeholder="Rechercher une matiere..."
            value={matiere}
            onChange={(e) => setMatiere(e.target.value)}
            list="matieres-list"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className={inputCls}
          />
          <datalist id="matieres-list">
            {matieres.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold text-neutral-600 mb-2">Classe</label>
          <select value={classeId} onChange={(e) => setClasseId(e.target.value)} className={inputCls}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.niveau})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-3">
          <button
            onClick={handleSearch}
            className="group relative h-12 px-6 rounded-xl text-white font-semibold overflow-hidden btn-primary"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500" />
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative">Rechercher</span>
          </button>
          {(matiere || classeId) && (
            <button
              onClick={handleReset}
              className="h-12 px-5 font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 btn-secondary"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
