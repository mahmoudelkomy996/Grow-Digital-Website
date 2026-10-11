import { Link } from "@/components/ui/Link";
import { getI18n } from "@/i18n/server";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Headline } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";

export default async function NotFound() {
  const { c, t } = await getI18n();
  const x = t.notFound;
  return (
    <section className="surface-dark relative isolate overflow-hidden bg-stage text-teal-100">
      <SmileArc
        strokeWidth={1}
        className="pointer-events-none absolute -end-[10%] -bottom-[30%] -z-10 w-[min(900px,110vw)] text-teal-800"
      />
      <div className="container-site flex min-h-[88svh] flex-col justify-center gap-8 pt-[calc(72px+4rem)] pb-20">
        <Eyebrow tone="dark">{x.eyebrow}</Eyebrow>
        <h1 className="max-w-[14ch] text-display font-light text-paper">
          <Headline text={x.title} tone="dark" arc />
        </h1>
        <p className="max-w-xl text-body-l text-teal-200">{x.lead}</p>
        <div className="flex flex-wrap gap-3">
          <Button href="/" variant="accent" arrow>
            {x.home}
          </Button>
          <Button href="/contact" variant="ghost-dark">
            {x.contact}
          </Button>
        </div>
        <nav aria-label={x.pillars} className="mt-6 border-t border-teal-300/15 pt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {c.SERVICES.map((p) => (
              <li key={p.slug}>
                <Link href={`/services/${p.slug}`} className="group inline-flex items-baseline gap-2 text-paper">
                  <span className="eyebrow text-lime">{p.num}</span>
                  <span className="underline-offset-4 group-hover:underline">{p.navLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
