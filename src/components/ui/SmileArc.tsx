import { cn } from "@/lib/cn";

/** The U-shaped descender of the logo's "g", drawn on a 28×16 grid (centre line). */
export const SMILE_PATH = "M2 2 C 2 10, 8 14, 14 14 C 20 14, 26 10, 26 2";

interface SmileArcProps {
  className?: string;
  /** Stroke width in viewBox units (the arc is 24 units wide). With `stretch`, in CSS pixels. */
  strokeWidth?: number;
  /** Stretch to fill the box (e.g. as an underline). The stroke keeps a constant pixel width. */
  stretch?: boolean;
  /** Accessible name; omit for decorative use. */
  title?: string;
}

/**
 * The signature "smile arc" motif: a round-capped U taken from the logo's g.
 * Uses currentColor. Decorative by default (aria-hidden) unless a `title` is given.
 */
export function SmileArc({ className, strokeWidth = 2, stretch = false, title }: SmileArcProps) {
  // Tight viewBox: the path spans x 2–26 and y 2–14; pad by half the stroke so round caps never clip.
  const pad = stretch ? 1 : strokeWidth / 2;
  const viewBox = `${2 - pad} ${2 - pad} ${24 + pad * 2} ${12 + pad * 2}`;
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
      className={cn("block shrink-0 overflow-visible", !stretch && "h-auto",className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d={SMILE_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={stretch ? "non-scaling-stroke" : undefined}
      />
    </svg>
  );
}
