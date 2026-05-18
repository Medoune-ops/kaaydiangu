"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface RevisionsSearchProps {
  classes: { id: string; nom: string; niveau: string }[];
  matieres: string[];
  currentMatiere?: string;
  currentClasse?: string;
}

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
    <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_8px_32px_rgba(15,23,42,0.04)] p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <h3 className="font-bold text-neutral-900 text-[15px]">Rechercher un cours</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Matière input */}
        <div className="flex-1">
          <label className="block text-xs font-[700] text-slate-400 uppercase tracking-[0.09em] mb-2">
            Matière
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            </div>
            <input
              placeholder="Ex: Mathématiques, Français…"
              value={matiere}
              onChange={(e) => setMatiere(e.target.value)}
              list="matieres-list"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-[15px]"
            />
          </div>
          <datalist id="matieres-list">
            {matieres.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        {/* Classe select */}
        <div className="flex-1">
          <label className="block text-xs font-[700] text-slate-400 uppercase tracking-[0.09em] mb-2">
            Classe
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-[15px] appearance-none cursor-pointer"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} — {c.niveau}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-3">
          <button
            onClick={handleSearch}
            className="group relative h-12 px-7 rounded-xl text-white font-bold text-[15px] overflow-hidden shadow-sm"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500" />
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Rechercher
            </span>
          </button>
          {(matiere || classeId) && (
            <button
              onClick={handleReset}
              className="h-12 px-5 font-semibold text-neutral-500 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:text-neutral-700 transition-all text-[15px] flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
