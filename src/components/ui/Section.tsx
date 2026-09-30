import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SectionTone = "paper" | "paper-2" | "dark" | "stage";

interface SectionProps {
  tone?: SectionTone;
  id?: string;
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

const tones: Record<SectionTone, string> = {
  paper: "bg-paper text-ink",
  "paper-2": "bg-paper-2 text-ink",
  dark: "surface-dark bg-teal-900 text-teal-100",
  stage: "surface-dark bg-stage text-teal-100",
};

/** A page band: background, text colour and the vertical rhythm (`section-y`). Put a <Container> inside. */
export function Section({ tone = "paper", id, className, children, ...aria }: SectionProps) {
  return (
    <section id={id} className={cn("relative section-y", tones[tone], className)} {...aria}>
      {children}
    </section>
  );
}

export const isDarkTone = (tone: SectionTone) => tone === "dark" || tone === "stage";
