import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConfigurationEcole } from "@/components/dashboard/configuration-ecole";

export default async function ConfigurationPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuration de l&apos;école</h2>
        <p className="text-neutral-600">
          Gérez les informations, classes, tarifs et paramètres de votre établissement.
        </p>
      </div>

      <ConfigurationEcole />
    </div>
  );
}
