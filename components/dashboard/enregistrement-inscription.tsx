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

export function EnregistrementInscription() {
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

    if (!confirm(`Confirmer l'encaissement de l'inscription (${parseFloat(montant).toLocaleString("fr-FR")} FCFA) pour ${selectedEleve!.prenom} ${selectedEleve!.nom} ?`)) return;

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

      setMessage(`Inscription enregistree ! Recu n ${data.recu_numero}`);
      toast({ type: "success", title: "Inscription enregistree", description: `Recu n ${data.recu_numero}` });
      setLastRecu({ recu_numero: data.recu_numero, paiement_id: selectedPaiementId });
      setSelectedPaiementId("");
      setMontant("");

      const refresh = await fetch(`/api/paiements?eleve_id=${selectedEleve!.id}`);
      if (refresh.ok) setPaiements(await refresh.json());
    } catch {
      setMessage("Erreur reseau");
    } finally {
      setSubmitting(false);
    }
  }

  const nonPayes = paiements.filter((p) => p.statut === "NON_PAYE" && p.mois === 0);
  const payes = paiements.filter((p) => p.statut === "PAYE" && p.mois === 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Enregistrer une Inscription</h3>
          <p className="text-sm text-neutral-500">Recherchez l'eleve pour encaisser ses frais d'inscription.</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="relative">
            <input
              placeholder="Nom, prenom ou matricule..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-3 text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />}
          </div>

          {resultats.length > 0 && (
            <div className="border border-neutral-200 rounded-lg divide-y">
              {resultats.map((e) => (
                <button key={e.id} onClick={() => selectEleve(e)} className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center justify-between">
                  <span className="text-sm font-medium">{e.prenom} {e.nom} ({e.matricule})</span>
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded">{e.classe.nom}</span>
                </button>
              ))}
            </div>
          )}

          {selectedEleve && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
              <span className="font-semibold text-sm">{selectedEleve.prenom} {selectedEleve.nom} -- {selectedEleve.classe.nom}</span>
              <button onClick={() => setSelectedEleve(null)} className="text-xs font-medium text-neutral-600 hover:underline">Changer</button>
            </div>
          )}
        </div>
      </div>

      {selectedEleve && !loadingPaiements && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Statut Inscription</h3>
            {payes.length > 0 ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Payee</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">Non Payee</span>
            )}
          </div>
          <div className="px-6 py-4">
            {nonPayes.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="hidden" value={selectedPaiementId || (selectedPaiementId = nonPayes[0].id)} />
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Montant Inscription (FCFA)</label>
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex: 50000"
                      className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Mode de Reglement</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm"
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
                    className="h-10 px-6 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                  >
                    {submitting ? "Enregistrement..." : "Confirmer l'Inscription"}
                  </button>
                </div>
              </form>
            ) : (
              payes.map(p => (
                <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <div className="text-xs text-neutral-400 uppercase font-bold">Encaisse le</div>
                    <div className="text-sm font-medium">{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 uppercase font-bold">Montant</div>
                    <div className="text-sm font-bold text-indigo-600">{p.montant.toLocaleString()} FCFA</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 uppercase font-bold">Recu</div>
                    <div className="text-sm font-medium">{p.recu_numero}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => imprimerRecu(p.id)} className="px-4 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50">Imprimer Recu</button>
                  </div>
                </div>
              ))
            )}
            {message && <p className="mt-4 text-sm font-medium text-indigo-600">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
