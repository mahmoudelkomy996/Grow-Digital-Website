import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ImageRef } from "@/content/types";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Headline } from "@/components/ui/SectionHeading";

interface PageHeroProps {
  eyebrow: ReactNode;
  /** Mono index shown before the eyebrow, e.g. "02" */
  num?: string;
  /** Page H1; wrap one word in *asterisks* for the serif accent */
  title: string;
  /** Optional first line inside the H1 (e.g. the pillar name), rendered smaller above the headline */
  kicker?: string;
  lead?: ReactNode;
  image?: ImageRef;
  breadcrumb?: BreadcrumbItem[];
  /** Actions (buttons) under the lead */
  children?: ReactNode;
}

/** Concentric rings echoing the polar grid of the 3D stage. */
function Rings() {
  return (
    <svg aria-hidden viewBox="0 0 800 800" fill="none" className="pointer-events-none absolute -top-[30%] -right-[18%] -z-10 w-[min(1100px,120vw)] text-teal-300 opacity-[0.07]">
      {[120, 200, 280, 360, 440, 520].map((r) => (
        <circle key={r} cx="400" cy="400" r={r} stroke="currentColor" strokeWidth="1" />
      ))}
      <path d="M400 -40 V 840 M -40 400 H 840" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
    </svg>
  );
}

/**
 * Dark page hero with the page H1. The image sits on the right on desktop and becomes a full-bleed
 * background with a teal overlay on smaller screens. Top padding clears the fixed 72px header.
 */
export function PageHero({ eyebrow, num, title, kicker, lead, image, breadcrumb, children }: PageHeroProps) {
  return (
    <section className="surface-dark relative isolate overflow-hidden bg-teal-900 text-teal-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(90%_70%_at_80%_0%,var(--color-teal-800)_0%,transparent_65%),radial-gradient(60%_50%_at_0%_100%,var(--color-stage)_0%,transparent_70%)]"
      />
      <Rings />
      <div
        className={cn(
          "container-site grid min-h-[min(88svh,780px)] items-end gap-12 pt-[calc(72px+clamp(4rem,9vw,8rem))] pb-[clamp(3.5rem,7vw,6.5rem)] lg:grid-cols-12 lg:gap-8",
          image && "lg:min-h-[min(92svh,840px)]",
        )}
      >
        <div className={cn("relative flex flex-col gap-7", image ? "lg:col-span-7 lg:pr-8" : "lg:col-span-10")}>
          {breadcrumb?.length ? <Breadcrumb items={breadcrumb} tone="dark" /> : null}
          <Eyebrow tone="dark" num={num}>
            {eyebrow}
          </Eyebrow>
          <h1 className="max-w-[16ch] text-h1 font-light text-paper">
            {kicker ? <span className="mb-5 block text-h3 font-light tracking-[-0.01em] text-teal-200">{kicker}</span> : null}
            <Headline text={title} tone="dark" arc />
          </h1>
          {lead ? <div className="max-w-xl text-body-l text-teal-200">{lead}</div> : null}
          {children ? <div className="mt-2 flex flex-wrap items-center gap-3">{children}</div> : null}
        </div>

        {image ? (
          <div
            className={cn(
              "absolute inset-0 -z-10 overflow-hidden",
              "lg:relative lg:inset-auto lg:z-auto lg:col-span-5 lg:aspect-[4/5] lg:self-end lg:rounded-[var(--radius-card)]",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
            {/* Mobile/tablet: overlay for text contrast */}
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-teal-950 via-teal-950/85 to-teal-950/55 lg:hidden"
            />
            {/* Desktop: hairline frame and a soft inner vignette */}
            <div
              aria-hidden
              className="absolute inset-0 hidden rounded-[var(--radius-card)] ring-1 ring-paper/10 ring-inset lg:block lg:bg-linear-to-t lg:from-teal-950/35 lg:to-transparent"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
