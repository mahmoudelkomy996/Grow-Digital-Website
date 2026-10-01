// Pillar-specific sections (TRANSFORM, OPERATE, SECURE, SOLVE) built from the extra content exports.
import type { Partner, Pillar } from "@/content/types";
import {
  AGPM,
  DATA_AI_STATEMENT,
  EXCLUSIVE_STATEMENT,
  KEY_PROJECTS,
  KEY_PROJECTS_NOTE,
  REFERENCE_GROUPS,
  SECURE_SPECIAL,
  SOLUTIONS,
  getPartners,
  partnersInGroup,
} from "@/content";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LogoTile } from "@/components/ui/LogoTile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";
import { LogoWall } from "@/components/sections/LogoWall";
import { SolutionCard } from "@/components/sections/SolutionCard";

interface Highlight {
  title: string;
  text: string;
}

/** Numbered highlight cards on a dark band (AGPM benefits, "What's special"). */
function HighlightGrid({ items }: { items: Highlight[] }) {
  return (
    <ul className={items.length === 3 ? "grid gap-3 md:grid-cols-3" : "grid gap-3 md:grid-cols-2 xl:grid-cols-4"}>
      {items.map((h, i) => (
        <Reveal
          as="li"
          key={h.title}
          delay={i * 90}
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-teal-300/15 bg-teal-950/40 p-7"
        >
          <span className="eyebrow text-lime">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="text-h3 font-light text-paper">{h.title}</h3>
          <p className="text-[0.9375rem] leading-relaxed text-teal-200">{h.text}</p>
        </Reveal>
      ))}
    </ul>
  );
}

