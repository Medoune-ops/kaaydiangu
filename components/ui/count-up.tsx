"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

export function CountUp({ value, duration = 2200, className }: CountUpProps) {
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const hasPlus = value.includes("+");
  const hasPercent = value.includes("%");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart for snappy deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * numeric);

      const formatted = current >= 1000
        ? (current / 1000).toFixed(current >= 10000 ? 0 : 1).replace(".", ",") + "k"
        : current.toString();

      setDisplay(
        (numeric >= 1000 && progress === 1
          ? (numeric / 1000).toFixed(numeric >= 10000 ? 0 : 1).replace(".", ",") + "k"
          : current.toString()) +
          (hasPercent ? "%" : "") +
          (hasPlus && progress === 1 ? "+" : "")
      );

      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
