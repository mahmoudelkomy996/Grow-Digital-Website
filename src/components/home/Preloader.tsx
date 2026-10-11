"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/ui/Logo";
import { SMILE_PATH } from "@/components/ui/SmileArc";

/**
 * First-visit preloader for the homepage.
 *
 * Shown once per browser session: an inline boot script in the root layout sets
 * `<html data-preloader="on">` before first paint only on `/` when the session has not seen it yet, and
 * CSS hides `#preloader` otherwise (also for no-JS visitors). It covers the page until fonts, the window
 * `load` event and the 3D scene (`gd:scene` event from GrowthStory) are ready — at least MIN_MS so the
 * moment reads as intentional, at most MAX_MS so a slow device is never held hostage — then lifts like a
 * curtain. While it is up, the page behind is inert and scroll is locked.
 */

const PRELOADER_SESSION_KEY = "gd:preloaded";
const MIN_MS = 1400;
const MAX_MS = 6500;
const EXIT_MS = 900;

declare global {
  interface Window {
    __sceneReady?: boolean;
  }
}

// Active while <html data-preloader="on">; the server snapshot renders the overlay so it is in the HTML.
const subscribe = (cb: () => void) => {
  window.addEventListener("gd:preloader-done", cb);
  return () => window.removeEventListener("gd:preloader-done", cb);
};
const getActive = () => document.documentElement.dataset.preloader === "on";
const getActiveServer = () => true;

export function Preloader() {
  const active = useSyncExternalStore(subscribe, getActive, getActiveServer);
  const [exiting, setExiting] = useState(false);
  const arcRef = useRef<SVGPathElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behind = ["main", "site-footer"]
      .map((id) => document.getElementById(id))
      .concat(document.querySelector<HTMLElement>("body > header"))
      .filter((el): el is HTMLElement => el !== null);
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    behind.forEach((el) => (el.inert = true));

    // Loading steps and their share of the progress bar.
    const done = { fonts: false, load: false, scene: false };
    const weights = { fonts: 0.2, load: 0.35, scene: 0.45 };
    const markScene = () => (done.scene = true);
    document.fonts?.ready.then(() => (done.fonts = true), () => (done.fonts = true));
    if (document.readyState === "complete") done.load = true;
    const onLoad = () => (done.load = true);
    window.addEventListener("load", onLoad);
    if (window.__sceneReady) done.scene = true;
    window.addEventListener("gd:scene", markScene);

    const t0 = performance.now();
    let shown = 0;
    let raf = 0;
    let finishing = false;
    let exitTimer = 0;

    const paint = (p: number) => {
      arcRef.current?.style.setProperty("stroke-dashoffset", String(1 - p));
      barRef.current?.style.setProperty("transform", `scaleX(${p})`);
      if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
    };

    const finish = () => {
      setExiting(true);
      exitTimer = window.setTimeout(
        () => {
          try {
            sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
          } catch {
            /* storage unavailable: the loader may show again on the next hard load */
          }
          html.dataset.preloader = "off";
          html.style.overflow = prevOverflow;
          behind.forEach((el) => (el.inert = false));
          window.dispatchEvent(new Event("gd:preloader-done")); // also unmounts this component
        },
        reduced ? 150 : EXIT_MS,
      );
    };

    const tick = (now: number) => {
      const t = now - t0;
      const target = (done.fonts ? weights.fonts : 0) + (done.load ? weights.load : 0) + (done.scene ? weights.scene : 0);
      const ready = (done.fonts && done.load && done.scene && t >= MIN_MS) || t >= MAX_MS;
      // Ease toward what has really loaded, plus a slow trickle into the next step so it never looks stuck.
      const goal = ready ? 1 : Math.min(0.96, target + 0.22 * (1 - Math.exp(-t / 2200)));
      shown += (goal - shown) * (ready ? 0.22 : 0.07);
      if (ready && shown > 0.995) shown = 1;
      paint(shown);
      if (shown === 1 && !finishing) {
        finishing = true;
        window.setTimeout(finish, 220);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("gd:scene", markScene);
      html.style.overflow = prevOverflow;
      behind.forEach((el) => (el.inert = false));
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      id="preloader"
      role="status"
      aria-live="polite"
      aria-label={exiting ? "Loaded" : "Loading Grow Digital"}
      className="surface-dark fixed inset-0 z-[200] flex flex-col bg-stage text-teal-100 transition-[clip-path,opacity] duration-[900ms] ease-[var(--ease-in-out-soft)] motion-reduce:duration-150"
      style={{ clipPath: exiting ? "inset(0 0 100% 0)" : "inset(0 0 0 0)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(30,119,115,0.35)_0%,transparent_70%)]"
      />

      <div
        className={`relative flex flex-1 flex-col items-center justify-center gap-7 transition-[opacity,translate] duration-500 ${exiting ? "-translate-y-6 opacity-0" : ""}`}
      >
        <Logo title="Grow Digital" className="h-9 text-paper md:h-12" />
        <svg aria-hidden viewBox="0 0 28 16" fill="none" className="w-16 overflow-visible md:w-20">
          <path d={SMILE_PATH} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="text-teal-800" />
          <path
            ref={arcRef}
            d={SMILE_PATH}
            pathLength={1}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset="1"
            className="text-lime [filter:drop-shadow(0_0_6px_rgba(200,241,105,0.45))]"
          />
        </svg>
      </div>

      <div className={`container-site relative flex items-end justify-between gap-6 pb-6 transition-opacity duration-300 md:pb-9 ${exiting ? "opacity-0" : ""}`}>
        <p className="eyebrow text-teal-300">
          It&apos;s time to <span className="text-lime">grow</span>
        </p>
        <p className="font-mono text-[clamp(2.25rem,5vw,4rem)] leading-none font-light text-paper tabular-nums" aria-hidden>
          <span ref={countRef}>00</span>
          <span className="ml-1 align-top text-[0.4em] text-teal-400">%</span>
        </p>
      </div>
      <div aria-hidden className="relative h-[2px] bg-teal-300/15">
        <div ref={barRef} className="h-full origin-left bg-lime" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
