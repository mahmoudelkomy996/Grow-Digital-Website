import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { CONTACT, COPYRIGHT, FOOTER_LINKS, type FooterColumn } from "@/content/navigation";
import { Logo } from "@/components/ui/Logo";
import { SmileArc } from "@/components/ui/SmileArc";
import { Headline } from "@/components/ui/SectionHeading";

const linkClass =
  "rounded-sm text-teal-100 underline decoration-transparent underline-offset-[5px] transition-[color,text-decoration-color] duration-300 hover:text-paper hover:decoration-teal-300/50";

function Column({ column }: { column: FooterColumn }) {
  const headingId = `footer-${column.title.toLowerCase()}`;
  return (
    <div>
      <h2 id={headingId} className="eyebrow text-teal-400">
        {column.title}
      </h2>
      <ul aria-labelledby={headingId} className="mt-5 flex flex-col gap-2.5 text-[0.9375rem]">
        {column.links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={cn(linkClass, "group/fl inline-flex items-center gap-1.5")}>
                {l.label}
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-3.5 text-teal-400 transition-[translate,color] duration-300 group-hover/fl:-translate-y-0.5 group-hover/fl:translate-x-0.5 group-hover/fl:text-lime"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : /^(mailto:|tel:)/.test(l.href) ? (
              <a href={l.href} className={cn(linkClass, "break-all")}>
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className={cn(linkClass, "inline-flex items-baseline gap-3")}>
                {l.prefix ? <span className="font-mono text-[0.75rem] text-teal-400 tabular-nums">{l.prefix}</span> : null}
                {l.label}
              </Link>
            )}
          </li>
        ))}
        {column.title === "Contact" ? <li className="pt-1 text-small leading-relaxed text-teal-300">{CONTACT.markets}</li> : null}
      </ul>
    </div>
  );
}

/** Dark site footer with the large smile-arc motif. */
export function SiteFooter() {
  return (
    <footer id="site-footer" className="surface-dark relative isolate overflow-hidden bg-teal-950 text-teal-100">
      <div className="container-site pt-20 pb-10 md:pt-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="-m-2 inline-block rounded-md p-2">
              <Logo title="Grow Digital home" className="h-8 text-paper" />
            </Link>
            <p className="mt-8 text-h2 font-light text-paper">
              <Headline text={CONTACT.tagline} tone="dark" />
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:col-span-8 lg:pl-8">
            {FOOTER_LINKS.map((c) => (
              <Column key={c.title} column={c} />
            ))}
          </nav>
        </div>
      </div>

      {/* Signature motif: the logo's smile, drawn at landscape scale and cropped by the bottom bar */}
      <div aria-hidden className="container-site pointer-events-none relative -mb-[9%] select-none">
        <SmileArc strokeWidth={1.1} className="w-full text-teal-800" />
      </div>

      <div className="relative border-t border-teal-300/15 bg-teal-950">
        <div className="container-site flex flex-col gap-3 py-6 text-small text-teal-300 sm:flex-row sm:items-center sm:justify-between">
          <p>{COPYRIGHT}</p>
          <a href="#main" className="self-start rounded-sm text-teal-200 transition-colors hover:text-paper sm:self-auto">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
