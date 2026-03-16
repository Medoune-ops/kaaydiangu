import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DocumentsEleve } from "@/components/dashboard/documents-eleve";

export const dynamic = "force-dynamic";

export default async function EleveDocumentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mes documents</h2>
        <p className="text-neutral-500">
          Retrouvez tous vos bulletins, reçus de paiement et cours.
        </p>
      </div>
      <DocumentsEleve />
    </div>
  );
}
