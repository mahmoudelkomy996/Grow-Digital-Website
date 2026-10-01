import type { Metadata } from "next";
import { Suspense } from "react";
import { INDUSTRIES, USE_CASES } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { UseCaseCard } from "@/components/sections/UseCaseCard";
import { UseCaseExplorer } from "@/components/use-cases/UseCaseExplorer";

export const metadata: Metadata = pageMetadata({
  title: "Use cases",
  description:
    "AI and IoT programs delivered with our partners: inflight catering, customer purchase prediction, healthcare assistants, fraud detection, energy and production optimization.",
  path: "/use-cases",
});

/** Server-rendered grid shown until the client explorer hydrates (and for no-JS visitors). */
function StaticGrid() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {USE_CASES.map((u) => (
        <li key={u.id} className="flex">
          <UseCaseCard useCase={u} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

export default function UseCasesPage() {
  const ai = USE_CASES.filter((u) => u.category === "AI").length;
  const iot = USE_CASES.length - ai;
  return (
    <>
      <PageHero
        eyebrow="Use cases"
        title="Proof, in *numbers*."
        lead={`${USE_CASES.length} programs, ${ai} in AI and ${iot} in IoT, each measured on the business result it delivered.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Use cases" }]}
      />
      <Section tone="paper-2" aria-labelledby="all-use-cases">
        <Container>
          <h2 id="all-use-cases" className="sr-only">
            All use cases
          </h2>
          <Suspense fallback={<StaticGrid />}>
            <UseCaseExplorer useCases={USE_CASES} industries={INDUSTRIES} />
          </Suspense>
        </Container>
      </Section>
      <CtaBand title="Let's write your *next* case." />
    </>
  );
}
