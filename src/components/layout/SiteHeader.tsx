"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV, NAV_CTA, NAV_PILLARS, NAV_PROMO } from "@/content/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SmileArc } from "@/components/ui/SmileArc";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

const SCROLL_THRESHOLD = 24;
const MEGA_ID = "mega-menu";
const MEGA_TRIGGER_ID = "mega-menu-trigger";
const MOBILE_ID = "mobile-menu";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getScrolledServer = () => false;

/**
 * Fixed 72px header. Transparent with paper text over the dark hero every page starts with; switches to a
 * paper background, teal text and a hairline border after 24px of scroll or while the mega menu is open.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getScrolledServer);

  // Menus remember the path they were opened on, so any route change closes them without an effect.
  const [megaPath, setMegaPath] = useState<string | null>(null);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const megaOpen = megaPath === pathname;
  const mobileOpen = mobilePath === pathname;

  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMega = useCallback(() => setMegaPath(null), []);
  const closeMobile = useCallback(() => setMobilePath(null), []);

  // Mega menu: Esc (focus back to trigger) and outside click.
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // The panel is rendered after the nav in the DOM; route Tab from the trigger into the panel and
        // from the panel's last link back to the nav item after the trigger, like an inline disclosure.
        const panel = document.getElementById(MEGA_ID);
        const links = panel ? Array.from(panel.querySelectorAll<HTMLElement>("a[href], button")) : [];
        const active = document.activeElement;
        if (!links.length) return;
        if (active === triggerRef.current && !e.shiftKey) {
          e.preventDefault();
          links[0].focus();
        } else if (active === links[0] && e.shiftKey) {
          e.preventDefault();
          triggerRef.current?.focus();
        } else if (active === links[links.length - 1] && !e.shiftKey) {
          const navItems = Array.from(headerRef.current?.querySelectorAll<HTMLElement>("nav[aria-label='Main'] a, nav[aria-label='Main'] button") ?? []);
          const next = navItems[navItems.indexOf(triggerRef.current as HTMLElement) + 1];
          if (next) {
            e.preventDefault();
            setMegaPath(null);
            next.focus();
          }
        }
        return;
      }
      if (e.key !== "Escape") return;
      e.preventDefault();
      setMegaPath(null);
      triggerRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMegaPath(null);
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !headerRef.current?.contains(e.target)) setMegaPath(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [megaOpen]);

  // Mobile menu: lock body scroll, make the page behind inert, Esc closes, close when resized to desktop.
  useEffect(() => {
    if (!mobileOpen) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const behind = [document.getElementById("main"), document.getElementById("site-footer")].filter(
      (el): el is HTMLElement => el !== null,
    );
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobilePath(null);
      toggleRef.current?.focus();
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setMobilePath(null);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      body.style.overflow = prevOverflow;
      behind.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [mobileOpen]);

  const solid = (scrolled || megaOpen) && !mobileOpen;
  const pillarsActive = pathname.startsWith("/pillars/") && pathname !== "/pillars/solve";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[72px] border-b transition-[background-color,border-color,color] duration-300",
          solid ? "border-line bg-paper text-teal-900" : "surface-dark border-transparent bg-transparent text-paper",
        )}
      >
        {/* Soft scrim keeps the transparent header legible over hero photography */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-linear-to-b from-teal-950/45 to-transparent transition-opacity duration-300",
            solid || mobileOpen ? "opacity-0" : "opacity-100",
          )}
        />
        <div className="container-site flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            className="-m-2 rounded-md p-2"
            onClick={() => {
              closeMega();
              closeMobile();
            }}
          >
            <Logo title="Grow Digital home" className="h-[26px] lg:h-7" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                if (item.children) {
                  return (
                    <li key={item.label}>
                      <button
                        ref={triggerRef}
                        id={MEGA_TRIGGER_ID}
                        type="button"
                        aria-expanded={megaOpen}
                        aria-controls={MEGA_ID}
                        onClick={() => setMegaPath(megaOpen ? null : pathname)}
                        className="group/nav relative flex h-10 items-center gap-1.5 rounded-full px-4 text-[0.9375rem]"
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden
                          strokeWidth={1.5}
                          className={cn(
                            "size-4 transition-transform duration-300 ease-[var(--ease-out-expo)]",
                            megaOpen && "rotate-180",
                          )}
                        />
                        <NavIndicator active={pillarsActive || megaOpen} solid={solid} />
                      </button>
                    </li>
                  );
                }
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMega}
                      className="group/nav relative flex h-10 items-center rounded-full px-4 text-[0.9375rem]"
                    >
                      {item.label}
                      <NavIndicator active={active} solid={solid} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              href={NAV_CTA.href}
              variant={solid ? "primary" : "accent"}
              className="hidden sm:inline-flex"
              onClick={closeMega}
            >
              {NAV_CTA.label}
            </Button>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls={MOBILE_ID}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobilePath(mobileOpen ? null : pathname)}
              className="relative -mr-2 grid size-11 place-items-center rounded-full lg:hidden"
            >
              <span aria-hidden className="relative block h-3 w-6">
                <span
                  className={cn(
                    "absolute left-0 h-[1.5px] w-6 rounded-full bg-current transition-[top,rotate] duration-500 ease-[var(--ease-out-expo)]",
                    mobileOpen ? "top-[5px] rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-[1.5px] rounded-full bg-current transition-[top,rotate,width] duration-500 ease-[var(--ease-out-expo)]",
                    mobileOpen ? "top-[5px] w-6 -rotate-45" : "top-[10px] w-4",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <MegaMenu
          id={MEGA_ID}
          labelledBy={MEGA_TRIGGER_ID}
          open={megaOpen}
          pillars={NAV_PILLARS}
          promo={NAV_PROMO}
          currentPath={pathname}
          onNavigate={closeMega}
        />
      </header>

      {/* Dim the page behind the open mega menu (a pointerdown here counts as an outside click) */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 hidden bg-teal-950/25 backdrop-blur-[2px] transition-opacity duration-500 lg:block",
          megaOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <MobileMenu
        id={MOBILE_ID}
        open={mobileOpen}
        pillars={NAV_PILLARS}
        items={NAV}
        cta={NAV_CTA}
        currentPath={pathname}
        onNavigate={closeMobile}
      />
    </>
  );
}

/** The smile-arc active indicator under a nav item; a hover hint when inactive. */
function NavIndicator({ active, solid }: { active: boolean; solid: boolean }) {
  return (
    <SmileArc
      stretch
      strokeWidth={1.5}
      className={cn(
        "pointer-events-none absolute bottom-0.5 left-1/2 h-1.5 w-5 -translate-x-1/2 transition-[opacity,translate] duration-300 ease-[var(--ease-out-expo)]",
        solid ? "text-teal-500" : "text-lime",
        active ? "opacity-100" : "translate-y-0.5 opacity-0 group-hover/nav:translate-y-0 group-hover/nav:opacity-60",
      )}
    />
  );
}
