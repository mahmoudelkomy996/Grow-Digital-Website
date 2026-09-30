import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "paper" | "dark";

interface EyebrowProps {
  children: ReactNode;
  tone?: Tone;
  /** Optional mono index shown before the label, e.g. "01" → "01 — Consult" */
  num?: string;
  as?: ElementType;
  className?: string;
}

/** Mono, upper-case, tracked label. Lime on dark surfaces, teal-600 on paper. */
export function Eyebrow({ children, tone = "paper", num, as: Tag = "p", className }: EyebrowProps) {
  const dark = tone === "dark";
  return (
    <Tag className={cn("eyebrow flex flex-wrap items-center gap-x-2.5", dark ? "text-lime" : "text-teal-600", className)}>
      {num ? (
        <>
          <span className="tabular-nums">{num}</span>
          <span aria-hidden className={cn("h-px w-6", dark ? "bg-lime/50" : "bg-teal-600/40")} />
        </>
      ) : null}
      <span>{children}</span>
    </Tag>
  );
}
