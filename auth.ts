import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = credentials.email as string;
        
        // On cherche soit par email soit par matricule d'élève
        let user = await prisma.user.findUnique({
          where: { email: identifier },
        });

        // Si non trouvé par email, on cherche par matricule
        if (!user) {
          const eleve = await prisma.eleve.findUnique({
            where: { matricule: identifier },
            include: { user: true }
          });
          if (eleve) {
            user = eleve.user;
          }
        }

        if (!user || !user.actif) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.mot_de_passe
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
          ecoleId: user.ecole_id,
        };
      },
    }),
  ],
});
