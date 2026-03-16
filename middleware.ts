import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role as string | undefined;

  // Rediriger vers le bon dashboard si déjà connecté et sur /login
  if (pathname === "/login" && req.auth) {
    const redirectMap: Record<string, string> = {
      SUPER_ADMIN: "/dashboard/admin",
      COMPTABLE: "/dashboard/comptable",
      CENSEUR: "/dashboard/censeur",
      PROFESSEUR: "/dashboard/professeur",
      ELEVE: "/dashboard/eleve",
    };
    const dest = (role && redirectMap[role]) || "/dashboard";
    return Response.redirect(new URL(dest, req.url));
  }

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
