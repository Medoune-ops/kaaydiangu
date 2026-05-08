import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ToastProvider } from "@/components/ui/toast-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

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
    <ToastProvider>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "#f1f3f9",
          backgroundImage: [
            "radial-gradient(ellipse 85% 55% at 10% -8%, rgba(99,102,241,0.08) 0%, transparent 55%)",
            "radial-gradient(ellipse 65% 45% at 90% 108%, rgba(139,92,246,0.06) 0%, transparent 55%)",
            "radial-gradient(ellipse 50% 35% at 55% 55%, rgba(59,130,246,0.03) 0%, transparent 70%)",
            "radial-gradient(rgba(99,102,241,0.04) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 26px 26px",
        }}
      >
        <Sidebar
          role={session.user.role}
          userName={session.user.name || "Utilisateur"}
        />

        <div className="lg:pl-[272px]">
          {/* Top header bar */}
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-slate-900/5 shadow-[0_2px_12px_rgba(15,23,42,0.04),inset_0_-1px_0_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
              <div className="lg:hidden w-10" />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-indigo-500/40 via-violet-500/50 to-transparent" />
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <DashboardShell role={session.user.role}>
              {children}
            </DashboardShell>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
