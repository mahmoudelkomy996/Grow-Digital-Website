import type { SectionTone } from "@/components/ui/Section";
import type { PostMeta } from "@/lib/blog";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "./PostCard";

/** Three post cards with a heading and a link to the full listing (home page, pillar pages). */
export function LatestPosts({
  posts,
  eyebrow = "Insights",
  title = "Latest *insights*.",
  href = "/blog",
  linkLabel = "All insights",
  tone = "paper-2",
  id = "insights-title",
}: {
  posts: PostMeta[];
  eyebrow?: string;
  title?: string;
  href?: string;
  linkLabel?: string;
  tone?: SectionTone;
  id?: string;
}) {
  if (!posts.length) return null;
  return (
    <Section tone={tone} aria-labelledby={id}>
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading eyebrow={eyebrow} title={title} id={id} />
          </Reveal>
          <ArrowLink href={href}>{linkLabel}</ArrowLink>
        </div>
        <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 100} className="flex">
              <PostCard post={p} className="w-full" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
