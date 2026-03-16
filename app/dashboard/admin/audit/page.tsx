import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { JournalAudit } from "@/components/dashboard/journal-audit";

export default async function AuditPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Journal d&apos;audit</h2>
        <p className="text-neutral-600">
          Historique complet de toutes les actions effectuées dans le système.
        </p>
      </div>

      <JournalAudit />
    </div>
  );
}
