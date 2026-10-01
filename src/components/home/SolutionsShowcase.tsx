import { SOLUTIONS } from "@/content";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SolutionCard } from "@/components/sections/SolutionCard";

/** SOLVE showcase: our own three products, then the two partner platforms we represent. */
export function SolutionsShowcase() {
  const own = SOLUTIONS.filter((s) => s.kind === "own");
  const partner = SOLUTIONS.filter((s) => s.kind === "partner");
  return (
    <Section tone="paper" aria-labelledby="solutions-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              num="06"
              eyebrow="Solve"
              title="Our own platforms, built to *deliver*."
              lead="Three Grow Digital products, plus the partner platforms we exclusively represent in KSA and the UAE."
              id="solutions-title"
            />
          </Reveal>
          <ArrowLink href="/pillars/solve">Explore Solve</ArrowLink>
        </div>

        <Eyebrow className="mt-14 md:mt-20">Grow Digital solutions</Eyebrow>
        <ul className="mt-6 grid gap-4 lg:grid-cols-3">
          {own.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 100} className="flex">
              <SolutionCard solution={s} className="w-full" />
            </Reveal>
          ))}
        </ul>

        <Eyebrow className="mt-14">Partner solutions</Eyebrow>
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
