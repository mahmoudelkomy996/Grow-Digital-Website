"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Delay in ms (for staggering siblings) */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Fades content in with a 16px rise when it scrolls into view (600ms, ease-out).
 * Server-rendered content is visible by default: elements already on screen at hydration, users with
 * reduced motion, and no-JS visitors all see static content. Only elements below the fold are hidden
 * and then revealed, so there is no flash and no effect on LCP.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;

    el.style.opacity = "0";
    el.style.translate = "0 16px";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        el.style.transition = `opacity 600ms var(--ease-out-expo) ${delay}ms, translate 600ms var(--ease-out-expo) ${delay}ms`;
        el.style.opacity = "1";
        el.style.translate = "0 0";
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.style.opacity = "";
      el.style.translate = "";
      el.style.transition = "";
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
