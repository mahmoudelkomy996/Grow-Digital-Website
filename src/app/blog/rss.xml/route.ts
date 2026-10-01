import { getPillar } from "@/content";
import { getAllPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of every post (newest first). */
export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const cat = getPillar(p.category)?.name;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T08:00:00+03:00`).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>${cat ? `\n      <category>${esc(cat)}</category>` : ""}${p.cover ? `\n      <enclosure url="${SITE_URL}${p.cover}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Insights</title>
    <link>${SITE_URL}/blog</link>
    <description>Ideas on digital transformation, data and AI, cloud, cybersecurity and growth in KSA and the UAE.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${posts[0]?.updated ?? "2026-10-01"}T08:00:00+03:00`).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
