import { DefaultSession } from "next-auth";

type Role = "SUPER_ADMIN" | "COMPTABLE" | "CENSEUR" | "PROFESSEUR" | "ELEVE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      ecoleId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    ecoleId: string;
  }
}
