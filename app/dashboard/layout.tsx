import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Sidebar
        role={session.user.role}
        userName={session.user.name || "Utilisateur"}
      />

      <div className="lg:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
            <div className="lg:hidden w-8" />
            <p className="text-sm text-neutral-400 font-medium hidden sm:block">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
