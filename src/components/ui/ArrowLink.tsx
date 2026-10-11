import { Link } from "@/components/ui/Link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "./Eyebrow";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** Quiet text link with a hairline underline and a trailing arrow, e.g. "All use cases →". */
export function ArrowLink({ href, children, tone = "paper", className }: ArrowLinkProps) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const classes = cn(
    "group/al inline-flex items-center gap-2 rounded-sm text-[0.9375rem] font-medium transition-colors duration-300",
    tone === "dark" ? "text-mint hover:text-paper" : "text-teal-700 hover:text-teal-900",
    className,
  );
  const inner = (
    <>
      <span className="underline decoration-current/35 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-300 group-hover/al:decoration-current">
        {children}
      </span>
      <ArrowRight
        aria-hidden
        strokeWidth={1.5}
        className="flip-rtl size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/al:translate-x-1 rtl:group-hover/al:-translate-x-1"
      />
    </>
  );
  return external ? (
    <a href={href} className={classes}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
