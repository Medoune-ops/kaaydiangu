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

function imprimerRecu(paiementId: string) {
  const url = `/api/paiements/recu?paiement_id=${paiementId}&print=1`;
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => {
      setTimeout(() => win.print(), 500);
    });
  }
}

export function EnregistrementInscription() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [resultats, setResultats] = useState<EleveResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedEleve, setSelectedEleve] = useState<EleveResult | null>(null);
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState(false);

  const [montant, setMontant] = useState("");
  const [mode, setMode] = useState("ESPECES");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [lastRecu, setLastRecu] = useState<{ recu_numero: string; paiement_id: string } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rechercher = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResultats([]); return; }
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
    if (query.trim().length < 2) { setResultats([]); return; }
    debounceRef.current = setTimeout(() => rechercher(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selectedEleve, rechercher]);

  async function selectEleve(eleve: EleveResult) {
    setSelectedEleve(eleve);
    setResultats([]);
    setQuery("");
    setMessage("");
    setLastRecu(null);
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

    const inscriptionPaiement = nonPayes[0];
    if (!inscriptionPaiement || !montant || !mode) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!confirm(`Confirmer l'encaissement de l'inscription (${parseFloat(montant).toLocaleString("fr-FR")} FCFA) pour ${selectedEleve!.prenom} ${selectedEleve!.nom} ?`)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paiement_id: inscriptionPaiement.id, montant: parseFloat(montant), mode }),
      });

      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Erreur"); return; }

      setMessage(`Inscription enregistrée ! Reçu n° ${data.recu_numero}`);
      toast({ type: "success", title: "Inscription enregistrée", description: `Reçu n° ${data.recu_numero}` });
      setLastRecu({ recu_numero: data.recu_numero, paiement_id: inscriptionPaiement.id });
      setMontant("");

      const refresh = await fetch(`/api/paiements?eleve_id=${selectedEleve!.id}`);
      if (refresh.ok) setPaiements(await refresh.json());
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  const nonPayes = paiements.filter((p) => p.statut === "NON_PAYE" && p.mois === 0);
  const payes = paiements.filter((p) => p.statut === "PAYE" && p.mois === 0);

  return (
    <div className="space-y-6">
      {/* Recherche élève */}
      <div className="dash-section">
        <div className="dash-section-header">
          <span className="dash-section-title">Rechercher un élève</span>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="relative">
            <input
              placeholder="Nom, prénom ou matricule..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="dash-input pl-10"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-200 rounded-full animate-spin border-t-indigo-500" />
              </div>
            )}
          </div>

          {resultats.length > 0 && (
            <div className="dash-search-results">
              {resultats.map((e) => (
                <button key={e.id} onClick={() => selectEleve(e)} className="flex items-center justify-between">
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
              <button onClick={() => { setSelectedEleve(null); setPaiements([]); setMessage(""); setLastRecu(null); }} className="dash-btn-secondary text-xs">
                Changer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statut & formulaire */}
      {selectedEleve && !loadingPaiements && (
        <div className="dash-section overflow-hidden">
          <div className="dash-section-header">
            <span className="dash-section-title">Statut inscription</span>
            {payes.length > 0 ? (
              <span className="dash-badge dash-badge-success">Payée</span>
            ) : (
              <span className="dash-badge dash-badge-danger">Non payée</span>
            )}
          </div>
          <div className="px-6 py-5">
            {nonPayes.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="dash-label">Montant inscription (FCFA) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex: 50 000"
                      className="dash-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="dash-label">Mode de règlement <span className="text-red-400">*</span></label>
                    <select value={mode} onChange={(e) => setMode(e.target.value)} className="dash-input">
                      <option value="ESPECES">Espèces</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="VIREMENT">Virement</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button type="submit" disabled={submitting} className="dash-btn-primary">
                    {submitting && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
                    {submitting ? "Enregistrement..." : "Confirmer l'inscription"}
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
                      <button type="button" onClick={() => imprimerRecu(lastRecu.paiement_id)} className="dash-btn-secondary text-sm">
                        Imprimer le reçu
                      </button>
                    </>
                  )}
                </div>
                {message && (
                  <div className={`text-sm px-4 py-2.5 rounded-xl font-medium ${message.includes("enregistr") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message}
                  </div>
                )}
              </form>
            ) : (
              payes.map((p) => (
                <div key={p.id} className="dash-selected-item p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-indigo-500 uppercase font-bold tracking-wider mb-0.5">Encaissé le</p>
                    <p className="text-sm font-semibold text-slate-800">{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 uppercase font-bold tracking-wider mb-0.5">Montant</p>
                    <p className="text-sm font-bold text-indigo-700">{p.montant.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 uppercase font-bold tracking-wider mb-0.5">Reçu</p>
                    <p className="text-sm font-semibold text-slate-800">{p.recu_numero}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/api/paiements/recu?paiement_id=${p.id}`} target="_blank" rel="noopener noreferrer" className="dash-btn-secondary text-xs">
                      PDF
                    </a>
                    <button onClick={() => imprimerRecu(p.id)} className="dash-btn-secondary text-xs">
                      Imprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {loadingPaiements && (
        <div className="flex items-center gap-3">
          <div className="dash-spinner" />
          <p className="text-sm text-neutral-500">Chargement...</p>
        </div>
      )}
    </div>
  );
}
