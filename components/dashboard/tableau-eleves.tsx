"use client";

import { useState } from "react";

interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance?: string | Date | null;
  sexe?: string | null;
  adresse?: string | null;
  nom_parent?: string | null;
  telephone_parent?: string | null;
  email_parent?: string | null;
  actif: boolean;
  classe: { nom: string; niveau: string };
  user: { email: string };
}

function formatDate(d?: string | Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().substring(0, 10);
}

function ModalEdition({
  eleve,
  onClose,
  onSaved,
}: {
  eleve: Eleve;
  onClose: () => void;
  onSaved: (updated: Eleve) => void;
}) {
  const [form, setForm] = useState({
    nom: eleve.nom,
    prenom: eleve.prenom,
    date_naissance: formatDate(eleve.date_naissance),
    sexe: eleve.sexe ?? "",
    adresse: eleve.adresse ?? "",
    nom_parent: eleve.nom_parent ?? "",
    telephone_parent: eleve.telephone_parent ?? "",
    email_parent: eleve.email_parent ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/eleves/${eleve.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          date_naissance: form.date_naissance || null,
          sexe: form.sexe || null,
          adresse: form.adresse || null,
          nom_parent: form.nom_parent || null,
          telephone_parent: form.telephone_parent || null,
          email_parent: form.email_parent || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur serveur");
        return;
      }
      const updated = await res.json();
      onSaved({ ...eleve, ...updated });
      onClose();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-0.5">Modifier le dossier</p>
            <h2 className="text-base font-bold text-slate-800">{eleve.prenom} {eleve.nom}</h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">{eleve.matricule} · {eleve.classe.nom}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Identité */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Identité</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom</label>
                <input className="dash-input w-full" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prénom</label>
                <input className="dash-input w-full" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date de naissance</label>
                <input type="date" className="dash-input w-full" value={form.date_naissance} onChange={(e) => set("date_naissance", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sexe</label>
                <select className="dash-input w-full" value={form.sexe} onChange={(e) => set("sexe", e.target.value)}>
                  <option value="">—</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
                <input className="dash-input w-full" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Quartier, ville..." />
              </div>
            </div>
          </div>

          {/* Tuteur */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Tuteur / Parent</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom du tuteur</label>
                <input className="dash-input w-full" value={form.nom_parent} onChange={(e) => set("nom_parent", e.target.value)} placeholder="Prénom Nom" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                <input className="dash-input w-full" value={form.telephone_parent} onChange={(e) => set("telephone_parent", e.target.value)} placeholder="+221 77 000 00 00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input type="email" className="dash-input w-full" value={form.email_parent} onChange={(e) => set("email_parent", e.target.value)} placeholder="email@exemple.com" />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="dash-btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="dash-btn-primary flex-1 disabled:opacity-60">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TableauEleves({ eleves: initial }: { eleves: Eleve[] }) {
  const [eleves, setEleves] = useState(initial);
  const [recherche, setRecherche] = useState("");
  const [filtreClasse, setFiltreClasse] = useState("");
  const [eleveEdite, setEleveEdite] = useState<Eleve | null>(null);

  const classesUniques = Array.from(
    new Map(eleves.map((e) => [e.classe.nom, e.classe])).values()
  ).sort((a, b) => a.nom.localeCompare(b.nom));

  const elevesFiltres = eleves.filter((e) => {
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

  function handleSaved(updated: Eleve) {
    setEleves((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
  }

  if (eleves.length === 0) return null;

  return (
    <>
      {eleveEdite && (
        <ModalEdition
          eleve={eleveEdite}
          onClose={() => setEleveEdite(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="dash-section overflow-hidden">
        {/* Filtres */}
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
                className="dash-input w-64 pl-9"
              />
            </div>
            <select value={filtreClasse} onChange={(e) => setFiltreClasse(e.target.value)} className="dash-input w-auto px-3">
              <option value="">Toutes les classes</option>
              {classesUniques.map((c) => (
                <option key={c.nom} value={c.nom}>{c.nom} ({c.niveau})</option>
              ))}
            </select>
            {(recherche || filtreClasse) && (
              <button onClick={() => { setRecherche(""); setFiltreClasse(""); }} className="dash-btn-secondary text-xs">
                Réinitialiser
              </button>
            )}
            <span className="dash-count">{elevesFiltres.length} résultat(s)</span>
          </div>
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
                  <th className="text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {elevesFiltres.map((eleve) => (
                  <tr key={eleve.id}>
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
                    <td>
                      <button
                        onClick={() => setEleveEdite(eleve)}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
