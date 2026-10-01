// Blog engine: Markdown files in content/blog/<slug>.md (frontmatter + body), rendered at build time.
import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import type { PillarSlug } from "@/content/types";

const DIR = join(process.cwd(), "content/blog");
export const POSTS_PER_PAGE = 12;
const PILLAR_SLUGS: PillarSlug[] = ["consult", "transform", "build", "operate", "secure", "solve", "grow"];

export interface PostMeta {
  slug: string;
  title: string;
  /** Optional <title>/OG title when it differs from the on-page H1 */
  seoTitle?: string;
  description: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  updated: string;
  category: PillarSlug;
  cover?: string;
  coverAlt?: string;
  author: string;
  legacyUrl?: string;
  readingMinutes: number;
  wordCount: number;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface Post extends PostMeta {
  html: string;
  toc: TocItem[];
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v instanceof Date ? v.toISOString().slice(0, 10) : "");

function words(md: string) {
  return md
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`[\]()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function parseFile(file: string): { meta: PostMeta; body: string } {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(readFileSync(join(DIR, file), "utf8"));
  const category = (PILLAR_SLUGS as string[]).includes(str(data.category)) ? (str(data.category) as PillarSlug) : "consult";
  const wordCount = words(content);
  const date = str(data.date);
  return {
    body: content,
    meta: {
      slug,
      title: str(data.title) || slug,
      seoTitle: str(data.seoTitle) || undefined,
      description: str(data.description),
      date,
      updated: str(data.updated) || date,
      category,
      cover: str(data.cover) || undefined,
      coverAlt: str(data.coverAlt) || undefined,
      author: str(data.author) || "Grow Digital Team",
      legacyUrl: str(data.legacyUrl) || undefined,
      wordCount,
      readingMinutes: Math.max(1, Math.round(wordCount / 220)),
    },
  };
}

const readAll = cache(() =>
  readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseFile)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : a.meta.date > b.meta.date ? -1 : a.meta.slug.localeCompare(b.meta.slug))),
);

/** All posts, newest first. */
export const getAllPosts = cache((): PostMeta[] => readAll().map((p) => p.meta));

export function getPostsByCategory(category: PillarSlug): PostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

/** Categories (pillars) that have at least one post, in pillar order. */
export function getBlogCategories(): { slug: PillarSlug; count: number }[] {
  const all = getAllPosts();
  return PILLAR_SLUGS.map((slug) => ({ slug, count: all.filter((p) => p.category === slug).length })).filter((c) => c.count > 0);
}

export function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  return { items: items.slice(start, start + POSTS_PER_PAGE), page, totalPages };
}

/** Rehype plugin: lazy images, external links in a new tab, and the TOC from h2/h3 (after rehype-slug). */
function rehypeEnhance(toc: TocItem[]) {
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        node.properties = { ...node.properties, loading: "lazy", decoding: "async" };
      }
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//.test(href) && !href.startsWith("https://growdigital.com")) {
          node.properties = { ...node.properties, target: "_blank", rel: ["noopener", "noreferrer"] };
        }
      }
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        const text = node.children.map((c) => ("value" in c ? c.value : "children" in c ? (c.children as { value?: string }[]).map((x) => x.value ?? "").join("") : "")).join("").trim();
        if (text) toc.push({ id: String(node.properties.id), text, depth: node.tagName === "h2" ? 2 : 3 });
      }
    });
  };
}

/** Rewrite links to legacy root-level post URLs (growdigital.com/<slug>/) to /blog/<slug>. */
function rewriteLegacyLinks(md: string, slugs: Set<string>) {
  return md.replace(/\]\((https?:\/\/(?:www\.)?growdigital\.com)?\/([a-z0-9-]+)\/?\)/g, (m, _host, s) => (slugs.has(s) ? `](/blog/${s})` : m));
}

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const entry = readAll().find((p) => p.meta.slug === slug);
  if (!entry) return null;
  const toc: TocItem[] = [];
  const slugs = new Set(readAll().map((p) => p.meta.slug));
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeEnhance(toc))
    .use(rehypeStringify)
    .process(rewriteLegacyLinks(entry.body, slugs));
  return { ...entry.meta, html: String(file), toc };
});

/** Up to `n` related posts: same category first, then the most recent others. */
export function getRelatedPosts(post: PostMeta, n = 3): PostMeta[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.category === post.category);
  const rest = others.filter((p) => p.category !== post.category);
  return [...same, ...rest].slice(0, n);
}

/** Older / newer neighbours in date order. */
export function getAdjacentPosts(slug: string): { newer?: PostMeta; older?: PostMeta } {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  return { newer: i > 0 ? all[i - 1] : undefined, older: i >= 0 && i < all.length - 1 ? all[i + 1] : undefined };
}

/** Meta description: at most 158 characters, cut at a word boundary. */
export function metaDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
