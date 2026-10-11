import Link from "next/link";
import { SERVICES } from "@/content";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Headline } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";

export default function NotFound() {
  return (
    <section className="surface-dark relative isolate overflow-hidden bg-stage text-teal-100">
      <SmileArc
        strokeWidth={1}
        className="pointer-events-none absolute -right-[10%] -bottom-[30%] -z-10 w-[min(900px,110vw)] text-teal-800"
      />
      <div className="container-site flex min-h-[88svh] flex-col justify-center gap-8 pt-[calc(72px+4rem)] pb-20">
        <Eyebrow tone="dark">404 · Page not found</Eyebrow>
        <h1 className="max-w-[14ch] text-display font-light text-paper">
          <Headline text="This page hasn't *grown* yet." tone="dark" arc />
        </h1>
        <p className="max-w-xl text-body-l text-teal-200">
          The page you are looking for doesn&apos;t exist or has moved. Start again from the homepage, or go straight to a pillar.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/" variant="accent" arrow>
            Back to home
          </Button>
          <Button href="/contact" variant="ghost-dark">
            Contact us
          </Button>
        </div>
        <nav aria-label="Pillars" className="mt-6 border-t border-teal-300/15 pt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {SERVICES.map((p) => (
              <li key={p.slug}>
                <Link href={`/services/${p.slug}`} className="group inline-flex items-baseline gap-2 text-paper">
                  <span className="eyebrow text-lime">{p.num}</span>
                  <span className="underline-offset-4 group-hover:underline">{p.verb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
