"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./Eyebrow";

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: Tone;
  className?: string;
  /** Classes for the trigger row */
  summaryClassName?: string;
}

/**
 * Accessible show/hide (button + aria-expanded/aria-controls). The panel animates its height with a
 * grid-rows transition and is `inert` while closed, so hidden links are not focusable.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  tone = "paper",
  className,
  summaryClassName,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const panelId = `${id}-panel`;
  const dark = tone === "dark";

  return (
    <div className={cn("border-t", dark ? "border-teal-300/20" : "border-line", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group/dc flex w-full items-center justify-between gap-6 rounded-sm py-4 text-left text-[0.9375rem] font-medium transition-colors duration-300",
          dark ? "text-paper hover:text-mint" : "text-teal-900 hover:text-teal-600",
          summaryClassName,
        )}
      >
        <span>{summary}</span>
        <span
          aria-hidden
          className={cn(
            "relative grid size-8 shrink-0 place-items-center rounded-full border transition-[border-color,background-color] duration-300",
            dark ? "border-teal-300/30 group-hover/dc:border-mint" : "border-line group-hover/dc:border-teal-600",
          )}
        >
          <span className="absolute h-px w-3 bg-current" />
          <span
            className={cn(
              "absolute h-3 w-px bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
              open && "rotate-90 scale-y-0",
            )}
          />
        </span>
      </button>
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
