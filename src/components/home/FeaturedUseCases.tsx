import { USE_CASES } from "@/content";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UseCaseCard } from "@/components/sections/UseCaseCard";

export function FeaturedUseCases() {
  const featured = USE_CASES.filter((u) => u.featured).slice(0, 3);
  return (
    <Section tone="paper-2" aria-labelledby="use-cases-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Use cases"
              title="Results that hold up in *production*."
              lead="AI and IoT programs delivered with our partners, measured on the business number they moved."
              id="use-cases-title"
            />
          </Reveal>
          <ArrowLink href="/use-cases">All use cases</ArrowLink>
        </div>
        <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((u, i) => (
            <Reveal as="li" key={u.id} delay={i * 100} className="flex">
              <UseCaseCard useCase={u} className="w-full" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
