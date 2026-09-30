import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "ghost" | "ghost-dark" | "link";
export type ButtonSize = "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Trailing arrow that nudges right on hover */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

type AnchorProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | "href"> & { href: string };
type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined };

export type ButtonProps = AnchorProps | NativeButtonProps;

const EXTERNAL = /^(https?:|mailto:|tel:|#)/;

/*
 * `data-demo="hover" | "focus"` forces a state for the /design-system page; real users get :hover / :focus-visible.
 */
const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 rounded-full font-medium leading-none whitespace-nowrap " +
  "transition-[background-color,border-color,color,text-decoration-color,translate] duration-300 ease-[var(--ease-out-expo)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 " +
  "data-[demo=focus]:outline-2 data-[demo=focus]:outline-offset-[3px] data-[demo=focus]:outline-solid";

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-900 text-paper hover:bg-teal-800 data-[demo=hover]:bg-teal-800 data-[demo=focus]:outline-teal-500",
  accent:
    "bg-lime text-teal-950 hover:bg-[color-mix(in_oklab,var(--color-lime)_78%,var(--color-paper))] " +
    "data-[demo=hover]:bg-[color-mix(in_oklab,var(--color-lime)_78%,var(--color-paper))] data-[demo=focus]:outline-lime",
  ghost:
    "border border-teal-900/25 text-teal-900 hover:border-teal-900 hover:bg-teal-900/[0.04] " +
    "data-[demo=hover]:border-teal-900 data-[demo=hover]:bg-teal-900/[0.04] data-[demo=focus]:outline-teal-500",
  "ghost-dark":
    "border border-paper/30 text-paper hover:border-paper hover:bg-paper/[0.06] " +
    "data-[demo=hover]:border-paper data-[demo=hover]:bg-paper/[0.06] data-[demo=focus]:outline-lime",
  link:
    "h-auto! rounded-sm px-0! text-current underline decoration-current/30 decoration-1 underline-offset-[7px] " +
    "hover:decoration-current data-[demo=hover]:decoration-current data-[demo=focus]:outline-current",
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", arrow = false, className, children } = props;
  const classes = cn(base, sizes[size], variants[variant], className);
  const content = (
    <>
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          aria-hidden
          strokeWidth={1.5}
          className={cn(
            "shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5 group-data-[demo=hover]/btn:translate-x-0.5",
            size === "lg" ? "size-[18px]" : "size-4",
          )}
        />
      ) : null}
    </>
  );

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, size: _s, arrow: _a, className: _c, children: _ch, href, ...rest } = props;
    if (EXTERNAL.test(href)) {
      return (
        <a href={href} className={classes} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, arrow: _a, className: _c, children: _ch, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
