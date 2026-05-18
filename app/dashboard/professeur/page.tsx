import { auth } from "@/auth";
import { DashboardProfesseur } from "@/components/dashboard/dashboard-professeur";

export default async function ProfesseurPage() {
  const session = await auth();
  const firstName = session?.user.name?.split(" ")[0] ?? "Professeur";

  return <DashboardProfesseur firstName={firstName} />;
}
