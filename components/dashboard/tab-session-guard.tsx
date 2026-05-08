"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const TAB_AUTH_KEY = "tab-auth";

export function TabSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const hasTabAuth = sessionStorage.getItem(TAB_AUTH_KEY);
    if (!hasTabAuth) {
      router.replace("/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f1f3f9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
