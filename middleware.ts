import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role as string | undefined;

  // NB : l'auto-redirection /login → dashboard (quand déjà connecté) est gérée
  // côté client sur la page /login, car elle dépend de sessionStorage (isolé par
  // onglet) que le middleware Edge ne peut pas lire. Un nouvel onglet avec cookie
  // valide mais sans clé d'onglet doit pouvoir rester sur /login pour se reconnecter.

  // Protection par rôle sur les sous-modules du dashboard
  const roleRoutes: Record<string, string[]> = {
    "/dashboard/admin": ["SUPER_ADMIN"],
    "/dashboard/comptable": ["SUPER_ADMIN", "COMPTABLE"],
    "/dashboard/censeur": ["SUPER_ADMIN", "CENSEUR"],
    "/dashboard/professeur": ["SUPER_ADMIN", "PROFESSEUR"],
    "/dashboard/eleve": ["ELEVE"],
  };

  if (pathname.startsWith("/dashboard") && role) {
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        return Response.redirect(new URL("/dashboard", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
