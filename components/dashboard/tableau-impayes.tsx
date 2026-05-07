"use client";

import { useState, useEffect } from "react";

interface Classe {
  id: string;
  nom: string;
  niveau: string;
}

interface EleveImpaye {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email_parent: string | null;
  telephone_parent: string | null;
  classe: Classe;
  mois_impayes: string[];
  nombre_mois_impayes: number;
  jours_retard: number;
}

type NiveauRetard = "tous" | "leger" | "moyen" | "critique";

function badgeRetard(jours: number) {
  if (jours >= 90)
    return <span className="dash-badge dash-badge-danger">Critique ({jours}j)</span>;
  if (jours >= 60)
    return <span className="dash-badge dash-badge-orange">Moyen ({jours}j)</span>;
  if (jours >= 30)
    return <span className="dash-badge dash-badge-warning">Léger ({jours}j)</span>;
  return <span className="dash-badge dash-badge-neutral">{jours}j</span>;
}

export function TableauImpayes() {
  const [eleves, setEleves] = useState<EleveImpaye[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtreClasse, setFiltreClasse] = useState("");
  const [filtreRetard, setFiltreRetard] = useState<NiveauRetard>("tous");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recherche, setRecherche] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function charger(classeId?: string) {
    setLoading(true);
    try {
      const url = classeId
        ? `/api/impayes/comptable?classe_id=${classeId}`
        : "/api/impayes/comptable";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEleves(data.eleves);
        setClasses(data.classes);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    charger(filtreClasse || undefined);
  }, [filtreClasse]);

  const filteredEleves = eleves.filter((e) => {
    if (filtreRetard === "leger" && !(e.jours_retard >= 30 && e.jours_retard < 60)) return false;
    if (filtreRetard === "moyen" && !(e.jours_retard >= 60 && e.jours_retard < 90)) return false;
    if (filtreRetard === "critique" && !(e.jours_retard >= 90)) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      return (
        e.nom.toLowerCase().includes(q) ||
        e.prenom.toLowerCase().includes(q) ||
        e.matricule.toLowerCase().includes(q) ||
        e.classe.nom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function toggleAll() {
    if (selected.size === filteredEleves.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredEleves.map((e) => e.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function envoyerRappel(ids: string[]) {
    const res = await fetch("/api/impayes/rappel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eleve_ids: ids }),
    });
    return res.ok ? await res.json() : null;
  }

  async function rappelIndividuel(id: string) {
    setSendingId(id);
    setMessage("");
    const result = await envoyerRappel([id]);
    if (result) {
      setMessage(`Rappel envoyé : ${result.notifications} notification(s), ${result.emails_envoyes} email(s).`);
    } else {
      setMessage("Erreur lors de l'envoi.");
    }
    setSendingId(null);
  }

  async function rappelGroupe() {
    if (selected.size === 0) return;
    setSending(true);
    setMessage("");
    const result = await envoyerRappel(Array.from(selected));
    if (result) {
      setMessage(
        `Rappels envoyés à ${result.total} élève(s) : ${result.notifications} notification(s), ${result.emails_envoyes} email(s)${result.emails_echoues > 0 ? `, ${result.emails_echoues} échec(s)` : ""}.`
      );
      setSelected(new Set());
    } else {
      setMessage("Erreur lors de l'envoi.");
    }
    setSending(false);
  }

  const totalImpayes = eleves.length;
  const critique = eleves.filter((e) => e.jours_retard >= 90).length;
  const moyen = eleves.filter((e) => e.jours_retard >= 60 && e.jours_retard < 90).length;
  const leger = eleves.filter((e) => e.jours_retard >= 30 && e.jours_retard < 60).length;

  return (
    <div className="space-y-5">
      {/* Stats KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total impayés", value: totalImpayes, accent: "#6366f1", gradient: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/30", filter: "tous" as NiveauRetard },
          { label: "Critique +90j", value: critique, accent: "#ef4444", gradient: "from-red-500 to-rose-600", shadow: "shadow-red-500/30", filter: "critique" as NiveauRetard },
          { label: "Moyen 60-89j", value: moyen, accent: "#f97316", gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-500/30", filter: "moyen" as NiveauRetard },
          { label: "Léger 30-59j", value: leger, accent: "#f59e0b", gradient: "from-amber-400 to-yellow-500", shadow: "shadow-amber-400/30", filter: "leger" as NiveauRetard },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFiltreRetard(filtreRetard === s.filter ? "tous" : s.filter)}
            className={`dash-kpi p-4 text-center w-full cursor-pointer ${filtreRetard === s.filter ? "ring-2 ring-indigo-400/30 !border-indigo-300/50" : ""}`}
            style={{ "--kpi-accent": s.accent } as React.CSSProperties}
          >
            <div className={`w-9 h-9 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.shadow} mb-3`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="dash-kpi-value">{s.value}</p>
            <p className="text-xs font-medium text-neutral-500 mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Liste + filtres */}
      <div className="dash-section">
        <div className="dash-section-header">
          <div className="flex items-center gap-3">
            <span className="dash-section-title">Liste des impayés</span>
            {!loading && <span className="dash-count">{filteredEleves.length} résultat(s)</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                data-search-input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
                className="dash-input w-48 pl-9"
              />
            </div>
            <select
              value={filtreClasse}
              onChange={(e) => setFiltreClasse(e.target.value)}
              className="dash-input w-auto px-3"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
              ))}
            </select>
            <select
              value={filtreRetard}
              onChange={(e) => setFiltreRetard(e.target.value as NiveauRetard)}
              className="dash-input w-auto px-3"
            >
              <option value="tous">Tous niveaux</option>
              <option value="leger">Léger (30-59j)</option>
              <option value="moyen">Moyen (60-89j)</option>
              <option value="critique">Critique (+90j)</option>
            </select>
            {(recherche || filtreClasse || filtreRetard !== "tous") && (
              <button
                onClick={() => { setRecherche(""); setFiltreClasse(""); setFiltreRetard("tous"); }}
                className="dash-btn-secondary text-xs"
              >
                Réinitialiser
              </button>
            )}
            <button
              onClick={rappelGroupe}
              disabled={sending || selected.size === 0}
              className="inline-flex items-center gap-2 h-[2.25rem] px-4 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm rounded-[0.625rem] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-px"
            >
              {sending ? "Envoi..." : `Rappels (${selected.size})`}
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {message && (
            <div className={`text-sm mb-4 px-4 py-2.5 rounded-xl font-medium ${message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="dash-spinner" />
              <p className="text-sm text-slate-500">Chargement...</p>
            </div>
          ) : filteredEleves.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm font-medium text-neutral-600">Aucun impayé pour ces critères</p>
              <p className="text-xs text-neutral-400 mt-1">Tous les paiements sont à jour.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-center w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === filteredEleves.length && filteredEleves.length > 0}
                        onChange={toggleAll}
                        className="rounded accent-indigo-500"
                      />
                    </th>
                    <th className="text-left">Élève</th>
                    <th className="text-center">Matricule</th>
                    <th className="text-center">Classe</th>
                    <th className="text-left">Mois impayé(s)</th>
                    <th className="text-center">Retard</th>
                    <th className="text-center">Contact</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEleves.map((e) => (
                    <tr key={e.id}>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(e.id)}
                          onChange={() => toggleOne(e.id)}
                          className="rounded accent-indigo-500"
                        />
                      </td>
                      <td className="font-semibold text-slate-800">{e.prenom} {e.nom}</td>
                      <td className="text-center font-mono text-xs text-indigo-500 font-semibold">{e.matricule}</td>
                      <td className="text-center">
                        <span className="dash-badge dash-badge-info">{e.classe.nom}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {e.mois_impayes.map((m) => (
                            <span key={m} className="dash-badge dash-badge-warning">{m}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-center">{badgeRetard(e.jours_retard)}</td>
                      <td className="text-center">
                        <div className="flex flex-col items-center gap-0.5 text-xs">
                          {e.email_parent && (
                            <span className="text-indigo-500 font-medium">Email</span>
                          )}
                          {e.telephone_parent && (
                            <a
                              href={`https://wa.me/${e.telephone_parent.replace(/\s/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              WhatsApp
                            </a>
                          )}
                          {!e.email_parent && !e.telephone_parent && (
                            <span className="text-neutral-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <button
                          disabled={sendingId === e.id}
                          onClick={() => rappelIndividuel(e.id)}
                          className="dash-btn-secondary text-xs disabled:opacity-50"
                        >
                          {sendingId === e.id ? "..." : "Rappel"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
