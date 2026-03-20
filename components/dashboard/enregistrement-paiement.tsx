"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface EleveResult {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  classe: { nom: string };
}

interface PaiementItem {
  id: string;
  mois: number;
  annee: number;
  montant: number;
  statut: "PAYE" | "NON_PAYE";
  recu_numero: string | null;
  date_paiement: string | null;
  mode: string | null;
}

const MOIS_NOMS = [
  "", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

function imprimerRecu(paiementId: string) {
  const url = `/api/paiements/recu?paiement_id=${paiementId}&print=1`;
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => {
      setTimeout(() => win.print(), 500);
    });
  }
}

export function EnregistrementPaiement() {
  const [query, setQuery] = useState("");
  const [resultats, setResultats] = useState<EleveResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedEleve, setSelectedEleve] = useState<EleveResult | null>(null);
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState(false);

  const [selectedPaiementId, setSelectedPaiementId] = useState("");
  const [montant, setMontant] = useState("");
  const [mode, setMode] = useState("ESPECES");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [lastRecu, setLastRecu] = useState<{ recu_numero: string; paiement_id: string } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rechercher = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResultats([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/paiements/recherche?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) setResultats(await res.json());
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEleve) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResultats([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      rechercher(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedEleve, rechercher]);

  async function selectEleve(eleve: EleveResult) {
    setSelectedEleve(eleve);
    setResultats([]);
    setQuery("");
    setMessage("");
    setLastRecu(null);
    setSelectedPaiementId("");
    setLoadingPaiements(true);
    try {
      const res = await fetch(`/api/paiements?eleve_id=${eleve.id}`);
      if (res.ok) setPaiements(await res.json());
    } finally {
      setLoadingPaiements(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLastRecu(null);

    if (!selectedPaiementId || !montant || !mode) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const selectedMois = nonPayes.find((p) => p.id === selectedPaiementId);
    const moisLabel = selectedMois ? `${MOIS_NOMS[selectedMois.mois]} ${selectedMois.annee}` : "";
    if (!confirm(`Confirmer le paiement de ${parseFloat(montant).toLocaleString("fr-FR")} FCFA pour ${selectedEleve!.prenom} ${selectedEleve!.nom} (${moisLabel}) ?`)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paiement_id: selectedPaiementId,
          montant: parseFloat(montant),
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Erreur");
        return;
      }

      setMessage(`Paiement enregistre ! Recu n ${data.recu_numero}`);
      setLastRecu({ recu_numero: data.recu_numero, paiement_id: selectedPaiementId });
      setSelectedPaiementId("");
      setMontant("");

      // Rafraichir la liste des paiements
      const refresh = await fetch(`/api/paiements?eleve_id=${selectedEleve!.id}`);
      if (refresh.ok) setPaiements(await refresh.json());
    } catch {
      setMessage("Erreur reseau");
    } finally {
      setSubmitting(false);
    }
  }

  const nonPayes = paiements.filter((p) => p.statut === "NON_PAYE");
  const payes = paiements.filter((p) => p.statut === "PAYE");

  return (
    <div className="space-y-6">
      {/* Recherche eleve */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Rechercher un eleve</h3>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  placeholder="Commencez a taper un nom, prenom ou matricule..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && rechercher(query)}
                  className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
                  </div>
                )}
              </div>
            </div>
            {query.trim().length > 0 && query.trim().length < 2 && (
              <p className="text-xs text-neutral-400 mt-1">Tapez au moins 2 caracteres...</p>
            )}
          </div>

          {resultats.length > 0 && (
            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
              {resultats.map((e) => (
                <button
                  key={e.id}
                  onClick={() => selectEleve(e)}
                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-sm text-neutral-900">{e.prenom} {e.nom}</span>
                    <span className="text-neutral-400 text-sm ml-2">-- {e.matricule}</span>
                  </div>
                  <span className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5">{e.classe.nom}</span>
                </button>
              ))}
            </div>
          )}

          {selectedEleve && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-neutral-900">
                  {selectedEleve.prenom} {selectedEleve.nom}
                </p>
                <p className="text-sm text-indigo-600">
                  {selectedEleve.matricule} -- {selectedEleve.classe.nom}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedEleve(null);
                  setPaiements([]);
                  setMessage("");
                  setLastRecu(null);
                }}
                className="h-9 px-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Changer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de paiement */}
      {selectedEleve && !loadingPaiements && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900">Enregistrer un paiement</h3>
          </div>
          <div className="px-6 py-4">
            {nonPayes.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  Tous les mois sont payes pour cet eleve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1.5">Mois a payer <span className="text-red-500">*</span></label>
                    <select
                      value={selectedPaiementId}
                      onChange={(e) => setSelectedPaiementId(e.target.value)}
                      className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    >
                      <option value="">Selectionner...</option>
                      {nonPayes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {MOIS_NOMS[p.mois]} {p.annee}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1.5">Montant (FCFA) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex: 25000"
                      className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1.5">Mode de paiement <span className="text-red-500">*</span></label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    >
                      <option value="ESPECES">Especes</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="VIREMENT">Virement</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
                    )}
                    {submitting ? "Enregistrement..." : "Valider le paiement"}
                  </button>
                  {lastRecu && (
                    <>
                      <a
                        href={`/api/paiements/recu?paiement_id=${lastRecu.paiement_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-500 hover:underline font-medium"
                      >
                        Telecharger le recu
                      </a>
                      <button
                        type="button"
                        onClick={() => imprimerRecu(lastRecu.paiement_id)}
                        className="h-9 px-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        Imprimer le recu
                      </button>
                    </>
                  )}
                </div>

                {message && (
                  <div
                    className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                      message.includes("enregistre")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.includes("enregistre") ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                    {message}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {loadingPaiements && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
          <p className="text-sm text-neutral-500">Chargement des paiements...</p>
        </div>
      )}

      {/* Historique des paiements */}
      {selectedEleve && payes.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900">Historique des paiements</h3>
          </div>
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mois</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Montant</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Mode</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Date</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Recu</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payes.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-3 py-2 text-sm text-neutral-900">
                        {MOIS_NOMS[p.mois]} {p.annee}
                      </td>
                      <td className="px-3 py-2 text-center text-sm font-medium text-neutral-900">
                        {p.montant.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5">
                          {p.mode?.replace("_", " ") || "--"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {p.date_paiement
                          ? new Date(p.date_paiement).toLocaleDateString("fr-FR")
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.recu_numero ? (
                          <a
                            href={`/api/paiements/recu?paiement_id=${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-500 hover:underline text-sm"
                          >
                            {p.recu_numero}
                          </a>
                        ) : (
                          <span className="text-sm text-neutral-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.recu_numero && (
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/api/paiements/recu?paiement_id=${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 hover:underline text-sm"
                            >
                              PDF
                            </a>
                            <button
                              onClick={() => imprimerRecu(p.id)}
                              className="text-sm text-neutral-500 hover:text-neutral-900 hover:underline"
                            >
                              Imprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
