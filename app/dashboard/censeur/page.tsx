import { auth } from "@/auth";

export default async function CenseurPage() {
  const session = await auth();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tableau de bord — Censeur</h2>
      <p className="text-neutral-600">Bienvenue, {session?.user.name}</p>
    </div>
  );
}
