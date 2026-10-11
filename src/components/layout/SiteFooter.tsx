import { Link } from "@/components/ui/Link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FooterColumn } from "@/content/types";
import { getI18n } from "@/i18n/server";
import { Logo } from "@/components/ui/Logo";
import { Headline } from "@/components/ui/SectionHeading";

const linkClass =
  "rounded-sm text-teal-100 underline decoration-transparent underline-offset-[5px] transition-[color,text-decoration-color] duration-300 hover:text-paper hover:decoration-teal-300/50";

function Column({ column, index, note, newTab }: { column: FooterColumn; index: number; note?: string; newTab: string }) {
  const headingId = `footer-col-${index}`;
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
                  className="flip-rtl size-3.5 text-teal-400 transition-[translate,color] duration-300 group-hover/fl:-translate-y-0.5 group-hover/fl:translate-x-0.5 group-hover/fl:text-lime rtl:group-hover/fl:-translate-x-0.5"
                />
                <span className="sr-only">{newTab}</span>
              </a>
            ) : /^(mailto:|tel:)/.test(l.href) ? (
              <a href={l.href} dir="ltr" className={cn(linkClass, "break-all")}>
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
        {note ? <li className="pt-1 text-small leading-relaxed text-teal-300">{note}</li> : null}
      </ul>
    </div>
  );
}

/** Compact dark site footer; the smile arc sits under the tagline's accent word. */
export async function SiteFooter() {
  const { c, t } = await getI18n();
  return (
    <footer id="site-footer" className="surface-dark relative isolate overflow-hidden bg-teal-950 text-teal-100">
      <div className="container-site pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="-m-2 inline-block rounded-md p-2">
              <Logo title={t.common.homeLogo} className="h-8 text-paper" />
            </Link>
            <p className="mt-6 text-h2 font-light text-paper md:mt-8">
              <Headline text={c.CONTACT.tagline} tone="dark" arc />
            </p>
          </div>
          <nav aria-label={t.footer.nav} className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8 lg:ps-8">
            {c.FOOTER_LINKS.map((col, i) => (
              <Column key={col.title} column={col} index={i} note={i === 2 ? c.CONTACT.markets : undefined} newTab={t.common.opensInNewTab} />
            ))}
          </nav>
        </div>
      </div>

      <div className="relative border-t border-teal-300/15">
        <div className="container-site flex flex-col gap-3 py-6 text-small text-teal-300 sm:flex-row sm:items-center sm:justify-between">
          <p>{c.COPYRIGHT}</p>
          <a href="#main" className="self-start rounded-sm text-teal-200 transition-colors hover:text-paper sm:self-auto">
            {t.footer.backToTop} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
