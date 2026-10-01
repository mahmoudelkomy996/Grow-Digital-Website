import type { TocItem } from "@/lib/blog";
import { cn } from "@/lib/cn";

/** "On this page" list of the article's h2/h3 headings (ids come from rehype-slug). */
export function TableOfContents({ items }: { items: TocItem[] }) {
  return (
    <nav aria-labelledby="toc-title" className="flex flex-col gap-4">
      <p id="toc-title" className="eyebrow text-teal-600">
        On this page
      </p>
      <ol className="flex flex-col border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l border-transparent py-1.5 text-small leading-snug text-teal-700 transition-colors hover:border-teal-900 hover:text-teal-900",
                item.depth === 2 ? "pl-4" : "pl-7",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
