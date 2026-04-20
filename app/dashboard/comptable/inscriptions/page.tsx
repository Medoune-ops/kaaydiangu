import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EnregistrementInscription } from "@/components/dashboard/enregistrement-inscription";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InscriptionsPage() {
  const session = await auth();

  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader role={session.user.role} />
        <Link
          href="/dashboard/comptable/inscriptions/nouveau"
          className="h-10 px-5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Inscrire un élève
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <EnregistrementInscription />
      </div>
    </div>
  );
}
