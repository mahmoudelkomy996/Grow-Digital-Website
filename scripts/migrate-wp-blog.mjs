// One-off migration of the old WordPress blog (growdigital.com/<slug>/) into content/blog/<slug>.md.
// Pulls title, SEO description, dates, cover and inline images; converts the post body to Markdown.
// Run: node scripts/migrate-wp-blog.mjs   (re-running overwrites the generated files)
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ORIGIN = "https://growdigital.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const OUT_MD = "content/blog";
const OUT_IMG = "public/blog";

/** Pillar each legacy post belongs to (used as the blog category). */
const CATEGORY = {
  "ecommerce-benefits": "grow",
  "5-common-ecommerce-mistakes-and-tips-on-how-to-avoid-them": "grow",
  "discover-the-value-of-a-one-stop-shop": "consult",
  "big-retail-group-trends-in-the-me-region": "grow",
  "uae-2031-retail-vision": "consult",
  "2030-ksa-vision": "consult",
  "value-of-customer-experience-solutions-in-retail": "solve",
  "the-rise-of-retail-trends-in-the-gulf-region-solutions": "solve",
  "the-crucial-role-of-e-commerce-and-digital-marketing-in-our-digital-generation": "grow",
  "5-tips-to-grow-an-ecommerce-website": "grow",
  "the-value-of-one-store": "solve",
  "embracing-summer-2023-retail-trends-and-cutting-edge-business-solutions": "solve",
  "digitizing-the-financial-sector": "consult",
  "unlocking-success-with-digital-business-solutions": "consult",
  "the-dynamics-of-the-e-commerce-industry": "grow",
  "the-significance-of-digital-marketing": "grow",
  "ignite-your-e-commerce-success-the-seo-advantage-in-search-bars": "grow",
  "click-connect-and-conquer-the-crucial-role-of-customer-experience-in-e-commerce-triumph": "grow",
  "safeguarding-the-digital-realm-the-vital-role-of-cybersecurity-services": "secure",
  "demystifying-soc-the-shield-against-cyber-threats": "secure",
  "revolutionizing-marketing-the-impact-of-chatbots-and-ai": "grow",
  "unlocking-the-sky-understanding-cloud-infrastructure": "operate",
  "the-advantages-of-cloud-based-solutions-in-transforming-business-operations": "operate",
  "influencer-marketing-unveiled-navigating-authentic-connections-in-the-digital-landscape": "grow",
  "fostering-success-the-strategic-impact-of-employee-benefit-platforms-on-modern-organizations": "consult",
  "mastering-the-art-of-e-commerce-marketing-for-unrivalled-success": "grow",
  "the-crucial-role-of-marketing-research-in-business-excellence": "grow",
  "unveiling-effective-digital-transformation-strategies-for-businesses": "consult",
  "decoding-the-future-unveiling-market-trends-and-insights": "grow",
  "elevating-retail-experiences-the-power-of-visual-merchandising-solutions": "solve",
  "cybersecurity-essentials-keeping-your-digital-world-safe": "secure",
  "digital-symphony-mastering-the-art-of-marketing-in-the-new-age": "grow",
  "streamlining-business-operations-understanding-erp-and-its-benefits": "consult",
  "the-power-of-brand-values-creating-meaningful-content-in-digital-marketing": "grow",
  "the-importance-of-research-and-data-analysis-for-growing-businesses": "grow",
  "the-future-of-shopping-key-e-commerce-trends-shaping-the-digital-marketplace": "grow",
  "from-vision-to-reality-why-startups-need-more-than-just-technology": "consult",
  "the-latest-impacts-of-technology-on-business-growth": "consult",
  "the-critical-importance-of-cybersecurity-for-modern-organizations": "secure",
  "the-role-of-digital-transformation-in-revolutionizing-healthcare": "consult",
  "the-role-of-iot-platforms-in-transforming-manufacturing-operations": "transform",
  "unlocking-ais-potential-in-healthcare": "transform",
  "iot-solutions-for-smart-airport": "transform",
  "industrial-iot-solutions-for-smarter-manufacturing-energy": "transform",
  "ai-in-healthcare": "transform",
  "gemini-is-powering-the-future-of-ai": "transform",
  "how-ai-is-transforming-the-logistics-industry": "transform",
};
/** Legacy duplicates: redirected to their original instead of being migrated. */
const SKIP = new Set(["gemini-is-powering-the-future-of-ai-2"]);

const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced", emDelimiter: "*" });
td.use(gfm);
td.remove(["script", "style", "noscript", "iframe", "form", "button", "svg"]);

// Images always on their own line.
td.addRule("blockImage", {
  filter: "img",
  replacement: (_content, node) => {
    const alt = (node.getAttribute("alt") || "").replace(/[[\]]/g, "");
    const src = node.getAttribute("src") || "";
    return src ? `\n\n![${alt}](${src})\n\n` : "";
  },
});

