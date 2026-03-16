import type { NextAuthConfig } from "next-auth";

type Role = "SUPER_ADMIN" | "COMPTABLE" | "CENSEUR" | "PROFESSEUR" | "ELEVE";

// Config minimale sans Prisma — utilisée dans le middleware (Edge Runtime)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
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
