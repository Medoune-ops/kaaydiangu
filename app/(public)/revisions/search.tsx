"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface RevisionsSearchProps {
  classes: { id: string; nom: string; niveau: string }[];
  matieres: string[];
  currentMatiere?: string;
  currentClasse?: string;
}

const inputCls = "w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all";

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
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-7">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Matiere
          </label>
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
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Classe
          </label>
          <select
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
            className={inputCls}
          >
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
            className="h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Rechercher
          </button>
          {(matiere || classeId) && (
            <button
              onClick={handleReset}
              className="h-11 px-5 font-medium text-neutral-300 border border-white/[0.1] rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              Reinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