/** Clean Markdown: tidy whitespace, unbold headings, and shift heading levels so the top one is h2. */
function normalize(md) {
  md = md
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/^(\s*)([-*]|\d+\.)\s{2,}/gm, "$1$2 ")
    .replace(/^\s*\*\*\s*\*\*\s*$/gm, "")
    .replace(/^(#{1,6})\s+\*\*(.+?)\*\*\s*:?\s*$/gm, "$1 $2")
    .replace(/^(#{1,6})\s+(.+?)\s*$/gm, (_m, h, t) => `${h} ${t.replace(/\*\*/g, "").replace(/:$/, "")}`);
  const levels = [...md.matchAll(/^(#{1,6})\s/gm)].map((m) => m[1].length);
  if (levels.length) {
    const shift = Math.min(...levels) - 2;
    if (shift !== 0) md = md.replace(/^(#{1,6})(\s)/gm, (_m, h, s) => "#".repeat(Math.min(6, Math.max(2, h.length - shift))) + s);
  }
  // A paragraph that is only bold text and short reads as a heading in the old theme.
  md = md.replace(/^\*\*([^*\n]{3,80})\*\*\s*:?\s*$/gm, "## $1");
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, asBuffer = false) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
    if (res?.ok) return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text();
    await sleep(800 * (i + 1));
  }
  throw new Error(`fetch failed: ${url}`);
}

async function saveImage(url, dest, width = 1600) {
  const buf = await get(url, true);
  await sharp(buf).rotate().resize({ width, withoutEnlargement: true }).flatten({ background: "#f6f5f0" }).jpeg({ quality: 80, mozjpeg: true }).toFile(dest);
}

const yaml = (v) => JSON.stringify(v); // JSON strings are valid YAML scalars
const meta = ($, sel) => $(sel).attr("content")?.trim() || "";

const sitemap = await get(`${ORIGIN}/post-sitemap.xml`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !/\.(jpe?g|png|webp)$/i.test(u));
mkdirSync(OUT_MD, { recursive: true });
mkdirSync(OUT_IMG, { recursive: true });

const report = [];
for (const url of urls) {
  const slug = new URL(url).pathname.replace(/^\/|\/$/g, "");
  if (SKIP.has(slug)) { report.push(`skip ${slug}`); continue; }
  const html = await get(url);
  const $ = cheerio.load(html);

  const h1 = $("h1.entry-title").first().text().trim() || $("h1").first().text().trim();
  const ogTitle = meta($, 'meta[property="og:title"]').replace(/\s*[-|–]\s*Grow Digital\s*$/i, "");
  const title = h1 || ogTitle;
  const description = meta($, 'meta[name="description"]') || meta($, 'meta[property="og:description"]');
  const published = meta($, 'meta[property="article:published_time"]');
  const modified = meta($, 'meta[property="article:modified_time"]') || published;
  const ogImage = meta($, 'meta[property="og:image"]');

  const body = $(".post-content").first();
  body.find(".fusion-sharing-box, .fusion-meta-info, .related-posts, .fusion-separator, .fusion-author, .fusion-comments, .about-author").remove();
  body.find("h1").each((_, el) => { el.tagName = "h2"; });

  // Inline images: Avada lazy-loads with data-orig-src; download to public/blog/<slug>/
  let n = 0;
  const inline = [];
  body.find("img").each((_, el) => {
    const src = $(el).attr("data-orig-src") || $(el).attr("data-src") || $(el).attr("src") || "";
    if (!src || src.startsWith("data:")) { $(el).remove(); return; }
    const abs = new URL(src, ORIGIN).href;
    if (abs === ogImage) { $(el).remove(); return; } // the cover is shown separately
    const file = `${++n}.jpg`;
    inline.push({ abs, file });
    $(el).attr("src", `/blog/${slug}/${file}`).removeAttr("srcset").removeAttr("sizes").removeAttr("data-orig-src");
    if (!$(el).attr("alt")) $(el).attr("alt", title);
  });

  let md = normalize(td.turndown(body.html() || ""));

  let cover = "";
  if (ogImage) {
    try { await saveImage(ogImage, join(OUT_IMG, `${slug}.jpg`)); cover = `/blog/${slug}.jpg`; } catch (e) { report.push(`cover failed ${slug}: ${e.message}`); }
  }
  if (inline.length) {
    mkdirSync(join(OUT_IMG, slug), { recursive: true });
    for (const img of inline) {
      try { await saveImage(img.abs, join(OUT_IMG, slug, img.file), 1400); } catch (e) { report.push(`inline failed ${slug}/${img.file}: ${e.message}`); }
    }
  }

  const fm = [
    "---",
    `title: ${yaml(title)}`,
    ...(ogTitle && ogTitle !== title ? [`seoTitle: ${yaml(ogTitle)}`] : []),
    `description: ${yaml(description)}`,
    `date: ${yaml(published.slice(0, 10))}`,
    `updated: ${yaml(modified.slice(0, 10))}`,
    `category: ${yaml(CATEGORY[slug] ?? "consult")}`,
    ...(cover ? [`cover: ${yaml(cover)}`, `coverAlt: ${yaml(title)}`] : []),
    `author: ${yaml("Grow Digital Team")}`,
    `legacyUrl: ${yaml(url)}`,
    "---",
    "",
  ].join("\n");
  writeFileSync(join(OUT_MD, `${slug}.md`), fm + md + "\n");
  report.push(`ok ${slug} (${md.length} chars, ${inline.length} images${CATEGORY[slug] ? "" : ", NO CATEGORY"})`);
  await sleep(250);
}
console.log(report.join("\n"));
