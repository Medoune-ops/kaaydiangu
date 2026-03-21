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
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-red-50 text-red-700">
        Critique ({jours}j)
      </span>
    );
  if (jours >= 60)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-orange-50 text-orange-700">
        Moyen ({jours}j)
      </span>
    );
  if (jours >= 30)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-yellow-50 text-yellow-700">
        Leger ({jours}j)
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-neutral-50 text-neutral-500">
      {jours}j
    </span>
  );
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

  // Filtrage par niveau de retard + recherche
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
      setMessage(
        `Rappel envoye : ${result.notifications} notification(s), ${result.emails_envoyes} email(s).`
      );
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
        `Rappels envoyes a ${result.total} eleve(s) : ${result.notifications} notification(s), ${result.emails_envoyes} email(s)${result.emails_echoues > 0 ? `, ${result.emails_echoues} echec(s)` : ""}.`
      );
      setSelected(new Set());
    } else {
      setMessage("Erreur lors de l'envoi.");
    }
    setSending(false);
  }

  // Stats
  const totalImpayes = eleves.length;
  const critique = eleves.filter((e) => e.jours_retard >= 90).length;
  const moyen = eleves.filter((e) => e.jours_retard >= 60 && e.jours_retard < 90).length;
  const leger = eleves.filter((e) => e.jours_retard >= 30 && e.jours_retard < 60).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors"
          onClick={() => setFiltreRetard("tous")}
        >
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-neutral-500">Total impayes</p>
            <p className="text-3xl font-bold text-neutral-900">{totalImpayes}</p>
          </div>
        </div>
        <div
          className="bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors"
          onClick={() => setFiltreRetard("critique")}
        >
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-red-600">Critique (+90j)</p>
            <p className="text-3xl font-bold text-red-700">{critique}</p>
          </div>
        </div>
        <div
          className="bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors"
          onClick={() => setFiltreRetard("moyen")}
        >
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-orange-600">Moyen (60-89j)</p>
            <p className="text-3xl font-bold text-orange-600">{moyen}</p>
          </div>
        </div>
        <div
          className="bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors"
          onClick={() => setFiltreRetard("leger")}
        >
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-yellow-600">Leger (30-59j)</p>
            <p className="text-3xl font-bold text-yellow-600">{leger}</p>
          </div>
        </div>
      </div>

      {/* Filtres + actions */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Liste des impayes
              {!loading && filteredEleves.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-neutral-100 text-neutral-500">
                  {filteredEleves.length} resultat(s)
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  data-search-input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher un eleve..."
                  className="h-9 w-56 bg-white border border-neutral-200 rounded-lg pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <select
                value={filtreClasse}
                onChange={(e) => setFiltreClasse(e.target.value)}
                className="h-9 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Toutes les classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.niveau})
                  </option>
                ))}
              </select>

              <select
                value={filtreRetard}
                onChange={(e) => setFiltreRetard(e.target.value as NiveauRetard)}
                className="h-9 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="tous">Tous les niveaux</option>
                <option value="leger">Leger (30-59j)</option>
                <option value="moyen">Moyen (60-89j)</option>
                <option value="critique">Critique (+90j)</option>
              </select>

              {(recherche || filtreClasse || filtreRetard !== "tous") && (
                <button
                  onClick={() => { setRecherche(""); setFiltreClasse(""); setFiltreRetard("tous"); }}
                  className="h-9 px-3 text-sm text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Reinitialiser
                </button>
              )}

              <button
                onClick={rappelGroupe}
                disabled={sending || selected.size === 0}
                className="h-9 px-4 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending
                  ? "Envoi..."
                  : `Envoyer rappels (${selected.size})`}
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          {message && (
            <p
              className={`text-sm mb-4 ${
                message.includes("Erreur") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              <p className="text-sm text-neutral-500">Chargement...</p>
            </div>
          ) : filteredEleves.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm text-neutral-500">Aucun eleve en retard de paiement pour ces criteres.</p>
              <p className="text-xs text-neutral-400 mt-1">Tous les paiements sont a jour.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-3 py-2 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === filteredEleves.length && filteredEleves.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Eleve</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Matricule</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Classe</th>
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mois impaye(s)</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Retard</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Contact</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEleves.map((e) => (
                    <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(e.id)}
                          onChange={() => toggleOne(e.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                        {e.prenom} {e.nom}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-sm text-neutral-500">
                        {e.matricule}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5">
                          {e.classe.nom}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {e.mois_impayes.map((m) => (
                            <span key={m} className="text-sm text-neutral-500 bg-neutral-50 rounded-md px-2 py-0.5">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {badgeRetard(e.jours_retard)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5 text-sm text-neutral-500">
                          {e.email_parent && (
                            <span title={e.email_parent}>
                              Email
                            </span>
                          )}
                          {e.telephone_parent && (
                            <a
                              href={`https://wa.me/${e.telephone_parent.replace(/\s/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              WhatsApp
                            </a>
                          )}
                          {!e.email_parent && !e.telephone_parent && <span className="text-neutral-400">--</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          disabled={sendingId === e.id}
                          onClick={() => rappelIndividuel(e.id)}
                          className="h-9 px-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
