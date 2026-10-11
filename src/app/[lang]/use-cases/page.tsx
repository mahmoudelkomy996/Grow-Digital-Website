import type { Metadata } from "next";
import { Suspense } from "react";
import type { UseCase } from "@/content/types";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/i18n/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { UseCaseCard } from "@/components/sections/UseCaseCard";
import { UseCaseExplorer } from "@/components/use-cases/UseCaseExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({ title: t.useCases.metaTitle, description: t.useCases.metaDescription, path: "/use-cases", locale });
}

/** Server-rendered grid shown until the client explorer hydrates (and for no-JS visitors). */
function StaticGrid({ useCases }: { useCases: UseCase[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {useCases.map((u) => (
        <li key={u.id} className="flex">
          <UseCaseCard useCase={u} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

export default async function UseCasesPage() {
  const { c, t } = await getI18n();
  const USE_CASES = c.USE_CASES;
  const ai = USE_CASES.filter((u) => u.category === "AI").length;
  const iot = USE_CASES.length - ai;
  return (
    <>
      <PageHero
        eyebrow={t.useCases.eyebrow}
        title={t.useCases.title}
        lead={t.useCases.lead(USE_CASES.length, ai, iot)}
        breadcrumb={[{ label: t.common.home, href: "/" }, { label: t.useCases.metaTitle }]}
      />
      <Section tone="paper-2" aria-labelledby="all-use-cases">
        <Container>
          <h2 id="all-use-cases" className="sr-only">
            {t.useCases.all}
          </h2>
          <Suspense fallback={<StaticGrid useCases={USE_CASES} />}>
            <UseCaseExplorer useCases={USE_CASES} industries={c.INDUSTRIES} />
          </Suspense>
        </Container>
      </Section>
      <CtaBand title={t.useCases.ctaTitle} />
    </>
  );
}
