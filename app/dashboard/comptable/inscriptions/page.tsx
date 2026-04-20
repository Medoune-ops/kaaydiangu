import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EnregistrementInscription } from "@/components/dashboard/enregistrement-inscription";
import { redirect } from "next/navigation";

export default async function InscriptionsPage() {
  const session = await auth();

  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <DashboardHeader role={session.user.role} />
      
      <div className="max-w-4xl mx-auto">
        <EnregistrementInscription />
      </div>
    </div>
  );
}
