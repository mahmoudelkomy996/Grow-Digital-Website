import { COMPANY } from "@/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";

/** The positioning statement right after the story: integrator, not vendor; then mission and vision. */
export function IntegratorStatement() {
  return (
    <Section tone="paper" id="integrator" aria-labelledby="integrator-title" className="scroll-mt-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-8">
            <SectionHeading
              eyebrow="Why an integrator"
              title="A business integrator, not another vendor in the *stack*."
              id="integrator-title"
              arc
            />
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-6 lg:col-span-4 lg:pt-14">
            <p className="text-body-l text-teal-700">{COMPANY.proof}</p>
            <p className="text-body text-teal-700">{COMPANY.statement}</p>
          </Reveal>
        </div>

        <dl className="mt-16 grid border-t border-line md:mt-24 md:grid-cols-2">
          {[
            { label: "Mission", text: COMPANY.mission },
            { label: "Vision", text: COMPANY.vision },
          ].map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 120}
              className="flex flex-col gap-6 border-b border-line py-10 md:py-14 md:odd:pr-10 md:even:border-l md:even:pl-10"
            >
              <dt>
                <Eyebrow num={`0${i + 1}`}>{item.label}</Eyebrow>
              </dt>
              <dd className="text-h3 font-light text-teal-900">{item.text}</dd>
              <dd aria-hidden className="mt-auto">
                <SmileArc className="w-10 text-teal-500" strokeWidth={2.5} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
