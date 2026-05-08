"use client";

import { useState, useEffect } from "react";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    typeof window !== "undefined" &&
    localStorage.getItem("sidebar-collapsed") === "true"
  );

  useEffect(() => {
    const handler = () =>
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    window.addEventListener("sidebar-toggle", handler);
    return () => window.removeEventListener("sidebar-toggle", handler);
  }, []);

  return (
    <div
      className={`transition-[padding] duration-300 ease-in-out ${
        collapsed ? "lg:pl-16" : "lg:pl-[272px]"
      }`}
    >
      {children}
    </div>
  );
}
