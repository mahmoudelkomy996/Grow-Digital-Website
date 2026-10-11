import { Link } from "@/components/ui/Link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavItem, NavMenu } from "@/content/types";
import { Headline } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";

interface MegaMenuProps {
  id: string;
  /** The open dropdown's menu id, or null when closed */
  openId: string | null;
  items: NavItem[];
  /** Whether an internal href is the current page (locale-aware) */
  isActive: (href: string) => boolean;
  /** Id of the trigger button for a menu id (for aria-labelledby) */
  triggerId: (menuId: string) => string;
  /** Called when a link inside the panel is activated */
  onNavigate: () => void;
}

function MenuPane({ menu, isActive, onNavigate }: { menu: NavMenu; isActive: (href: string) => boolean; onNavigate: () => void }) {
  const multi = menu.groups.length > 1;
  return (
    <>
      <div className="flex items-end justify-between gap-8 border-b border-line pb-6">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3 text-teal-600">{menu.eyebrow}</p>
          <p className="text-[1.875rem] leading-tight font-light tracking-[-0.02em] text-teal-900">
            <Headline text={menu.title} />
          </p>
          <p className="mt-2 text-[0.9375rem] text-teal-700">{menu.intro}</p>
        </div>
        <Link
          href={menu.explore.href}
          onClick={onNavigate}
          className="group/x flex shrink-0 items-center gap-2 border-b border-current pb-0.5 text-[0.9375rem] text-teal-900"
        >
          {menu.explore.label}
          <ArrowRight aria-hidden strokeWidth={1.5} className="flip-rtl size-4 transition-transform group-hover/x:translate-x-0.5 rtl:group-hover/x:-translate-x-0.5" />
        </Link>
      </div>

      <div className={cn("grid gap-8 pt-6", multi ? "grid-cols-4" : menu.promo ? "grid-cols-[1.6fr_1fr]" : "grid-cols-1")}>
        {multi ? (
          menu.groups.map((g) => (
            <div key={g.title}>
              <p className="text-[0.9375rem] font-medium text-teal-900">{g.title}</p>
              {g.question ? <p className="mt-1 mb-3 font-serif text-[1.0625rem] leading-snug text-teal-700 italic">{g.question}</p> : null}
              <ul className="flex flex-col">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onNavigate}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className="-mx-2.5 flex items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-[0.9375rem] text-teal-900 transition-colors hover:bg-paper-2"
                    >
                      <SmileArc strokeWidth={3} className="mt-[0.5em] w-2.5 shrink-0 text-teal-500" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <ul className="grid grid-cols-2 content-start gap-x-6">
            {menu.groups[0].links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  className="-mx-2.5 flex flex-col rounded-[10px] px-2.5 py-2.5 transition-colors hover:bg-paper-2"
                >
                  <span className="flex items-center gap-2.5 text-[0.9375rem] text-teal-900">
                    <SmileArc strokeWidth={3} className="w-2.5 shrink-0 text-teal-500" />
                    {l.label}
                  </span>
                  {l.summary ? <span className="mt-0.5 ps-5 text-[0.8125rem] leading-snug text-teal-700">{l.summary}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!multi && menu.promo ? (
          <div className="surface-dark relative isolate flex flex-col gap-3 self-start overflow-hidden rounded-[var(--radius-card)] bg-teal-900 p-6 text-teal-100">
            <p className="eyebrow text-lime">{menu.promo.eyebrow}</p>
            <p className="text-[1.25rem] leading-snug text-paper">{menu.promo.title}</p>
            {menu.promo.body ? <p className="text-small text-teal-200">{menu.promo.body}</p> : null}
            {menu.promo.items?.length ? (
              <ul className="mt-1 flex flex-col gap-2">
                {menu.promo.items.map((x) => (
                  <li key={x.name}>
                    <Link
                      href={x.href ?? menu.explore.href}
                      onClick={onNavigate}
                      className="block rounded-[12px] border border-teal-300/15 bg-teal-900 px-3.5 py-2.5 transition-colors hover:border-lime/60"
                    >
                      <span className="block text-[0.875rem] font-medium text-paper">{x.name}</span>
                      <span className="block text-[0.8125rem] text-teal-300">{x.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <SmileArc strokeWidth={2.5} className="pointer-events-none absolute -end-8 -bottom-10 -z-10 w-40 rtl:-scale-x-100 text-teal-800" />
          </div>
        ) : null}
      </div>
    </>
  );
}

/**
 * Full-width dropdown under the header bar (desktop only). Every menu is rendered in the server HTML so the
 * links are crawlable; only the open one is visible. Hidden with `visibility` (and `inert`) while closed.
 */
export function MegaMenu({ id, openId, items, isActive, triggerId, onNavigate }: MegaMenuProps) {
  const open = openId !== null;
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "absolute inset-x-0 top-full hidden border-b border-line bg-paper text-teal-900 shadow-[0_30px_60px_-30px_rgba(4,31,31,0.35)] lg:block",
        "transition-[opacity,translate,visibility] duration-300 ease-[var(--ease-out-expo)]",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
      )}
    >
      <div className="container-site pt-8 pb-10">
        {items
          .filter((i) => i.menu)
          .map((i) => (
            <section
              key={i.menu!.id}
              id={`${id}-${i.menu!.id}`}
              role="region"
              aria-labelledby={triggerId(i.menu!.id)}
              hidden={openId !== i.menu!.id}
            >
              <MenuPane menu={i.menu!} isActive={isActive} onNavigate={onNavigate} />
            </section>
          ))}
      </div>
    </div>
  );
}
