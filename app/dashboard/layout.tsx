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
      <div className="dash-page">
        <Sidebar
          role={session.user.role}
          userName={session.user.name || "Utilisateur"}
        />

        <div className="lg:pl-[272px]">
          {/* Top header bar */}
          <header className="sticky top-0 z-20 dash-header">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
              {/* Left: spacer for mobile hamburger */}
              <div className="lg:hidden w-10" />

              {/* Center/Right area */}
              <div className="flex-1" />

              {/* Right: notifications */}
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </div>
            {/* Gradient accent line under header */}
            <div className="h-[2px] bg-gradient-to-r from-indigo-500/30 via-violet-500/40 to-indigo-500/10" />
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
