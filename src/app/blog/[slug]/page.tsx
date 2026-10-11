import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService as getPillar } from "@/content";
import { formatDate, getAdjacentPosts, getAllPosts, getPost, getRelatedPosts, metaDescription } from "@/lib/blog";
import { SITE_NAME, SITE_URL, blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";
import { CtaBand } from "@/components/sections/CtaBand";
import { PostCard } from "@/components/blog/PostCard";
import { ShareLinks } from "@/components/blog/ShareLinks";
import { TableOfContents } from "@/components/blog/TableOfContents";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.seoTitle ?? post.title;
  const description = metaDescription(post.description);
  const path = `/blog/${post.slug}`;
  const pillar = getPillar(post.category);
  return {
    title,
    description,
    alternates: { canonical: path, types: { "application/rss+xml": "/blog/rss.xml" } },
    authors: [{ name: post.author, url: SITE_URL }],
    category: pillar?.name,
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      locale: "en_US",
      publishedTime: `${post.date}T08:00:00+03:00`,
      modifiedTime: `${post.updated}T08:00:00+03:00`,
      section: pillar?.name,
      authors: [post.author],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const pillar = getPillar(post.category);
  const related = getRelatedPosts(post, 3);
  const { newer, older } = getAdjacentPosts(post.slug);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Insights", href: "/blog" },
    ...(pillar ? [{ label: pillar.verb, href: `/blog/category/${pillar.slug}` }] : []),
    { label: post.title },
  ];
  const url = `${SITE_URL}/blog/${post.slug}`;
  const showToc = post.toc.length >= 2;

  return (
    <>
      <JsonLd data={blogPostingJsonLd({ ...post, category: pillar?.name ?? "Insights" })} />
      <JsonLd data={breadcrumbJsonLd(crumbs, `/blog/${post.slug}`)} />

      <article>
        <header className="surface-dark relative isolate overflow-hidden bg-teal-900 text-teal-100">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_80%_0%,var(--color-teal-800)_0%,transparent_65%),radial-gradient(60%_50%_at_0%_100%,var(--color-stage)_0%,transparent_70%)]"
          />
          <div className="container-site flex flex-col gap-7 pt-[calc(72px+clamp(3.5rem,8vw,7rem))] pb-[clamp(3rem,6vw,5rem)]">
            <Breadcrumb items={crumbs} tone="dark" />
            {pillar ? (
              <Link href={`/blog/category/${pillar.slug}`} className="w-fit">
                <Eyebrow tone="dark" num={pillar.num}>
                  {pillar.verb} · {pillar.name}
                </Eyebrow>
              </Link>
            ) : null}
            <h1 className="max-w-[22ch] text-h1 font-light text-paper">{post.title}</h1>
            <p className="max-w-2xl text-body-l text-teal-200">{post.description}</p>
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-small text-teal-300">
              <div className="flex gap-2">
                <dt className="sr-only">Published</dt>
                <dd>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </dd>
              </div>
              {post.updated !== post.date ? (
                <div className="flex gap-2">
                  <dt>Updated</dt>
                  <dd>
                    <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                  </dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt className="sr-only">Reading time</dt>
                <dd>{post.readingMinutes} min read</dd>
              </div>
              <div className="flex gap-2">
                <dt className="sr-only">Author</dt>
                <dd>{post.author}</dd>
              </div>
            </dl>
          </div>
        </header>

        <Section tone="paper" className="pt-0!" aria-label="Article">
          <Container>
            {post.cover ? (
              <div className="relative -mt-px mb-14 aspect-[16/9] overflow-hidden rounded-b-[var(--radius-card)] bg-teal-900 md:mb-20 lg:mx-auto lg:w-[min(100%,1100px)]">
                <Image
                  src={post.cover}
                  alt={post.coverAlt ?? post.title}
                  fill
                  sizes="(min-width: 1100px) 1100px, 100vw"
                  fetchPriority="high"
                  loading="eager"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-14 md:h-20" />
            )}

            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <aside className="order-2 flex flex-col gap-10 lg:order-1 lg:col-span-3">
                <div className="flex flex-col gap-10 lg:sticky lg:top-28">
                  {showToc ? <TableOfContents items={post.toc} /> : null}
                  <ShareLinks url={url} title={post.title} />
                </div>
              </aside>

              <div className="order-1 min-w-0 lg:order-2 lg:col-span-8 lg:col-start-5">
                <div className="prose-gd max-w-[70ch]" dangerouslySetInnerHTML={{ __html: post.html }} />

                {pillar ? (
                  <div className="surface-dark mt-16 flex flex-col gap-5 rounded-[var(--radius-card)] bg-teal-900 p-8 text-teal-100 md:flex-row md:items-center md:justify-between md:p-10">
                    <div className="flex flex-col gap-3">
                      <Eyebrow tone="dark" num={pillar.num}>
                        {pillar.verb}
                      </Eyebrow>
                      <p className="max-w-md text-h3 font-light text-paper">{pillar.oneLiner}</p>
                    </div>
                    <ArrowLink href={`/services/${pillar.slug}`} tone="dark">
                      Explore {pillar.verb}
                    </ArrowLink>
                  </div>
                ) : null}

                {newer || older ? (
                  <nav aria-label="More articles" className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
                    {older ? (
                      <Link href={`/blog/${older.slug}`} rel="prev" className="group flex flex-col gap-2 rounded-[var(--radius-card)] border border-line p-6 hover:border-teal-900/30">
                        <span className="eyebrow text-teal-600">← Previous</span>
                        <span className="text-[1.0625rem] text-teal-900 group-hover:underline">{older.title}</span>
                      </Link>
                    ) : (
                      <span />
                    )}
                    {newer ? (
                      <Link href={`/blog/${newer.slug}`} rel="next" className="group flex flex-col items-end gap-2 rounded-[var(--radius-card)] border border-line p-6 text-right hover:border-teal-900/30">
                        <span className="eyebrow text-teal-600">Next →</span>
                        <span className="text-[1.0625rem] text-teal-900 group-hover:underline">{newer.title}</span>
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </div>
            </div>
          </Container>
        </Section>
      </article>

      {related.length ? (
        <Section tone="paper-2" aria-labelledby="related-title">
          <Container>
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <SectionHeading eyebrow="Keep reading" title="Related *insights*." id="related-title" />
              <ArrowLink href="/blog">All insights</ArrowLink>
            </div>
            <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} className="flex">
                  <PostCard post={p} className="w-full" />
                </li>
              ))}
            </ul>
            <SmileArc className="mx-auto mt-16 w-10 text-teal-500" strokeWidth={2.5} />
          </Container>
        </Section>
      ) : null}

      <CtaBand title="Let's talk about your *next* step." />
    </>
  );
}
