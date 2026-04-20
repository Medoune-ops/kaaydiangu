import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TableauEleves } from "@/components/dashboard/tableau-eleves";

export const dynamic = "force-dynamic";

export default async function CenseurElevesPage() {
  const session = await auth();
  if (!session) return null;

  const eleves = await prisma.eleve.findMany({
    where: { classe: { ecole_id: session.user.ecoleId } },
    include: {
      classe: { select: { nom: true, niveau: true } },
      user: { select: { email: true } },
    },
    orderBy: [{ classe: { nom: "asc" } }, { nom: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{eleves.length} élève(s) inscrit(s)</p>
      </div>

      {eleves.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
          <div className="w-14 h-14 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p className="text-neutral-500 text-sm">Aucun eleve inscrit pour le moment.</p>
        </div>
      ) : (
        <TableauEleves eleves={eleves as Parameters<typeof TableauEleves>[0]["eleves"]} />
      )}
    </div>
  );
}
