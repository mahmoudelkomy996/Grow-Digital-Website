import Link from "next/link";
import type { ServiceSlug } from "@/content";
import { getService } from "@/content";
import type { PostMeta } from "@/lib/blog";
import { getAllPosts, getBlogCategories } from "@/lib/blog";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PostCard } from "./PostCard";

const pageHref = (base: string, page: number) => (page <= 1 ? base : `${base}/page/${page}`);

function CategoryNav({ active }: { active?: ServiceSlug }) {
  const total = getAllPosts().length;
  const linkClass = (on: boolean) =>
    cn(
      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.9375rem] transition-colors duration-300",
      on ? "border-teal-900 bg-teal-900 text-paper" : "border-line bg-paper text-teal-900 hover:border-teal-900/40",
    );
  return (
    <nav aria-label="Blog categories" className="border-b border-line pb-8">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href="/blog" className={linkClass(!active)} aria-current={!active ? "page" : undefined}>
            All <span className="eyebrow opacity-70">{total}</span>
          </Link>
        </li>
        {getBlogCategories().map((c) => {
          const pillar = getService(c.slug);
          return (
            <li key={c.slug}>
              <Link href={`/blog/category/${c.slug}`} className={linkClass(active === c.slug)} aria-current={active === c.slug ? "page" : undefined}>
                {pillar?.verb} <span className="eyebrow opacity-70">{c.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Pagination({ base, page, totalPages }: { base: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const btn = "inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-[0.9375rem] transition-colors duration-300";
  return (
    <nav aria-label="Pagination" className="mt-16 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={pageHref(base, page - 1)} rel="prev" className={cn(btn, "border-line text-teal-900 hover:border-teal-900/40")}>
          ← Newer
        </Link>
      ) : null}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={pageHref(base, n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Page ${n}`}
          className={cn(btn, n === page ? "border-teal-900 bg-teal-900 text-paper" : "border-line text-teal-900 hover:border-teal-900/40")}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={pageHref(base, page + 1)} rel="next" className={cn(btn, "border-line text-teal-900 hover:border-teal-900/40")}>
          Older →
        </Link>
      ) : null}
    </nav>
  );
}

/** Post listing used by /blog, /blog/page/[n] and the category pages. */
export function BlogIndex({
  posts,
  page,
  totalPages,
  base,
  category,
}: {
  posts: PostMeta[];
  page: number;
  totalPages: number;
  base: string;
  category?: ServiceSlug;
}) {
  const [first, ...rest] = posts;
  const featureFirst = page === 1 && !category && first;
  const grid = featureFirst ? rest : posts;
  return (
    <Section tone="paper-2" aria-labelledby="posts-title">
      <Container>
        <h2 id="posts-title" className="sr-only">
          {category ? `${getService(category)?.name} articles` : "All articles"}
          {page > 1 ? `, page ${page}` : ""}
        </h2>
        <CategoryNav active={category} />
        {featureFirst ? <PostCard post={first} featured className="mt-10" /> : null}
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {grid.map((p) => (
            <li key={p.slug} className="flex">
              <PostCard post={p} className="w-full" />
            </li>
          ))}
        </ul>
        <Pagination base={base} page={page} totalPages={totalPages} />
      </Container>
    </Section>
  );
}
