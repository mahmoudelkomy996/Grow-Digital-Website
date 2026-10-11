"use client";

import { useSearchParams } from "next/navigation";
import { usePublicPathname } from "@/i18n/LocaleProvider";
import { useEffect, useRef } from "react";

/**
 * Thin lime progress bar at the top of the viewport during client-side navigation.
 *
 * The App Router has no navigation events, so it starts on a click on an internal link (or browser
 * back/forward) and completes when the pathname or search params change. It trickles toward 90% while
 * waiting, then fills and fades out. Same-page and hash-only links, new tabs, downloads and modified
 * clicks are ignored. A safety timeout completes it if the navigation never happens.
 */
export function RouteProgress() {
  const pathname = usePublicPathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const state = useRef({ active: false, value: 0, trickle: 0, hide: 0, safety: 0 });
  const doneRef = useRef<() => void>(() => {});
  const routeRef = useRef(""); // current pathname + search, to ignore hash-only history moves

  useEffect(() => {
    const s = state.current;
    const el = barRef.current;
    if (!el) return;

    const set = (v: number, visible = true) => {
      s.value = v;
      el.style.transform = `scaleX(${v})`;
      el.style.opacity = visible ? "1" : "0";
    };

    const start = () => {
      window.clearTimeout(s.hide);
      window.clearTimeout(s.safety);
      window.clearInterval(s.trickle);
      s.active = true;
      el.dataset.state = "loading";
      el.style.transition = "none";
      set(0);
      // Next frame: animate in, then trickle toward 90% (each step covers 12% of the remaining distance).
      requestAnimationFrame(() => {
        el.style.transition = "transform 240ms var(--ease-out-expo), opacity 200ms linear";
        set(0.12);
        s.trickle = window.setInterval(() => set(s.value + (0.9 - s.value) * 0.12), 220);
      });
      s.safety = window.setTimeout(done, 10_000);
    };

    const done = () => {
      if (!s.active) return;
      s.active = false;
      window.clearInterval(s.trickle);
      window.clearTimeout(s.safety);
      set(1);
      s.hide = window.setTimeout(() => {
        set(1, false);
        el.dataset.state = "idle";
        s.hide = window.setTimeout(() => {
          el.style.transition = "none";
          set(0, false);
        }, 220);
      }, 260);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.getAttribute("rel")?.includes("external")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash link
      start();
    };
    const onPop = () => {
      if (location.pathname + location.search !== routeRef.current) start();
    };

    doneRef.current = done;

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      window.clearInterval(s.trickle);
      window.clearTimeout(s.hide);
      window.clearTimeout(s.safety);
    };
  }, []);

  // The route changed: finish the bar.
  useEffect(() => {
    const qs = searchParams.toString();
    routeRef.current = pathname + (qs ? `?${qs}` : "");
    doneRef.current();
  }, [pathname, searchParams]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[160] h-[3px]">
      <div
        ref={barRef}
        data-route-progress
        data-state="idle"
        className="h-full origin-left bg-lime opacity-0 rtl:origin-right shadow-[0_0_10px_rgba(200,241,105,0.7),0_1px_0_rgba(8,59,59,0.25)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