/** Partner cards: logo or wordmark, name and description. */
function PartnerCards({ partners, tone = "paper" }: { partners: Partner[]; tone?: "paper" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {partners.map((p, i) => (
        <Reveal
          as="li"
          key={p.id}
          delay={i * 80}
          className={
            dark
              ? "flex flex-col rounded-[var(--radius-card)] border border-teal-300/15 bg-teal-950/40"
              : "flex flex-col rounded-[var(--radius-card)] border border-line bg-paper"
          }
        >
          <div className={dark ? "border-b border-teal-300/15" : "border-b border-line"}>
            <LogoTile item={p} tone={tone} />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <h3 className={dark ? "text-[1.125rem] text-paper" : "text-[1.125rem] text-teal-900"}>{p.name}</h3>
            <p className={dark ? "text-small text-teal-200" : "text-small text-teal-700"}>{p.description}</p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

function TransformExtras() {
  const dataAi = partnersInGroup("data-ai");
  const iot = getPartners(["skysens", "maestrohub"]);
  const refs = REFERENCE_GROUPS.find((g) => g.partnerId === "skysens");
  return (
    <>
      <Section tone="dark" id="agpm" aria-labelledby="agpm-title">
        <Container>
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <SectionHeading
              eyebrow="Agile Predictive Monitoring"
              title="Predictive monitoring for *smarter* infrastructure."
              lead={AGPM.title}
              tone="dark"
              id="agpm-title"
              className="lg:col-span-8"
            />
          </Reveal>
          <div className="mt-14 md:mt-20">
            <HighlightGrid items={AGPM.benefits} />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-2 text-teal-300">Platform</span>
            {AGPM.platform.map((q) => (
              <Chip key={q} tone="dark">
                {q}
              </Chip>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper" aria-labelledby="transform-partners-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Partners"
              title="Global partners, local *delivery*."
              lead={DATA_AI_STATEMENT}
              id="transform-partners-title"
            />
          </Reveal>
          <div className="mt-14 flex flex-col gap-14 md:mt-20">
            <div className="flex flex-col gap-5">
              <Eyebrow num="01">Data and AI</Eyebrow>
              <PartnerCards partners={dataAi} />
            </div>
            <div className="flex flex-col gap-5">
              <Eyebrow num="02">Industrial IoT</Eyebrow>
              <PartnerCards partners={iot} />
            </div>
            {refs ? (
              <div className="flex flex-col gap-5">
                <Eyebrow num="03">{refs.title}</Eyebrow>
                <LogoWall items={refs.logos} columns={5} />
              </div>
            ) : null}
          </div>
        </Container>
      </Section>
    </>
  );
}

function OperateExtras() {
  return (
    <Section tone="dark" aria-labelledby="cloud-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Cloud platforms"
            title="Every major cloud, *one* operating team."
            lead="We help organizations adopt and run the leading cloud platforms, from migration and infrastructure design to security, analytics and AI."
            tone="dark"
            id="cloud-title"
          />
        </Reveal>
        <div className="mt-14 md:mt-20">
          <PartnerCards partners={partnersInGroup("cloud")} tone="dark" />
        </div>
      </Container>
    </Section>
  );
}

function SecureExtras() {
  return (
    <>
      <Section tone="dark" aria-labelledby="special-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={SECURE_SPECIAL.title}
              title="What makes our defense *different*."
              tone="dark"
              id="special-title"
            />
          </Reveal>
          <div className="mt-14 md:mt-20">
            <HighlightGrid items={SECURE_SPECIAL.points} />
          </div>
        </Container>
      </Section>

      <Section tone="paper" aria-labelledby="projects-title">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Key projects" title="Trusted where the stakes are *highest*." lead={KEY_PROJECTS_NOTE} id="projects-title" />
          </Reveal>
          <ul className="mt-14 border-t border-line md:mt-20">
            {KEY_PROJECTS.map((k, i) => (
              <Reveal
                as="li"
                key={k.id}
                delay={i * 60}
                className="grid items-center gap-4 border-b border-line py-6 sm:grid-cols-[12rem_1fr] md:gap-10"
              >
                <div className="w-48 max-w-full">
                  <LogoTile item={k} className="justify-start px-0 py-2" />
                </div>
                <div className="flex items-start gap-4">
                  <SmileArc strokeWidth={3} className="mt-[0.55em] w-4 shrink-0 text-teal-500" />
                  <p className="text-h3 font-light text-teal-900">{k.project}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}

function SolveExtras() {
  const own = SOLUTIONS.filter((s) => s.kind === "own");
  const exclusive = getPartners(["inveon", "mobilgi", "maestrohub", "skysens"]);
  const refs = REFERENCE_GROUPS.filter((g) => g.partnerId === "inveon" || g.partnerId === "mobilgi");
  return (
    <>
      <Section tone="paper" id="our-solutions" aria-labelledby="own-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Grow Digital solutions"
              title="Platforms we *build* and own."
              lead="Our own digital and AI products, designed for enterprises and healthcare providers in KSA and the UAE."
              id="own-title"
            />
          </Reveal>
          <ul className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-3">
            {own.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 100} className="flex">
                <SolutionCard solution={s} className="w-full" />
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="dark" aria-labelledby="exclusive-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Exclusive representation"
              title="Exclusive in KSA and the *UAE*."
              lead={EXCLUSIVE_STATEMENT}
              tone="dark"
              id="exclusive-title"
            />
          </Reveal>
          <div className="mt-14 md:mt-20">
            <PartnerCards partners={exclusive} tone="dark" />
          </div>
        </Container>
      </Section>

      <Section tone="paper" aria-labelledby="references-title">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Customer references" title="Platforms proven at *scale*." id="references-title" />
          </Reveal>
          <div className="mt-14 flex flex-col gap-12 md:mt-20">
            {refs.map((g, i) => (
              <div key={g.partnerId} className="flex flex-col gap-5">
                <Eyebrow num={String(i + 1).padStart(2, "0")}>{g.title}</Eyebrow>
                <LogoWall items={g.logos} columns={g.logos.length > 5 ? 4 : 5} />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

/** Extra sections for the pillars that have them; renders nothing for the others. */
export function PillarExtras({ pillar }: { pillar: Pillar }) {
  switch (pillar.slug) {
    case "transform":
      return <TransformExtras />;
    case "operate":
      return <OperateExtras />;
    case "secure":
      return <SecureExtras />;
    case "solve":
      return <SolveExtras />;
    default:
      return null;
  }
}

/** Pillars whose extras already present their partners (so the generic partner strip is skipped). */
export const PILLARS_WITH_PARTNER_EXTRAS = new Set(["transform", "operate", "solve"]);
