import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/blog";
import { getService } from "@/content";
import { cn } from "@/lib/cn";

/** Card for a blog post. `featured` is the large horizontal variant used for the newest post. */
export function PostCard({ post, featured = false, className }: { post: PostMeta; featured?: boolean; className?: string }) {
  const pillar = getService(post.category);
  return (
    <article
      className={cn(
        "group/post relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition-colors duration-300 hover:border-teal-900/30",
        featured && "lg:grid lg:grid-cols-12",
        className,
      )}
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-teal-900", featured && "lg:col-span-7 lg:aspect-auto lg:min-h-[420px]")}>
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.coverAlt ?? post.title}
            fill
            sizes={featured ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
            className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover/post:scale-[1.03]"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_80%_at_70%_20%,var(--color-teal-700),var(--color-teal-950))]" />
        )}
      </div>
      <div className={cn("flex flex-1 flex-col gap-4 p-6 md:p-7", featured && "lg:col-span-5 lg:justify-center lg:p-10")}>
        <p className="eyebrow text-teal-600">
          {pillar ? `${pillar.num} — ${pillar.verb}` : "Insights"}
        </p>
        <h3 className={cn("font-light text-teal-900", featured ? "text-h2" : "text-h3")}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        <p className={cn("text-[0.9375rem] leading-relaxed text-teal-700", featured ? "line-clamp-4" : "line-clamp-3")}>{post.description}</p>
        <p className="mt-auto flex items-center gap-2 pt-2 text-small text-teal-700">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </p>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-teal-500 group-focus-within/post:ring-2" />
    </article>
  );
}
