"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  actif: boolean;
  classe: { nom: string; niveau: string };
  user: { email: string };
}

export function TableauEleves({ eleves: elevesInitiaux }: { eleves: Eleve[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [eleves, setEleves] = useState<Eleve[]>(elevesInitiaux);
  const [recherche, setRecherche] = useState("");
  const [filtreClasse, setFiltreClasse] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<"tous" | "actif" | "inactif">("actif");
  const [busy, setBusy] = useState<string | null>(null);

  const classesUniques = Array.from(
    new Map(eleves.map((e) => [e.classe.nom, e.classe])).values()
  ).sort((a, b) => a.nom.localeCompare(b.nom));

  const elevesFiltres = eleves.filter((e) => {
    if (filtreStatut === "actif" && !e.actif) return false;
    if (filtreStatut === "inactif" && e.actif) return false;
    if (filtreClasse && e.classe.nom !== filtreClasse) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      return (
        e.nom.toLowerCase().includes(q) ||
        e.prenom.toLowerCase().includes(q) ||
        e.matricule.toLowerCase().includes(q) ||
        e.user.email.toLowerCase().includes(q) ||
        e.classe.nom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function toggleActif(eleve: Eleve) {
    const action = eleve.actif ? "désactiver" : "réactiver";
    const msg = eleve.actif
      ? `Désactiver ${eleve.prenom} ${eleve.nom} ? Il/elle ne sera plus comptabilisé(e) dans les listes actives.`
      : `Réactiver ${eleve.prenom} ${eleve.nom} ?`;
    if (!confirm(msg)) return;

    setBusy(eleve.id);
    const res = await fetch(`/api/eleves/${eleve.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !eleve.actif }),
    });
    setBusy(null);

    if (res.ok) {
      setEleves((prev) =>
        prev.map((e) => (e.id === eleve.id ? { ...e, actif: !e.actif } : e))
      );
      toast({
        type: "success",
        title: "Statut mis à jour",
        description: `${eleve.prenom} ${eleve.nom} ${eleve.actif ? "désactivé(e)" : "réactivé(e)"}`,
      });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ type: "error", title: "Erreur", description: data.error || `Impossible de ${action} l'élève` });
    }
  }

  if (eleves.length === 0) return null;

  const nbActifs = eleves.filter((e) => e.actif).length;
  const nbInactifs = eleves.filter((e) => !e.actif).length;

  return (
    <div className="dash-section overflow-hidden">
      <div className="dash-section-header">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Nom, prénom, matricule..."
              className="dash-input w-56 pl-9"
            />
          </div>
          <select
            value={filtreClasse}
            onChange={(e) => setFiltreClasse(e.target.value)}
            className="dash-input w-auto px-3"
          >
            <option value="">Toutes les classes</option>
            {classesUniques.map((c) => (
              <option key={c.nom} value={c.nom}>{c.nom} ({c.niveau})</option>
            ))}
          </select>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as "tous" | "actif" | "inactif")}
            className="dash-input w-auto px-3"
          >
            <option value="actif">Actifs ({nbActifs})</option>
            <option value="inactif">Inactifs ({nbInactifs})</option>
            <option value="tous">Tous ({eleves.length})</option>
          </select>
          {(recherche || filtreClasse) && (
            <button onClick={() => { setRecherche(""); setFiltreClasse(""); }} className="dash-btn-secondary text-xs">
              Réinitialiser
            </button>
          )}
          <span className="dash-count">{elevesFiltres.length} résultat(s)</span>
        </div>
        <Link href="/dashboard/censeur/eleves/nouveau" className="dash-btn-primary">
          + Inscrire un élève
        </Link>
      </div>

      {elevesFiltres.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <p className="text-sm font-medium text-neutral-600">Aucun élève trouvé</p>
          <p className="text-xs text-neutral-400 mt-1">Modifiez les filtres pour affiner la recherche.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left">Matricule</th>
                <th className="text-left">Nom & Prénom</th>
                <th className="text-left">Classe</th>
                <th className="text-left">Email</th>
                <th className="text-left">Statut</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {elevesFiltres.map((eleve) => (
                <tr key={eleve.id} className={!eleve.actif ? "opacity-60" : ""}>
                  <td className="font-mono text-xs text-indigo-500 font-semibold tracking-wide">{eleve.matricule}</td>
                  <td className="font-semibold text-slate-800">{eleve.nom} {eleve.prenom}</td>
                  <td>
                    <span className="dash-badge dash-badge-info">{eleve.classe.nom}</span>
                  </td>
                  <td className="text-slate-500 text-xs">{eleve.user.email}</td>
                  <td>
                    <span className={`dash-badge ${eleve.actif ? "dash-badge-success" : "dash-badge-danger"}`}>
                      {eleve.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => toggleActif(eleve)}
                      disabled={busy === eleve.id}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors ${
                        eleve.actif
                          ? "text-red-600 hover:bg-red-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {busy === eleve.id ? "..." : eleve.actif ? "Désactiver" : "Réactiver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
