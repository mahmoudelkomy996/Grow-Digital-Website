import { COMPANY, PILLARS, SOLUTIONS } from "@/content";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants and answer engines. */
export function GET() {
  const posts = getAllPosts().slice(0, 20);
  const body = `# ${COMPANY.name}

> ${COMPANY.positioning}. ${COMPANY.intro}

${COMPANY.statement} Markets: ${COMPANY.markets.join(", ")}. Contact: ${COMPANY.email}, ${COMPANY.phone}.

## Pillars

${PILLARS.map((p) => `- [${p.num} ${p.verb} — ${p.name}](${SITE_URL}/pillars/${p.slug}): ${p.oneLiner}`).join("\n")}

## Solutions

${SOLUTIONS.map((s) => `- ${s.name} (${s.by}): ${s.category}`).join("\n")}

## Company

- [About](${SITE_URL}/about): mission, vision, values and how we work
- [Use cases](${SITE_URL}/use-cases): AI and IoT programs with measured results
- [Partners and clients](${SITE_URL}/partners)
- [Contact](${SITE_URL}/contact)

## Insights (latest)

${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`).join("\n")}

## Optional

- [All insights](${SITE_URL}/blog)
- [RSS feed](${SITE_URL}/blog/rss.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
