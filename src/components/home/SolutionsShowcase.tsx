import { getI18n } from "@/i18n/server";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SolutionCard } from "@/components/sections/SolutionCard";

/** SOLVE showcase: our own three products, then the two partner platforms we represent. */
export async function SolutionsShowcase() {
  const { c, t } = await getI18n();
  const own = c.SOLUTIONS.filter((s) => s.kind === "own");
  const partner = c.SOLUTIONS.filter((s) => s.kind === "partner");
  return (
    <Section tone="paper" aria-labelledby="solutions-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              num="03"
              eyebrow={t.home.productsEyebrow}
              title={t.home.productsTitle}
              lead={t.home.productsLead}
              id="solutions-title"
            />
          </Reveal>
          <ArrowLink href="/services/software-development#products">{t.home.productsLink}</ArrowLink>
        </div>

        <Eyebrow className="mt-14 md:mt-20">{t.home.ownSolutions}</Eyebrow>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {own.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 100} className="flex">
              <SolutionCard solution={s} className="w-full" />
            </Reveal>
          ))}
        </ul>

        <Eyebrow className="mt-14">{t.home.partnerSolutions}</Eyebrow>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {partner.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 100} className="flex">
              <SolutionCard solution={s} className="w-full" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
