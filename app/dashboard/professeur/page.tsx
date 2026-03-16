import { auth } from "@/auth";

export default async function ProfesseurPage() {
  const session = await auth();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tableau de bord — Professeur</h2>
      <p className="text-neutral-600">Bienvenue, {session?.user.name}</p>
    </div>
  );
}
