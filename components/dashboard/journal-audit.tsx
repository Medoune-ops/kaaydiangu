"use client";

import { useEffect, useState, useCallback } from "react";

interface Auteur {
  id: string;
  nom: string;
  prenom: string;
  role: string;
}

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  date: string;
  auteur: Auteur;
}

interface AuditResponse {
  logs: AuditEntry[];
  total: number;
  page: number;
  pages: number;
  actions: string[];
  auteurs: Auteur[];
}

const ACTION_LABELS: Record<string, string> = {
  ELEVE_INSCRIT: "Inscription eleve",
  NOTES_SAISIES: "Saisie de notes",
  PAIEMENT_ENREGISTRE: "Paiement enregistre",
  DEPENSE_ENREGISTREE: "Depense enregistree",
  UTILISATEUR_CREE: "Compte cree",
  ROLE_MODIFIE: "Role modifie",
  COMPTE_ACTIVE: "Compte active",
  COMPTE_DESACTIVE: "Compte desactive",
  MOT_DE_PASSE_REINITIALISE: "MDP reinitialise",
  MATIERES_ASSIGNEES: "Matieres assignees",
  CLASSE_CREEE: "Classe creee",
  CLASSE_MODIFIEE: "Classe modifiee",
  CLASSE_SUPPRIMEE: "Classe supprimee",
  CONFIG_ECOLE_MODIFIEE: "Configuration modifiee",
  CONFIG_IMPAYES_MODIFIEE: "Config impayes modifiee",
  CONVOCATION_ENVOYEE: "Convocation envoyee",
  RAPPEL_IMPAYES_ENVOYE: "Rappel impayes envoye",
  ABSENCE_ENREGISTREE: "Absence enregistree",
  MESSAGE_DIRECTION: "Message direction",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Admin",
  COMPTABLE: "Comptable",
  CENSEUR: "Censeur",
  PROFESSEUR: "Professeur",
  ELEVE: "Eleve",
};

const inputCls = "h-8 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500";

export function JournalAudit() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterAuteur, setFilterAuteur] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "30");
    if (filterAction) params.set("action", filterAction);
    if (filterAuteur) params.set("auteur_id", filterAuteur);
    if (dateDebut) params.set("date_debut", dateDebut);
    if (dateFin) params.set("date_fin", dateFin);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/audit?${params}`);
    const json = await res.json();
    if (res.ok) setData(json);
    setLoading(false);
  }, [page, filterAction, filterAuteur, dateDebut, dateFin, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionLabel = (action: string) =>
    ACTION_LABELS[action] || action;

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Recherche</label>
            <input
              type="text"
              data-search-input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, action..."
              className={`${inputCls} w-44`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className={inputCls}
            >
              <option value="">Toutes</option>
              {data?.actions.map((a) => (
                <option key={a} value={a}>
                  {getActionLabel(a)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Auteur</label>
            <select
              value={filterAuteur}
              onChange={(e) => { setFilterAuteur(e.target.value); setPage(1); }}
              className={inputCls}
            >
              <option value="">Tous</option>
              {data?.auteurs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom} ({ROLE_LABELS[a.role] || a.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Du</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => { setDateDebut(e.target.value); setPage(1); }}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Au</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => { setDateFin(e.target.value); setPage(1); }}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="h-8 px-4 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Filtrer
          </button>
          {(filterAction || filterAuteur || dateDebut || dateFin || search) && (
            <button
              type="button"
              onClick={() => {
                setFilterAction("");
                setFilterAuteur("");
                setDateDebut("");
                setDateFin("");
                setSearch("");
                setPage(1);
              }}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              Reinitialiser
            </button>
          )}
        </form>
      </div>

      {/* Resultats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
        </div>
      ) : !data || data.logs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-sm text-neutral-400">
          Aucune entree trouvee.
        </div>
      ) : (
        <>
          <div className="text-sm text-neutral-400">
            {data.total} entree(s) — page {data.page}/{data.pages}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Date</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Action</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Auteur</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-neutral-50 hover:bg-neutral-50/50 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="py-2.5 px-4 text-sm text-neutral-400 whitespace-nowrap">
                        {formatDate(log.date)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-sm font-medium bg-neutral-50 text-neutral-700">
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="text-sm font-medium text-neutral-900">
                          {log.auteur.prenom} {log.auteur.nom}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {ROLE_LABELS[log.auteur.role] || log.auteur.role}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        {log.details ? (
                          isExpanded ? (
                            <pre className="bg-neutral-50 rounded-lg p-2 text-xs overflow-x-auto max-w-md whitespace-pre-wrap text-neutral-600">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-sm text-neutral-500">
                              {summarizeDetails(log.action, log.details)}
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-neutral-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-8 px-3 border border-neutral-200 rounded-lg text-sm disabled:opacity-30 hover:bg-neutral-50 transition-colors"
              >
                Precedent
              </button>
              {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => {
                let p: number;
                if (data.pages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= data.pages - 3) {
                  p = data.pages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      p === page
                        ? "bg-indigo-500 text-white"
                        : "border border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(data.pages, page + 1))}
                disabled={page === data.pages}
                className="h-8 px-3 border border-neutral-200 rounded-lg text-sm disabled:opacity-30 hover:bg-neutral-50 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function summarizeDetails(action: string, details: Record<string, unknown>): string {
  const d = details;
  switch (action) {
    case "ELEVE_INSCRIT":
      return `${d.prenom} ${d.nom} (${d.matricule}) — ${d.classe}`;
    case "NOTES_SAISIES":
      return `${d.nb_notes} note(s), ${d.type}, seq. ${d.sequence}`;
    case "PAIEMENT_ENREGISTRE":
      return `${d.eleve} — ${d.mois}/${d.annee} — ${Number(d.montant).toLocaleString()} F`;
    case "DEPENSE_ENREGISTREE":
      return `${d.libelle} — ${Number(d.montant).toLocaleString()} F`;
    case "UTILISATEUR_CREE":
      return `${d.prenom} ${d.nom} (${d.role})`;
    case "ROLE_MODIFIE":
      return `${d.ancien_role} → ${d.nouveau_role}`;
    case "COMPTE_ACTIVE":
    case "COMPTE_DESACTIVE":
    case "MOT_DE_PASSE_REINITIALISE":
      return String(d.nom || "");
    case "MATIERES_ASSIGNEES":
      return `${d.nom} — ${d.nb_matieres} matiere(s)`;
    case "CLASSE_CREEE":
    case "CLASSE_MODIFIEE":
    case "CLASSE_SUPPRIMEE":
      return String(d.nom || d.classe_id || "");
    case "CONFIG_ECOLE_MODIFIEE":
    case "CONFIG_IMPAYES_MODIFIEE":
      return Object.keys(d).join(", ");
    case "CONVOCATION_ENVOYEE":
      return `${d.eleve} — ${d.motif}`;
    case "RAPPEL_IMPAYES_ENVOYE":
      return `${d.nombre_eleves} eleve(s)`;
    case "ABSENCE_ENREGISTREE":
      return `${d.nb_absences} absence(s)`;
    default:
      return Object.entries(d).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ");
  }
}
