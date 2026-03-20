"use client";

import { DashboardHeader } from "./dashboard-header";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { PageTransition } from "./page-transition";

export function DashboardShell({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <KeyboardShortcuts />
      <div className="space-y-6">
        <DashboardHeader role={role} />
        <PageTransition>{children}</PageTransition>
      </div>
    </>
  );
}
