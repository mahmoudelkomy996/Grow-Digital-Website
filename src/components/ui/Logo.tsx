import { cn } from "@/lib/cn";

/**
 * The Grow Digital wordmark rendered as a CSS mask, so it takes the current text colour.
 * Use text-teal-900 on paper and text-paper on dark surfaces.
 */
export function Logo({ className, title = "Grow Digital" }: { className?: string; title?: string }) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn("inline-block aspect-[1625/318] h-7 bg-current", className)}
      style={{
        WebkitMaskImage: "url(/brand/logo-mask.png)",
        maskImage: "url(/brand/logo-mask.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}
