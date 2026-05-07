"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface MatiereInfo {
  id: string;
  nom: string;
  classe: { id: string; nom: string };
}

interface UserInfo {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
  createdAt: string;
  matieres: MatiereInfo[];
}

interface ClasseMatiere {
  id: string;
  nom: string;
  matieres: { id: string; nom: string; professeur_id: string | null }[];
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  COMPTABLE: "Comptable",
  CENSEUR: "Censeur",
  PROFESSEUR: "Professeur",
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "dash-badge dash-badge-info",
  COMPTABLE: "dash-badge dash-badge-neutral",
  CENSEUR: "dash-badge dash-badge-success",
  PROFESSEUR: "dash-badge dash-badge-warning",
};

export function GestionEquipe() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [assignProf, setAssignProf] = useState<UserInfo | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<string>("TOUS");
  const [recherche, setRecherche] = useState("");

  const fetchUsers = useCallback(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
    toast({ type, title: type === "success" ? "Succès" : "Erreur", description: text });
  };

  const handleAction = async (userId: string, action: string, extra?: Record<string, unknown>) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) { showMsg("error", data.error || "Erreur"); return null; }
    fetchUsers();
    return data;
  };

  const handleToggleActif = async (user: UserInfo) => {
    const result = await handleAction(user.id, "TOGGLE_ACTIF");
    if (result) showMsg("success", `Compte de ${user.prenom} ${user.nom} ${result.actif ? "activé" : "désactivé"}`);
  };

  const handleChangeRole = async (user: UserInfo, newRole: string) => {
    const result = await handleAction(user.id, "CHANGER_ROLE", { role: newRole });
    if (result) showMsg("success", `Rôle de ${user.prenom} ${user.nom} changé en ${ROLE_LABELS[newRole]}`);
  };

  const handleResetPassword = async (user: UserInfo) => {
    if (!confirm(`Réinitialiser le mot de passe de ${user.prenom} ${user.nom} ?`)) return;
    const result = await handleAction(user.id, "RESET_PASSWORD");
    if (result) showMsg("success", `Nouveau mot de passe : ${result.nouveau_mot_de_passe}`);
  };

  const filteredUsers = users.filter((u) => {
    if (filter !== "TOUS" && u.role !== filter) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      return u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Barre de recherche / actions */}
      <div className="dash-section overflow-hidden">
        <div className="dash-section-header">
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
                placeholder="Rechercher un utilisateur..."
                className="dash-input pl-9 w-56"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="dash-input w-auto px-3">
              <option value="TOUS">Tous les rôles</option>
              <option value="CENSEUR">Censeurs</option>
              <option value="COMPTABLE">Comptables</option>
              <option value="PROFESSEUR">Professeurs</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
            {(recherche || filter !== "TOUS") && (
              <button onClick={() => { setRecherche(""); setFilter("TOUS"); }} className="dash-btn-secondary text-xs">
                Réinitialiser
              </button>
            )}
            <span className="dash-count">{filteredUsers.length} utilisateur(s)</span>
          </div>
          <button onClick={() => setShowCreate(true)} className="dash-btn-primary">
            + Nouveau compte
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="dash-section overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Nom</th>
                <th className="text-left">Email</th>
                <th className="text-left">Rôle</th>
                <th className="text-left">Statut</th>
                <th className="text-left">Matières</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={!user.actif ? "opacity-50" : ""}>
                  <td className="font-semibold text-slate-800">{user.prenom} {user.nom}</td>
                  <td className="text-sm text-slate-500">{user.email}</td>
                  <td>
                    {user.role === "SUPER_ADMIN" ? (
                      <span className={ROLE_BADGE[user.role]}>{ROLE_LABELS[user.role]}</span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        className={`${ROLE_BADGE[user.role]} border-0 cursor-pointer bg-transparent text-inherit font-[inherit] text-[0.71rem]`}
                      >
                        <option value="COMPTABLE">Comptable</option>
                        <option value="CENSEUR">Censeur</option>
                        <option value="PROFESSEUR">Professeur</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={`dash-badge ${user.actif ? "dash-badge-success" : "dash-badge-danger"}`}>
                      {user.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>
                    {user.role === "PROFESSEUR" ? (
                      user.matieres.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.matieres.slice(0, 3).map((m) => (
                            <span key={m.id} className="dash-badge dash-badge-neutral" title={`${m.nom} — ${m.classe.nom}`}>
                              {m.nom}
                            </span>
                          ))}
                          {user.matieres.length > 3 && (
                            <span className="text-xs text-neutral-400">+{user.matieres.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Aucune matière</span>
                      )
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    {user.role !== "SUPER_ADMIN" && (
                      <div className="flex items-center justify-end gap-1">
                        {user.role === "PROFESSEUR" && (
                          <button onClick={() => setAssignProf(user)} className="px-2.5 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            Matières
                          </button>
                        )}
                        <button onClick={() => handleResetPassword(user)} className="px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">
                          MDP
                        </button>
                        <button
                          onClick={() => handleToggleActif(user)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${user.actif ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                        >
                          {user.actif ? "Désactiver" : "Activer"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-neutral-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(msg) => { showMsg("success", msg); fetchUsers(); setShowCreate(false); }}
        />
      )}

      {assignProf && (
        <AssignMatieresModal
          prof={assignProf}
          onClose={() => setAssignProf(null)}
          onSaved={() => { showMsg("success", `Matières mises à jour pour ${assignProf.prenom} ${assignProf.nom}`); fetchUsers(); setAssignProf(null); }}
        />
      )}
    </div>
  );
}

// ─── Modal création de compte ───

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (msg: string) => void }) {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", role: "PROFESSEUR" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Erreur lors de la création"); return; }
    onCreated(`Compte créé pour ${data.prenom} ${data.nom} (${data.email}). Mot de passe provisoire : ${data.mot_de_passe_provisoire}`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-md overflow-hidden">
        <div className="dash-section-header !rounded-none">
          <span className="dash-section-title">Nouveau compte</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-indigo-100/60 flex items-center justify-center text-neutral-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dash-label">Prénom <span className="text-red-400">*</span></label>
              <input type="text" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Nom <span className="text-red-400">*</span></label>
              <input type="text" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="dash-input" />
            </div>
          </div>
          <div>
            <label className="dash-label">Email <span className="text-red-400">*</span></label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="exemple@ecole.sn" className="dash-input" />
          </div>
          <div>
            <label className="dash-label">Rôle</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="dash-input">
              <option value="PROFESSEUR">Professeur</option>
              <option value="CENSEUR">Censeur</option>
              <option value="COMPTABLE">Comptable</option>
            </select>
          </div>
          <p className="text-xs text-neutral-400">Un mot de passe provisoire sera généré automatiquement.</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="dash-btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="dash-btn-primary inline-flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
              {saving ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal assignation des matières ───

function AssignMatieresModal({ prof, onClose, onSaved }: { prof: UserInfo; onClose: () => void; onSaved: () => void }) {
  const [classes, setClasses] = useState<ClasseMatiere[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data: ClasseMatiere[]) => {
        if (Array.isArray(data)) {
          setClasses(data);
          const ids = new Set<string>();
          for (const c of data) {
            for (const m of c.matieres) {
              if (m.professeur_id === prof.id) ids.add(m.id);
            }
          }
          setSelected(ids);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [prof.id]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: prof.id, action: "ASSIGNER_MATIERES", matiere_ids: Array.from(selected) }),
    });
    setSaving(false);
    if (res.ok) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="dash-section-header !rounded-none shrink-0">
          <div>
            <span className="dash-section-title">Assigner des matières</span>
            <p className="text-xs text-neutral-500 mt-0.5">{prof.prenom} {prof.nom}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-indigo-100/60 flex items-center justify-center text-neutral-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><div className="dash-spinner" /></div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucune classe trouvée.</p>
          ) : (
            classes.map((classe) => (
              <div key={classe.id}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">{classe.nom}</h4>
                <div className="space-y-1 ml-2">
                  {classe.matieres.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic">Aucune matière</p>
                  ) : (
                    classe.matieres.map((m) => {
                      const isOtherProf = m.professeur_id && m.professeur_id !== prof.id;
                      return (
                        <label key={m.id} className={`flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-indigo-50/40 transition-colors cursor-pointer ${isOtherProf ? "opacity-40" : ""}`}>
                          <input
                            type="checkbox"
                            checked={selected.has(m.id)}
                            onChange={() => toggle(m.id)}
                            disabled={!!isOtherProf}
                            className="rounded border-neutral-300 text-indigo-500 focus:ring-indigo-500/20"
                          />
                          <span className="text-neutral-700">{m.nom}</span>
                          {isOtherProf && <span className="text-xs text-neutral-400">(autre prof)</span>}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-between shrink-0">
          <span className="dash-count">{selected.size} matière(s)</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="dash-btn-secondary">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="dash-btn-primary">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
