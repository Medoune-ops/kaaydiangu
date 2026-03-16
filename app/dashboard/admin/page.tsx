import { auth } from "@/auth";
import { DashboardAdmin } from "@/components/dashboard/dashboard-admin";

export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Bienvenue, {session?.user.name}
        </p>
      </div>

      <DashboardAdmin />
    </div>
  );
}
