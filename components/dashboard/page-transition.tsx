"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Reset animation on route change
    setIsVisible(false);
    setDisplayChildren(children);

    // Trigger fade-in after a micro-delay so the browser registers opacity:0
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, [pathname, children]);

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {displayChildren}
    </div>
  );
}
