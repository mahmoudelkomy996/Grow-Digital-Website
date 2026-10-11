import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/i18n/server";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SmileArc } from "@/components/ui/SmileArc";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({ title: t.contact.metaTitle, description: t.contact.metaDescription, path: "/contact", locale });
}

export default async function ContactPage() {
  const { c, t } = await getI18n();
  const x = t.contact;
  const COMPANY = c.COMPANY;
  const interests = [
    ...c.SERVICES.map((p) => ({ value: p.name, label: `${p.num} ${p.name}` })),
    { value: x.notSure, label: x.notSure },
  ];
  return (
    <>
      <PageHero
        eyebrow={x.eyebrow}
        title={x.title}
        lead={x.lead}
        image={c.img("contact-hero")}
        breadcrumb={[{ label: t.common.home, href: "/" }, { label: x.metaTitle }]}
      />

      <Section tone="paper" aria-label={x.formLabel}>
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h2 className="mb-10 text-h2 font-light text-teal-900">{x.formTitle}</h2>
            <ContactForm interests={interests} />
          </div>

          <aside className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9" aria-label={x.details}>
            <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-teal-900 p-8 text-teal-100">
              <Eyebrow tone="dark">{x.direct}</Eyebrow>
              <a href={`mailto:${COMPANY.email}`} className="text-h3 font-light text-paper underline-offset-4 hover:underline">
                {COMPANY.email}
              </a>
              <a href={COMPANY.phoneHref} dir="ltr" className="text-h3 font-light text-paper underline-offset-4 hover:underline">
                {COMPANY.phone}
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <Eyebrow>{x.markets}</Eyebrow>
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
              <Eyebrow>{x.follow}</Eyebrow>
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
                      <span className="sr-only"> {t.common.opensInNewTab}</span>
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
