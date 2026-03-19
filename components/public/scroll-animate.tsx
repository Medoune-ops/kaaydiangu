"use client";

import { useEffect, useRef } from "react";

/**
 * Hook that sets up an IntersectionObserver on a container ref.
 * All children with class `.scroll-animate` will get `.is-visible`
 * added when they scroll into the viewport.
 */
export function useScrollAnimate() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll(".scroll-animate");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Wrapper component that enables scroll animations for its children.
 * Any child with className `scroll-animate` will animate in when visible.
 */
export function ScrollAnimateProvider({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useScrollAnimate();

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
