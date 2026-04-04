"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  stagger = false,
  terminal = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  terminal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(
            terminal ? "terminal-visible" : "landing-visible",
          );
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [terminal]);

  const baseClass = stagger
    ? "landing-stagger"
    : terminal
      ? ""
      : "opacity-0";

  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}
