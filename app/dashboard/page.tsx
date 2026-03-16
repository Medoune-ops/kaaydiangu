import { auth } from "@/auth";
import { redirect } from "next/navigation";

const roleRedirect: Record<string, string> = {
  SUPER_ADMIN: "/dashboard/admin",
  COMPTABLE: "/dashboard/comptable",
  CENSEUR: "/dashboard/censeur",
  PROFESSEUR: "/dashboard/professeur",
  ELEVE: "/dashboard/eleve",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const dest = roleRedirect[session.user.role] ?? "/";
  redirect(dest);
}
