import { auth } from "@/auth";
import { DashboardCenseur } from "@/components/dashboard/dashboard-censeur";

export default async function CenseurPage() {
  const session = await auth();
  const firstName = session?.user.name?.split(" ")[0] ?? "Censeur";

  return <DashboardCenseur firstName={firstName} />;
}
