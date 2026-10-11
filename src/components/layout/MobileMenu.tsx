"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavItem, NavLink } from "@/content/navigation";
import { CONTACT } from "@/content/navigation";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  id: string;
  open: boolean;
  items: NavItem[];
  cta: NavLink;
  currentPath: string;
  onNavigate: () => void;
}

/** Full-screen dark menu for < 1024px: one accordion per dropdown. Scroll locking, Esc and focus return live in SiteHeader. */
export function MobileMenu({ id, open, items, cta, currentPath, onNavigate }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
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
        <p className="eyebrow text-lime">Menu</p>
        <ul className="mt-4 border-t border-teal-300/15">
          {items.map((item, i) => {
            const menu = item.menu;
            const isOpen = expanded === item.label;
            const panelId = `${id}-${menu?.id ?? i}`;
            return (
              <li
                key={item.label}
                className={cn(
                  "border-b border-teal-300/15 transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: open ? `${60 + i * 30}ms` : "0ms" }}
              >
                {menu ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setExpanded(isOpen ? null : item.label)}
                      className="flex w-full items-center gap-4 py-4 text-left"
                    >
                      {menu.num ? <span className="eyebrow w-6 shrink-0 text-lime tabular-nums">{menu.num}</span> : null}
                      <span className="flex-1 text-[1.5rem] leading-tight font-light text-paper">{item.label}</span>
                      <Plus aria-hidden strokeWidth={1.5} className={cn("size-5 shrink-0 text-teal-300 transition-transform duration-300", isOpen && "rotate-45")} />
                    </button>
                    <div id={panelId} hidden={!isOpen} className="pb-5 pl-10">
                      <Link href={menu.explore.href} onClick={onNavigate} className="mb-2 inline-block text-small text-mint underline underline-offset-4">
                        {menu.explore.label}
                      </Link>
                      {menu.groups.map((g, gi) => (
                        <div key={g.title ?? gi}>
                          {g.title ? <p className="mt-4 mb-1 text-[0.8125rem] font-medium text-teal-300">{g.title}</p> : null}
                          <ul>
                            {g.links.map((l) => (
                              <li key={l.href}>
                                <Link
                                  href={l.href}
                                  onClick={onNavigate}
                                  aria-current={currentPath === l.href ? "page" : undefined}
                                  className="block py-2 text-[1.0625rem] text-teal-100 hover:text-mint"
                                >
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {menu.promo?.eyebrow === "Our products" && menu.promo.items ? (
                        <>
                          <p className="mt-4 mb-1 text-[0.8125rem] font-medium text-teal-300">Our products</p>
                          <ul>
                            {menu.promo.items.map((x) => (
                              <li key={x.name}>
                                <Link href={x.href ?? menu.explore.href} onClick={onNavigate} className="block py-2 text-[1.0625rem] text-teal-100 hover:text-mint">
                                  {x.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={currentPath === item.href ? "page" : undefined}
                    className="block py-4 text-[1.5rem] leading-tight font-light text-paper hover:text-mint"
                  >
                    {item.label}
                  </Link>
                )}
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
