import type { Metadata } from "next";
import { COMPANY, IMAGES, SERVICES } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SmileArc } from "@/components/ui/SmileArc";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Talk to Grow Digital: one accountable team for consulting, data and AI, software, managed services, cybersecurity and growth in KSA and the UAE.",
  path: "/contact",
});

export default function ContactPage() {
  const interests = [
    ...SERVICES.map((p) => ({ value: p.name, label: `${p.num} ${p.name}` })),
    { value: "Not sure yet", label: "Not sure yet" },
  ];
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's *talk*."
        lead="Tell us where you are today and what you want to achieve. One accountable team will take it from there."
        image={IMAGES["contact-hero"]}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Section tone="paper" aria-label="Contact form and details">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h2 className="mb-10 text-h2 font-light text-teal-900">Send us a message</h2>
            <ContactForm interests={interests} />
          </div>

          <aside className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9" aria-label="Contact details">
            <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-teal-900 p-8 text-teal-100">
              <Eyebrow tone="dark">Direct</Eyebrow>
              <a href={`mailto:${COMPANY.email}`} className="text-h3 font-light text-paper underline-offset-4 hover:underline">
                {COMPANY.email}
              </a>
              <a href={COMPANY.phoneHref} className="text-h3 font-light text-paper underline-offset-4 hover:underline">
                {COMPANY.phone}
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <Eyebrow>Markets</Eyebrow>
              <ul className="border-t border-line">
                {COMPANY.markets.map((m) => (
                  <li key={m} className="flex items-center gap-3 border-b border-line py-4 text-teal-900">
                    <SmileArc strokeWidth={3} className="w-3.5 text-teal-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Eyebrow>Follow</Eyebrow>
              <ul className="flex flex-wrap gap-2">
                {COMPANY.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[0.9375rem] text-teal-900 transition-colors hover:border-teal-900/40"
                    >
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
