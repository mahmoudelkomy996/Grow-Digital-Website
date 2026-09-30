import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavItem, NavLink, NavPillar } from "@/content/navigation";
import { CONTACT } from "@/content/navigation";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  id: string;
  open: boolean;
  pillars: NavPillar[];
  items: NavItem[];
  cta: NavLink;
  currentPath: string;
  onNavigate: () => void;
}

/** Full-screen dark menu for < 1024px. Scroll locking, Esc and focus return live in SiteHeader. */
export function MobileMenu({ id, open, pillars, items, cta, currentPath, onNavigate }: MobileMenuProps) {
  const links = items.filter((i) => !i.children);
  return (
    <div
      id={id}
      inert={!open}
      aria-label="Site menu"
      role="region"
      className={cn(
        "surface-dark fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-teal-950 text-teal-100 lg:hidden",
        "transition-[opacity,visibility] duration-500 ease-[var(--ease-out-expo)]",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="container-site flex min-h-full flex-col pt-[calc(72px+1.5rem)] pb-10">
        <p className="eyebrow text-lime">Pillars</p>
        <ul className="mt-4 border-t border-teal-300/15">
          {pillars.map((p, i) => {
            const current = currentPath === p.href;
            return (
              <li
                key={p.slug}
                className={cn(
                  "border-b border-teal-300/15 transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: open ? `${60 + i * 30}ms` : "0ms" }}
              >
                <Link
                  href={p.href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className="group/mob flex items-baseline gap-4 py-3.5"
                >
                  <span className="eyebrow w-6 shrink-0 text-lime tabular-nums">{p.num}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={cn("text-[1.5rem] leading-tight font-light text-paper", current && "text-mint")}>
                      {p.name}
                    </span>
                    <span className="text-small text-teal-300">{p.full}</span>
                  </span>
                  <ArrowRight aria-hidden strokeWidth={1.5} className="size-4 shrink-0 self-center text-teal-400" />
                </Link>
              </li>
            );
          })}
        </ul>

        <ul className="mt-8 flex flex-col gap-1">
          {links.map((l, i) => {
            const current = currentPath === l.href;
            return (
              <li
                key={l.href}
                className={cn(
                  "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: open ? `${280 + i * 30}ms` : "0ms" }}
              >
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-block rounded-sm py-1.5 text-[2rem] leading-tight font-light tracking-[-0.02em] text-paper transition-colors hover:text-mint",
                    current && "text-mint",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10">
          <Button href={cta.href} variant="accent" size="lg" arrow onClick={onNavigate}>
            {cta.label}
          </Button>
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-12 text-small text-teal-300">
          <a href={CONTACT.emailHref} className="self-start rounded-sm text-paper hover:text-mint">
            {CONTACT.email}
          </a>
          <a href={CONTACT.phoneHref} className="self-start rounded-sm text-paper hover:text-mint">
            {CONTACT.phone}
          </a>
          <p className="mt-2">{CONTACT.markets}</p>
        </div>
      </div>
    </div>
  );
}
