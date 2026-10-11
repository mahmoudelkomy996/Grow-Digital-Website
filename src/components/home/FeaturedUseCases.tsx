import { getI18n } from "@/i18n/server";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UseCaseCard } from "@/components/sections/UseCaseCard";

export async function FeaturedUseCases() {
  const { c, t } = await getI18n();
  const featured = c.USE_CASES.filter((u) => u.featured).slice(0, 3);
  return (
    <Section tone="paper-2" aria-labelledby="use-cases-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow={t.home.useCasesEyebrow}
              title={t.home.useCasesTitle}
              lead={t.home.useCasesLead}
              id="use-cases-title"
            />
          </Reveal>
          <ArrowLink href="/use-cases">{t.home.allUseCases}</ArrowLink>
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
