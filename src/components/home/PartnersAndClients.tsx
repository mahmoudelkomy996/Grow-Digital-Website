import { CLIENT_SECTORS, PARTNERS } from "@/content";
import { cn } from "@/lib/cn";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { LogoWall } from "@/components/sections/LogoWall";

export function PartnersAndClients() {
  return (
    <Section tone="paper" aria-labelledby="partners-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Partners and clients"
              title="In good *company*."
              lead="Global technology partners behind our delivery, and the organizations that trust us with theirs."
              id="partners-title"
            />
          </Reveal>
          <ArrowLink href="/partners">All partners</ArrowLink>
        </div>
      </Container>

      <LogoMarquee items={PARTNERS} label="Technology and solution partners" className="mt-14 md:mt-20" />

      <Container className="mt-16 grid gap-x-8 gap-y-12 md:mt-24 lg:grid-cols-2">
        {CLIENT_SECTORS.map((sector, i) => {
          // Small sectors (two clients) sit side by side; larger ones take the full row.
          const small = sector.clients.length <= 2;
          return (
            <Reveal key={sector.id} className={cn("flex flex-col gap-5", !small && "lg:col-span-2")}>
              <Eyebrow num={String(i + 1).padStart(2, "0")}>{sector.name}</Eyebrow>
              <LogoWall items={sector.clients} columns={small ? 2 : sector.clients.length > 4 ? 6 : 4} />
            </Reveal>
          );
        })}
      </Container>
    </Section>
  );
}
