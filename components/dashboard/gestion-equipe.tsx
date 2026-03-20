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

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-indigo-50 text-indigo-600",
  COMPTABLE: "bg-sky-50 text-sky-600",
  CENSEUR: "bg-emerald-50 text-emerald-600",
  PROFESSEUR: "bg-amber-50 text-amber-600",
};

export function GestionEquipe() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [assignProf, setAssignProf] = useState<UserInfo | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<string>("TOUS");

  const fetchUsers = useCallback(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
    toast({ type, title: type === "success" ? "Succes" : "Erreur", description: text });
  };

  const handleAction = async (
    userId: string,
    action: string,
    extra?: Record<string, unknown>
  ) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      showMsg("error", data.error || "Erreur");
      return null;
    }
    fetchUsers();
    return data;
  };

  const handleToggleActif = async (user: UserInfo) => {
    const result = await handleAction(user.id, "TOGGLE_ACTIF");
    if (result) {
      showMsg(
        "success",
        `Compte de ${user.prenom} ${user.nom} ${result.actif ? "active" : "desactive"}`
      );
    }
  };

  const handleChangeRole = async (user: UserInfo, newRole: string) => {
    const result = await handleAction(user.id, "CHANGER_ROLE", { role: newRole });
    if (result) {
      showMsg("success", `Role de ${user.prenom} ${user.nom} change en ${ROLE_LABELS[newRole]}`);
    }
  };

  const handleResetPassword = async (user: UserInfo) => {
    if (!confirm(`Reinitialiser le mot de passe de ${user.prenom} ${user.nom} ?`)) return;
    const result = await handleAction(user.id, "RESET_PASSWORD");
    if (result) {
      showMsg(
        "success",
        `Nouveau mot de passe : ${result.nouveau_mot_de_passe}`
      );
    }
  };

  const filteredUsers =
    filter === "TOUS" ? users : users.filter((u) => u.role === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="TOUS">Tous les roles</option>
            <option value="CENSEUR">Censeurs</option>
            <option value="COMPTABLE">Comptables</option>
            <option value="PROFESSEUR">Professeurs</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
          <span className="text-sm text-neutral-400">{filteredUsers.length} utilisateur(s)</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          + Nouveau compte
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Nom</th>
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Email</th>
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Role</th>
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Statut</th>
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Matieres</th>
                <th className="py-2.5 px-4 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-neutral-50 hover:bg-neutral-50/50 ${!user.actif ? "opacity-50" : ""}`}
                >
                  <td className="py-2.5 px-4 text-sm font-medium text-neutral-900">
                    {user.prenom} {user.nom}
                  </td>
                  <td className="py-2.5 px-4 text-sm text-neutral-500">{user.email}</td>
                  <td className="py-2.5 px-4">
                    {user.role === "SUPER_ADMIN" ? (
                      <span className={`px-2 py-0.5 rounded-md text-sm font-medium ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        className={`px-2 py-0.5 rounded-md text-sm font-medium border-0 cursor-pointer ${ROLE_COLORS[user.role]}`}
                      >
                        <option value="COMPTABLE">Comptable</option>
                        <option value="CENSEUR">Censeur</option>
                        <option value="PROFESSEUR">Professeur</option>
                      </select>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-sm font-medium ${
                        user.actif
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {user.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {user.role === "PROFESSEUR" ? (
                      user.matieres.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.matieres.slice(0, 3).map((m) => (
                            <span
                              key={m.id}
                              className="bg-neutral-50 text-neutral-600 px-2 py-0.5 rounded-md text-xs"
                              title={`${m.nom} — ${m.classe.nom}`}
                            >
                              {m.nom} ({m.classe.nom})
                            </span>
                          ))}
                          {user.matieres.length > 3 && (
                            <span className="text-xs text-neutral-400">
                              +{user.matieres.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Aucune matiere</span>
                      )
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {user.role !== "SUPER_ADMIN" && (
                      <div className="flex items-center justify-end gap-1">
                        {user.role === "PROFESSEUR" && (
                          <button
                            onClick={() => setAssignProf(user)}
                            className="px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            Matieres
                          </button>
                        )}
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 rounded-md transition-colors"
                        >
                          MDP
                        </button>
                        <button
                          onClick={() => handleToggleActif(user)}
                          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                            user.actif
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {user.actif ? "Desactiver" : "Activer"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-neutral-400">
                    Aucun utilisateur trouve.
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
          onCreated={(msg) => {
            showMsg("success", msg);
            fetchUsers();
            setShowCreate(false);
          }}
        />
      )}

      {assignProf && (
        <AssignMatieresModal
          prof={assignProf}
          onClose={() => setAssignProf(null)}
          onSaved={() => {
            showMsg("success", `Matieres mises a jour pour ${assignProf.prenom} ${assignProf.nom}`);
            fetchUsers();
            setAssignProf(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Modal creation de compte ───

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (msg: string) => void;
}) {
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

    if (!res.ok) {
      setError(data.error || "Erreur lors de la creation");
      return;
    }

    onCreated(
      `Compte cree pour ${data.prenom} ${data.nom} (${data.email}). Mot de passe provisoire : ${data.mot_de_passe_provisoire}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Nouveau compte</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Prenom <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="exemple@ecole.sn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="PROFESSEUR">Professeur</option>
              <option value="CENSEUR">Censeur</option>
              <option value="COMPTABLE">Comptable</option>
            </select>
          </div>
          <p className="text-xs text-neutral-400">
            Un mot de passe provisoire sera genere automatiquement.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
              )}
              {saving ? "Creation..." : "Creer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal assignation des matieres a un professeur ───

function AssignMatieresModal({
  prof,
  onClose,
  onSaved,
}: {
  prof: UserInfo;
  onClose: () => void;
  onSaved: () => void;
}) {
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: prof.id,
        action: "ASSIGNER_MATIERES",
        matiere_ids: Array.from(selected),
      }),
    });
    setSaving(false);
    if (res.ok) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Assigner des matieres</h3>
            <p className="text-sm text-neutral-500">
              {prof.prenom} {prof.nom}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
            </div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Aucune classe trouvee.</p>
          ) : (
            classes.map((classe) => (
              <div key={classe.id}>
                <h4 className="text-sm font-medium text-neutral-900 mb-2">{classe.nom}</h4>
                <div className="space-y-1 ml-2">
                  {classe.matieres.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic">Aucune matiere</p>
                  ) : (
                    classe.matieres.map((m) => {
                      const isOtherProf =
                        m.professeur_id && m.professeur_id !== prof.id;
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2 text-sm p-1.5 rounded-lg hover:bg-neutral-50 ${
                            isOtherProf ? "opacity-40" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(m.id)}
                            onChange={() => toggle(m.id)}
                            disabled={!!isOtherProf}
                            className="rounded border-neutral-300 text-indigo-500 focus:ring-indigo-500/20"
                          />
                          <span className="text-neutral-700">{m.nom}</span>
                          {isOtherProf && (
                            <span className="text-xs text-neutral-400">(autre prof)</span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-neutral-400">
            {selected.size} matiere(s) selectionnee(s)
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
