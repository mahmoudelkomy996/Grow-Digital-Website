"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV, NAV_CTA } from "@/content/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SmileArc } from "@/components/ui/SmileArc";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

const SCROLL_THRESHOLD = 24;
const MEGA_ID = "mega-menu";
const triggerId = (menuId: string) => `nav-trigger-${menuId}`;
const CLOSE_DELAY = 220;
const MOBILE_ID = "mobile-menu";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const HEADER_HEIGHT = 72;
/**
 * Solid once scrolled past the threshold, except while a dark section marked [data-header-transparent]
 * (the homepage 3D story) is still behind the header, so the header stays transparent over it.
 */
const getScrolled = () => {
  if (window.scrollY <= SCROLL_THRESHOLD) return false;
  const dark = document.querySelector("[data-header-transparent]");
  if (!dark) return true;
  const r = dark.getBoundingClientRect();
  return !(r.top <= 0 && r.bottom > HEADER_HEIGHT);
};
const getScrolledServer = () => false;

/**
 * Fixed 72px header. Transparent with paper text over the dark hero every page starts with; switches to a
 * paper background, teal text and a hairline border after 24px of scroll (unless a [data-header-transparent]
 * section is behind it) or while a dropdown is open. Each service pillar has its own header link with a dropdown
 * (hover, click, Enter/Space or ArrowDown); moving to another link switches menus; Esc closes.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getScrolledServer);

  // Menus remember the path they were opened on, so any route change closes them without an effect.
  const [menu, setMenu] = useState<{ id: string; path: string } | null>(null);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const openId = menu && menu.path === pathname ? menu.id : null;
  const megaOpen = openId !== null;
  const mobileOpen = mobilePath === pathname;

  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef(0);
  const triggerFor = (id: string | null) => (id ? document.getElementById(triggerId(id)) : null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMega = useCallback(() => setMenu(null), []);
  const openMenu = useCallback(
    (id: string) => {
      window.clearTimeout(closeTimer.current);
      setMenu({ id, path: pathname });
    },
    [pathname],
  );
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), CLOSE_DELAY);
  };
  const closeMobile = useCallback(() => setMobilePath(null), []);

  // Dropdowns: Tab into / out of the open panel, Esc (focus back to its trigger), outside click or focus.
  useEffect(() => {
    if (!openId) return;
    const trigger = triggerFor(openId);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // The panel sits after the nav in the DOM; route Tab from the trigger into it and from its last link
        // back to the next header item, like an inline disclosure.
        const panel = document.getElementById(`${MEGA_ID}-${openId}`);
        const links = panel ? Array.from(panel.querySelectorAll<HTMLElement>("a[href], button")) : [];
        const active = document.activeElement;
        if (!links.length) return;
        if (active === trigger && !e.shiftKey) {
          e.preventDefault();
          links[0].focus();
        } else if (active === links[0] && e.shiftKey) {
          e.preventDefault();
          trigger?.focus();
        } else if (active === links[links.length - 1] && !e.shiftKey) {
          const navItems = Array.from(headerRef.current?.querySelectorAll<HTMLElement>("nav[aria-label='Main'] a, nav[aria-label='Main'] button") ?? []);
          const next = navItems[navItems.indexOf(trigger as HTMLElement) + 1];
          if (next) {
            e.preventDefault();
            setMenu(null);
            next.focus();
          }
        }
        return;
      }
      if (e.key !== "Escape") return;
      e.preventDefault();
      setMenu(null);
      trigger?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !headerRef.current?.contains(e.target)) setMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [openId]);

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

  return (
    <>
      <header
        ref={headerRef}
        onPointerLeave={(e) => e.pointerType === "mouse" && megaOpen && scheduleClose()}
        onPointerEnter={() => window.clearTimeout(closeTimer.current)}
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
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {NAV.map((item) => {
                if (item.menu) {
                  const menuId = item.menu.id;
                  const isOpen = openId === menuId;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.label}>
                      <button
                        id={triggerId(menuId)}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`${MEGA_ID}-${menuId}`}
                        onClick={() => (isOpen ? closeMega() : openMenu(menuId))}
                        onPointerEnter={(e) => e.pointerType === "mouse" && openMenu(menuId)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            openMenu(menuId);
                            requestAnimationFrame(() =>
                              document.querySelector<HTMLElement>(`#${MEGA_ID}-${menuId} a[href]`)?.focus(),
                            );
                          }
                        }}
                        className="group/nav relative flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[0.9375rem] xl:px-2"
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden
                          strokeWidth={1.5}
                          className={cn("size-4 transition-transform duration-300 ease-[var(--ease-out-expo)]", isOpen && "rotate-180")}
                        />
                        <NavIndicator active={active || isOpen} solid={solid} />
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
                      onPointerEnter={(e) => e.pointerType === "mouse" && megaOpen && closeMega()}
                      className="group/nav relative flex h-10 items-center rounded-full px-3.5 text-[0.9375rem] xl:px-4"
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

        <MegaMenu id={MEGA_ID} openId={openId} items={NAV} currentPath={pathname} triggerId={triggerId} onNavigate={closeMega} />
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
