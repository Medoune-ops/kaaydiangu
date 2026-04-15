import type { NextAuthConfig } from "next-auth";

type Role = "SUPER_ADMIN" | "COMPTABLE" | "CENSEUR" | "PROFESSEUR" | "ELEVE";

// Config minimale sans Prisma — utilisée dans le middleware (Edge Runtime)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  // trustHost: true est requis en production quand l'app est derrière un reverse proxy
  // (Vercel, Nginx, etc.) — NextAuth v5 vérifie le header Host pour prévenir les attaques
  // SSRF. Sans cette option, les callbacks OAuth/email cassent en production.
  trustHost: true,
  providers: [],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboard) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.ecoleId = (user as { ecoleId: string }).ecoleId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
        session.user.ecoleId = token.ecoleId as string;
      }
      return session;
    },
  },
};
