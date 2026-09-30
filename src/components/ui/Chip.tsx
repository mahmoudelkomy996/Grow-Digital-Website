import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./Eyebrow";

interface ChipProps {
  children: ReactNode;
  tone?: Tone;
  /** Selected / active state (e.g. a filter) */
  active?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Pill label for services, categories and filters. Static by default; wrap in a button for interactive use. */
export function Chip({ children, tone = "paper", active = false, size = "md", className }: ChipProps) {
  const dark = tone === "dark";
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border leading-snug",
        size === "sm" ? "px-2.5 py-1 text-[0.8125rem]" : "px-3.5 py-1.5 text-small",
        dark
          ? active
            ? "border-lime bg-lime text-teal-950"
            : "border-teal-300/25 bg-teal-950/30 text-teal-100"
          : active
            ? "border-teal-900 bg-teal-900 text-paper"
            : "border-line bg-paper text-teal-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
