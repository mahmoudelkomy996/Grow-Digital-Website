import type { Metadata } from "next";
import {
  CLIENTS_TITLE,
  CLIENT_SECTORS,
  KEY_PROJECTS,
  KEY_PROJECTS_NOTE,
  PARTNER_GROUPS,
  REFERENCE_GROUPS,
  partnersInGroup,
} from "@/content";
import type { Partner } from "@/content/types";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LogoTile } from "@/components/ui/LogoTile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";
import { CtaBand } from "@/components/sections/CtaBand";
import { LogoWall } from "@/components/sections/LogoWall";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = pageMetadata({
  title: "Partners and clients",
  description:
    "Exclusive solution partners in KSA and the UAE (Inveon, Mobilgi, MaestroHub, SkySens), global data, AI and cloud partners, and the clients we serve.",
  path: "/partners",
});

function PartnerCard({ partner, tone, index }: { partner: Partner; tone: "paper" | "dark"; index: number }) {
  const dark = tone === "dark";
  return (
    <Reveal
      as="li"
      delay={index * 80}
      className={cn(
        "flex flex-col rounded-[var(--radius-card)] border",
        dark ? "border-teal-300/15 bg-teal-950/40" : "border-line bg-paper",
      )}
    >
      <div className={cn("border-b", dark ? "border-teal-300/15" : "border-line")}>
        <LogoTile item={partner} tone={tone} className="min-h-28 md:min-h-32" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className={cn("text-h3 font-light", dark ? "text-paper" : "text-teal-900")}>{partner.name}</h3>
          {partner.exclusive ? (
            <span className={cn("eyebrow rounded-full px-2.5 py-1", dark ? "bg-lime text-teal-950" : "bg-teal-900 text-paper")}>
              Exclusive
            </span>
          ) : null}
        </div>
        <p className={cn("text-[0.9375rem] leading-relaxed", dark ? "text-teal-200" : "text-teal-700")}>{partner.description}</p>
      </div>
    </Reveal>
  );
}

export default function PartnersPage() {
  const [solution, dataAi, cloud] = PARTNER_GROUPS;
  return (
    <>
      <PageHero
        eyebrow="Partners and clients"
        title="Partners who *deliver*."
        lead="The solution providers we exclusively represent in KSA and the UAE, the global partners behind our data, AI and cloud delivery, and the clients we serve."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Partners" }]}
      >
        <Button href="#clients" variant="accent" arrow>
          See our clients
        </Button>
      </PageHero>

      {/* 01 · Exclusive solution partners */}
      <Section tone="paper" aria-labelledby="solution-title">
        <Container>
          <Reveal>
            <SectionHeading num="01" eyebrow={solution.title} title="Exclusive in KSA and the *UAE*." lead={solution.lead} id="solution-title" />
          </Reveal>
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
            {partnersInGroup("solution").map((p, i) => (
              <PartnerCard key={p.id} partner={p} tone="paper" index={i} />
            ))}
          </ul>
        </Container>
      </Section>

      {/* 02 · Data & AI and cloud */}
      <Section tone="dark" aria-labelledby="tech-title">
        <Container>
          <Reveal>
            <SectionHeading
              num="02"
              eyebrow="Technology partners"
              title="Global platforms, one *accountable* team."
              tone="dark"
              id="tech-title"
            />
          </Reveal>
          <div className="mt-14 flex flex-col gap-14 md:mt-20">
            {[
              { group: dataAi, items: partnersInGroup("data-ai") },
              { group: cloud, items: partnersInGroup("cloud") },
            ].map(({ group, items }) => (
              <div key={group.id} className="grid gap-8 lg:grid-cols-12">
                <div className="flex flex-col gap-4 lg:col-span-4">
                  <Eyebrow tone="dark">{group.title}</Eyebrow>
                  <p className="text-body text-teal-200">{group.lead}</p>
                </div>
                <ul className={cn("grid gap-3 sm:grid-cols-2 lg:col-span-8", items.length > 2 && "xl:grid-cols-4")}>
                  {items.map((p, i) => (
                    <PartnerCard key={p.id} partner={p} tone="dark" index={i} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 03 · Clients by sector */}
      <Section tone="paper" id="clients" aria-labelledby="clients-title" className="scroll-mt-20">
        <Container>
          <Reveal>
            <SectionHeading num="03" eyebrow="Clients" title="Trusted across *sectors*." lead={`${CLIENTS_TITLE}.`} id="clients-title" />
          </Reveal>
          <div className="mt-14 grid gap-x-8 gap-y-12 md:mt-20 lg:grid-cols-2">
            {CLIENT_SECTORS.map((sector, i) => {
              const small = sector.clients.length <= 2;
              return (
                <Reveal key={sector.id} className={cn("flex flex-col gap-5", !small && "lg:col-span-2")}>
                  <Eyebrow num={String(i + 1).padStart(2, "0")}>{sector.name}</Eyebrow>
                  <LogoWall items={sector.clients} columns={small ? 2 : sector.clients.length > 4 ? 6 : 4} />
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* 04 · Key projects */}
      <Section tone="paper-2" aria-labelledby="projects-title">
        <Container>
          <Reveal>
            <SectionHeading num="04" eyebrow="Key projects" title="Experience where the stakes are *highest*." lead={KEY_PROJECTS_NOTE} id="projects-title" />
          </Reveal>
          <ul className="mt-14 border-t border-line md:mt-20">
            {KEY_PROJECTS.map((k) => (
              <li key={k.id} className="grid items-center gap-4 border-b border-line py-6 sm:grid-cols-[12rem_1fr] md:gap-10">
                <div className="w-48 max-w-full">
                  <LogoTile item={k} className="justify-start px-0 py-2" />
                </div>
                <div className="flex items-start gap-4">
                  <SmileArc strokeWidth={3} className="mt-[0.55em] w-4 shrink-0 text-teal-500" />
                  <p className="text-h3 font-light text-teal-900">
                    <span className="sr-only">{k.name}: </span>
                    {k.project}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 05 · Partner customer references */}
      <Section tone="paper" aria-labelledby="references-title">
        <Container>
          <Reveal>
            <SectionHeading
              num="05"
              eyebrow="Partner references"
              title="Platforms proven at *scale*."
              lead="Global brands already running on the platforms we bring to KSA and the UAE."
              id="references-title"
            />
          </Reveal>
          <div className="mt-14 flex flex-col gap-12 md:mt-20">
            {REFERENCE_GROUPS.map((g, i) => (
              <div key={g.partnerId} className="flex flex-col gap-5">
                <Eyebrow num={String(i + 1).padStart(2, "0")}>{g.title}</Eyebrow>
                <LogoWall items={g.logos} columns={g.logos.length > 6 ? 5 : g.logos.length > 4 ? 5 : 4} />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand title="Let's build your *ecosystem*." />
    </>
  );
}
