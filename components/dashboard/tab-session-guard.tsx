"use client";
import { useEffect, useState } from "react";

export const TAB_AUTH_KEY = "tab-auth";

/**
 * Sécurité par onglet : le dashboard n'est accessible que dans l'onglet où
 * l'utilisateur s'est explicitement connecté. `sessionStorage` est isolé par
 * onglet (jamais partagé, contrairement aux cookies / localStorage), donc un
 * nouvel onglet ne possède pas la clé `tab-auth`. Dans ce cas on renvoie
 * l'utilisateur sur le site public ; il devra repasser par /login (ce qui
 * repose la clé dans ce nouvel onglet) pour revenir au dashboard.
 *
 * On ne touche PAS au cookie NextAuth ici : appeler signOut() déconnecterait
 * aussi l'onglet d'origine où l'utilisateur travaille. La protection repose sur
 * le fait que le contenu n'est jamais rendu sans la clé propre à l'onglet.
 */
export function TabSessionGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const hasTabAuth = sessionStorage.getItem(TAB_AUTH_KEY);
    if (!hasTabAuth) {
      // Nouvel onglet : renvoyer vers l'accueil public.
      window.location.replace("/");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
    }
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f1f3f9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
