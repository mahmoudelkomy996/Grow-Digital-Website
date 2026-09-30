import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Headline } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";

export interface CtaAction {
  label: string;
  href: string;
}

interface CtaBandProps {
  /** Wrap one word in *asterisks* for the serif accent */
  title?: string;
  lead?: ReactNode;
  eyebrow?: ReactNode;
  primary?: CtaAction;
  /** Pass null to hide the secondary action */
  secondary?: CtaAction | null;
}

/** Closing call to action on every page (dark band). */
export function CtaBand({
  title = "Let's *grow* together.",
  lead = "Tell us where you are today. One accountable team will take it from there.",
  eyebrow = "Start the conversation",
  primary = { label: "Talk to us", href: "/contact" },
  secondary = { label: "info@growdigital.com", href: "mailto:info@growdigital.com" },
}: CtaBandProps) {
  return (
    <section className="surface-dark relative isolate overflow-hidden bg-teal-900 text-teal-100 section-y">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(70%_90%_at_100%_100%,var(--color-teal-800)_0%,transparent_60%)]"
      />
      <SmileArc
        strokeWidth={1}
        className="pointer-events-none absolute -right-[12%] -bottom-[38%] -z-10 w-[min(980px,110vw)] text-teal-800"
      />
      <Container className="grid items-end gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-7 lg:col-span-8">
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h2 className="text-display font-light text-paper">
            <Headline text={title} tone="dark" arc />
          </h2>
          {lead ? <div className="max-w-xl text-body-l text-teal-200">{lead}</div> : null}
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
          <Button href={primary.href} variant="accent" size="lg" arrow>
            {primary.label}
          </Button>
          {secondary ? (
            <Button href={secondary.href} variant="ghost-dark" size="lg">
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
