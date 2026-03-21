import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TableauBordFinancier } from "@/components/dashboard/tableau-bord-financier";

export const dynamic = "force-dynamic";

export default async function ComptablePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <TableauBordFinancier />;
}
