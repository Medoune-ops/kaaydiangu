"use client";

import { useRef, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
  scale?: number;
}

export function TiltCard({
  children,
  className = "",
  intensity = 8,
  glare = true,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isHovered = useRef(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isHovered.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotX = ((y - cy) / cy) * -intensity;
        const rotY = ((x - cx) / cx) * intensity;

        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;

        if (glare && glareRef.current) {
          const px = (x / rect.width) * 100;
          const py = (y / rect.height) * 100;
          glareRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.08) 0%, transparent 55%)`;
        }
      });
    },
    [intensity, glare, scale]
  );

  const handleMouseEnter = useCallback(() => {
    isHovered.current = true;
    const card = cardRef.current;
    if (card) card.style.transition = "transform 0.08s ease-out";
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false;
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    card.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (glareRef.current) {
      glareRef.current.style.background = "transparent";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
          style={{ transition: "background 0.1s ease" }}
        />
      )}
    </div>
  );
}
