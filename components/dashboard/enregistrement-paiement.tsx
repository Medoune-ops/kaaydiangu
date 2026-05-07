"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";

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
  "Inscription", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
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
  const { toast } = useToast();
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
      toast({ type: "success", title: "Paiement enregistre", description: `Recu n ${data.recu_numero}` });
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

  const nonPayes = paiements.filter((p) => p.statut === "NON_PAYE" && p.mois !== 0);
  const payes = paiements.filter((p) => p.statut === "PAYE" && p.mois !== 0);

  return (
    <div className="space-y-6">
      {/* Recherche eleve */}
      <div className="dash-section">
        <div className="dash-section-header">
          <span className="dash-section-title">Rechercher un élève</span>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="relative">
            <div className="relative">
              <input
                placeholder="Commencez à taper un nom, prénom ou matricule..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && rechercher(query)}
                className="dash-input pl-10"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-200 rounded-full animate-spin border-t-indigo-500" />
                </div>
              )}
            </div>
            {query.trim().length > 0 && query.trim().length < 2 && (
              <p className="text-xs text-indigo-400 mt-1.5">Tapez au moins 2 caractères...</p>
            )}
          </div>

          {resultats.length > 0 && (
            <div className="dash-search-results">
              {resultats.map((e) => (
                <button
                  key={e.id}
                  onClick={() => selectEleve(e)}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{e.prenom} {e.nom}</span>
                    <span className="text-slate-400 text-xs ml-2 font-mono">{e.matricule}</span>
                  </div>
                  <span className="dash-badge dash-badge-info">{e.classe.nom}</span>
                </button>
              ))}
            </div>
          )}

          {selectedEleve && (
            <div className="dash-selected-item p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{selectedEleve.prenom} {selectedEleve.nom}</p>
                <p className="text-sm text-indigo-600 font-medium mt-0.5">
                  <span className="font-mono">{selectedEleve.matricule}</span> — {selectedEleve.classe.nom}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedEleve(null);
                  setPaiements([]);
                  setMessage("");
                  setLastRecu(null);
                }}
                className="dash-btn-secondary text-xs"
              >
                Changer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de paiement */}
      {selectedEleve && !loadingPaiements && (
        <div className="dash-section">
          <div className="dash-section-header">
            <span className="dash-section-title">Enregistrer un paiement</span>
          </div>
          <div className="px-6 py-5">
            {nonPayes.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm font-medium text-emerald-700">Tous les mois sont payés pour cet élève.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="dash-label">Mois à payer <span className="text-red-400">*</span></label>
                    <select
                      value={selectedPaiementId}
                      onChange={(e) => setSelectedPaiementId(e.target.value)}
                      className="dash-input"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {nonPayes.map((p) => (
                        <option key={p.id} value={p.id}>{MOIS_NOMS[p.mois]} {p.annee}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Montant (FCFA) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex: 25000"
                      className="dash-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="dash-label">Mode de paiement <span className="text-red-400">*</span></label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="dash-input"
                      required
                    >
                      <option value="ESPECES">Espèces</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="VIREMENT">Virement</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button type="submit" disabled={submitting} className="dash-btn-primary">
                    {submitting && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
                    {submitting ? "Enregistrement..." : "Valider le paiement"}
                  </button>
                  {lastRecu && (
                    <>
                      <a
                        href={`/api/paiements/recu?paiement_id=${lastRecu.paiement_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2"
                      >
                        Télécharger le reçu
                      </a>
                      <button
                        type="button"
                        onClick={() => imprimerRecu(lastRecu.paiement_id)}
                        className="dash-btn-secondary text-sm"
                      >
                        Imprimer le reçu
                      </button>
                    </>
                  )}
                </div>

                {message && (
                  <div className={`text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium ${message.includes("enregistre") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.includes("enregistre") ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
        <div className="dash-section">
          <div className="dash-section-header">
            <span className="dash-section-title">Historique des paiements</span>
            <span className="dash-count">{payes.length} paiement(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Mois</th>
                  <th className="text-center">Montant</th>
                  <th className="text-center">Mode</th>
                  <th className="text-center">Date</th>
                  <th className="text-center">Reçu</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
                <tbody>
                  {payes.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-800">{MOIS_NOMS[p.mois]} {p.annee}</td>
                      <td className="text-center font-bold text-slate-800">
                        {p.montant.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="text-center">
                        <span className="dash-badge dash-badge-neutral">{p.mode?.replace("_", " ") || "—"}</span>
                      </td>
                      <td className="text-center text-xs text-slate-500">
                        {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="text-center">
                        {p.recu_numero ? (
                          <a
                            href={`/api/paiements/recu?paiement_id=${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs underline underline-offset-2"
                          >
                            {p.recu_numero}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        {p.recu_numero && (
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/api/paiements/recu?paiement_id=${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="dash-btn-secondary text-xs"
                            >
                              PDF
                            </a>
                            <button
                              onClick={() => imprimerRecu(p.id)}
                              className="dash-btn-secondary text-xs"
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
      )}
    </div>
  );
}
