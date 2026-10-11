"use client";

// The homepage growth story: a pinned 3D stage ("the digital tree") with the chapter copy as real HTML.
// The scene module (three.js) is imported only when #story nears the viewport, so it never ships in a
// route's initial bundle. Without WebGL, static poster frames are cross-faded by chapter instead.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getImageProps } from "next/image";
import Link from "next/link";
import Lenis from "lenis";
import { STORY } from "@/content/story";
import type { StoryChapter } from "@/content/types";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
// import { Logo } from "@/components/ui/Logo";
import { CHAPTER_COUNT as N, clamp, lerp, panelOpacity, segment } from "./progress";
import type { StoryScene } from "./tree/scene";

declare global {
  interface Window {
    __sceneReady?: boolean;
  }
}

const PILLARS = STORY.slice(1, 8);

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function hasWebGL2() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Fallback poster i: fades in over the chapter boundary; posters stack, so lower ones need no fade-out. */
const posterOpacity = (i: number, s: number) => (i === 0 ? 1 : clamp((s - i + 0.15) / 0.3));

/** Poster i as art-directed <picture>: a portrait render for phones, a 16:10 render for everything else. */
function Poster({ i }: { i: number }) {
  const common = { alt: "", sizes: "100vw" };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: `/story/fallback-${i}.jpg`, width: 1600, height: 1000 });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: `/story/fallback-m-${i}.jpg`, width: 585, height: 1266 });
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile} />
      <source media="(min-width: 768px)" srcSet={desktop} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" comes from getImageProps (decorative) */}
      <img {...rest} className="absolute inset-0 size-full object-cover object-[65%_50%] max-md:object-center" />
    </picture>
  );
}

const headingClass =
  "mb-[18px] text-[clamp(2.5rem,5.2vw,4.75rem)] leading-[1.02] tracking-[-0.02em] text-paper max-md:text-[2.375rem]";

function PanelBody({ c, i }: { c: StoryChapter; i: number }) {
  const finale = c.id === "finale";
  const title = accent(c.title, "text-mint");
  return (
    <>
      {/* {finale ? <Logo className="mb-[26px] h-auto! w-[min(420px,80vw)] text-paper max-md:w-[min(300px,70vw)]" /> : null} */}
      {i === 0 ? (
        <Eyebrow tone="dark" className="mb-3.5">
          {c.full}
        </Eyebrow>
      ) : c.num ? (
        <Eyebrow tone="dark" className="mb-3.5">
          {c.num} — {c.name} <span className="text-teal-300">/ {c.full}</span>
        </Eyebrow>
      ) : null}
      {i === 0 ? <h1 className={headingClass}>{title}</h1> : <h2 className={headingClass}>{title}</h2>}
      <p className="mb-[22px] max-w-[460px] text-[17px] leading-[1.6] text-teal-200 max-md:mb-4 max-md:text-[15px]">{c.lead}</p>
      {c.chips.length ? (
        <ul className="mb-6 flex flex-wrap gap-2 max-md:mb-5" aria-label={`${c.name} services`}>
          {c.chips.map((x) => (
            <li key={x}>
              <Chip tone="dark" size="sm">
                {x}
              </Chip>
            </li>
          ))}
        </ul>
      ) : null}
      {i === 0 ? (
        <p className="eyebrow text-teal-300">
          Scroll to begin the journey <span aria-hidden>↓</span>
        </p>
      ) : finale ? (
        <div className="mt-2 flex flex-wrap gap-3">
          <Button href={c.href ?? "/contact"} variant="accent" arrow>
            Start the conversation
          </Button>
          <Button href="/#pillars" variant="ghost-dark">
            See the seven pillars
          </Button>
        </div>
      ) : c.href ? (
        <Link
          href={c.href}
          className="border-b border-mint/40 pb-0.5 text-[15px] text-mint transition-colors duration-300 hover:border-mint"
        >
          Explore {c.name} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </>
  );
}

export function GrowthStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const posterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sceneRef = useRef<StoryScene | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const framesRef = useRef(0);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reducedRef = useRef(reducedMotion);
  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  const [active, setActive] = useState(0); // panel with opacity > 0.5 (-1 mid cross-fade)
  const [railActive, setRailActive] = useState(0); // chapter under the progress (rail highlight)
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false); // first scene frame is up (fades the CSS placeholder out)
  const fallbackRef = useRef(false);
  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  // ------------------------------------------------------------ smooth scroll (home only, motion allowed)
  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: true });
    lenisRef.current = lenis;
    // Hold smooth scroll while the first-visit preloader covers the page.
    const resume = () => lenis.start();
    if (document.documentElement.dataset.preloader === "on") {
      lenis.stop();
      window.addEventListener("gd:preloader-done", resume, { once: true });
    }
    return () => {
      window.removeEventListener("gd:preloader-done", resume);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const readProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;
    const range = el.offsetHeight - window.innerHeight;
    return range > 0 ? clamp(-el.getBoundingClientRect().top / range) : 0;
  }, []);

  const scrollToChapter = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / N) * (el.offsetHeight - window.innerHeight);
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: reducedRef.current ? "auto" : "smooth" });
  }, []);

  // ------------------------------------------------------------ frame loop (runs only while on screen)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    let visible = false;
    let smoothP = readProgress();
    let lastActive = 0;
    let lastRail = 0;

    const update = (p: number) => {
      const panels = panelRefs.current;
      let act = -1;
      for (let i = 0; i < N; i++) {
        const el = panels[i];
        if (!el) continue;
        const { o, local } = panelOpacity(i, p);
        el.style.opacity = o.toFixed(3);
        el.style.translate = `0 ${((1 - o) * (local < 0.5 ? 24 : -24)).toFixed(1)}px`;
        if (o > 0.5) act = i;
      }
      if (act !== lastActive) setActive((lastActive = act));
      const { i } = segment(p);
      if (i !== lastRail) setRailActive((lastRail = i));
      if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      if (fallbackRef.current) {
        const s = p * N;
        let top = 0;
        for (let k = 0; k < N; k++) if (posterOpacity(k, s) >= 1) top = k;
        posterRefs.current.forEach((el, k) => {
          if (!el) return;
          el.style.opacity = posterOpacity(k, s).toFixed(3);
          el.style.visibility = k < top || posterOpacity(k, s) <= 0 ? "hidden" : "visible";
        });
      }
    };

    const tick = (now: number) => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      const target = readProgress();
      smoothP = reducedRef.current ? target : lerp(smoothP, target, 0.12);
      if (Math.abs(smoothP - target) < 1e-5) smoothP = target;
      update(smoothP);
      const scene = sceneRef.current;
      if (scene) {
        scene.render(now / 1000, smoothP);
        if (++framesRef.current === 3) {
          window.__sceneReady = true;
          window.dispatchEvent(new CustomEvent("gd:scene", { detail: "ready" })); // lets the preloader lift
        }
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        smoothP = readProgress(); // re-entering: start from where the page is, no catch-up sweep
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(section);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      raf = 0;
    };
  }, [readProgress]);

  // ------------------------------------------------------------ 3D scene: lazy import, lifecycle, fallback
  useEffect(() => {
    const section = sectionRef.current;
    const host = hostRef.current;
    if (!section || !host) return;
    let cancelled = false;
    let scene: StoryScene | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let ro: ResizeObserver | null = null;
    let lostTimer = 0;

    const teardown = () => {
      ro?.disconnect();
      ro = null;
      window.clearTimeout(lostTimer);
      if (sceneRef.current === scene) sceneRef.current = null;
      scene?.dispose();
      scene = null;
      canvas?.remove();
      canvas = null;
      framesRef.current = 0;
      window.__sceneReady = false;
    };
    const fail = (err?: unknown) => {
      if (err) console.warn("Growth story: 3D scene unavailable, showing posters.", err);
      teardown();
      if (!cancelled) setFallback(true);
      window.dispatchEvent(new CustomEvent("gd:scene", { detail: "fallback" }));
    };

    const load = async () => {
      if (!hasWebGL2()) return fail();
      try {
        const { createScene } = await import("./tree/scene");
        if (cancelled) return;
        canvas = document.createElement("canvas");
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
        host.appendChild(canvas);
        const s = await createScene({ canvas, reducedMotion, isMobile, logoUrl: "/brand/logo-paper.png" });
        if (cancelled) {
          s.dispose();
          canvas.remove();
          return;
        }
        scene = s;
        const cv = canvas;
        const resize = () => s.resize(cv.clientWidth, cv.clientHeight, Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
        resize();
        ro = new ResizeObserver(resize);
        ro.observe(cv);
        // a context that is lost and not restored soon falls back to the posters
        cv.addEventListener("webglcontextlost", () => {
          lostTimer = window.setTimeout(() => fail(new Error("WebGL context lost")), 2500);
        });
        cv.addEventListener("webglcontextrestored", () => window.clearTimeout(lostTimer));
        framesRef.current = 0;
        sceneRef.current = s;
        setReady(true);
        setFallback(false);
      } catch (err) {
        if (!cancelled) fail(err);
      }
    };

    // Start once the story is near the viewport AND the visitor first interacts (scroll, pointer, touch,
    // key) — or after 8s without interaction. The intro text and a CSS seed placeholder paint immediately,
    // so three.js never competes with the first paint or hydration.
    const EVENTS = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel", "scroll"] as const;
    let started = false;
    let timer = 0;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      EVENTS.forEach((e) => window.removeEventListener(e, start));
      window.clearTimeout(timer);
      void load();
    };
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        near.disconnect();
        EVENTS.forEach((e) => window.addEventListener(e, start, { passive: true }));
        timer = window.setTimeout(start, 8000);
      },
      { rootMargin: "200px 0px" },
    );
    // First visit: the preloader is already covering the page, so build the scene right away.
    if (document.documentElement.dataset.preloader === "on") start();
    else near.observe(section);
    return () => {
      cancelled = true;
      near.disconnect();
      EVENTS.forEach((e) => window.removeEventListener(e, start));
      window.clearTimeout(timer);
      teardown();
    };
  }, [isMobile, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="story"
      data-header-transparent
      aria-label="The growth story"
      className="surface-dark relative bg-stage text-teal-100"
      style={{ height: `${N * 110 + 100}vh` }}
    >
      <a
        href="#integrator"
        className="absolute top-[88px] left-4 z-30 -translate-y-[300%] rounded-full bg-lime px-5 py-3 text-[0.9375rem] font-medium text-teal-950 transition-transform duration-300 focus-visible:translate-y-0 focus-visible:outline-teal-950"
      >
        Skip the story
      </a>

      <div className="sticky top-0 h-svh overflow-hidden">
        <div ref={hostRef} aria-hidden className="absolute inset-0" />

        {/* Placeholder until the 3D scene is up: a soft glowing seed where the scene's seed appears */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-700",
            ready || fallback ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="absolute top-[34%] left-1/2 size-[clamp(120px,22vw,220px)] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(226,242,239,0.9)_0%,rgba(127,224,200,0.55)_28%,rgba(46,148,142,0.18)_55%,transparent_70%)] blur-[2px] md:top-1/2 md:left-[64%]" />
        </div>

        {fallback ? (
          <div aria-hidden className="absolute inset-0" data-testid="story-fallback">
            {STORY.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => {
                  posterRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
              >
                <Poster i={i} />
              </div>
            ))}
          </div>
        ) : null}

        {/* text legibility: left on desktop, bottom on mobile */}
        <div
          aria-hidden
          data-story-ui
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,38,38,0.72)_0%,rgba(5,38,38,0.25)_38%,rgba(5,38,38,0)_60%)] max-md:bg-[linear-gradient(0deg,rgba(5,38,38,0.92)_0%,rgba(5,38,38,0.6)_40%,rgba(5,38,38,0)_70%)]"
        />

        <div data-story-ui className="pointer-events-none absolute inset-0 z-[5] pt-[88px] pb-10 max-md:pt-[120px] max-md:pb-7">
          <div className="container-site grid h-full">
            {STORY.map((c, i) => (
              <article
                key={c.id}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                data-chapter={c.id}
                data-active={i === active ? "true" : "false"}
                aria-hidden={i === active ? undefined : true}
                inert={i !== active}
                className={cn(
                  "w-[min(580px,88vw)] [grid-area:1/1] [align-self:safe_center] will-change-[opacity,translate] max-md:self-end",
                  i === active && "pointer-events-auto",
                )}
                style={{ opacity: i === 0 ? 1 : 0, translate: i === 0 ? "0 0px" : "0 24px" }}
              >
                <PanelBody c={c} i={i} />
              </article>
            ))}
          </div>
        </div>

        <nav
          aria-label="Story chapters"
          data-story-ui
          className="absolute top-1/2 right-[clamp(12px,3vw,40px)] z-[6] flex -translate-y-1/2 flex-col gap-1.5 max-md:top-[84px] max-md:right-4 max-md:translate-y-0 max-md:flex-row max-md:gap-0.5"
        >
          {PILLARS.map((c, k) => {
            const i = k + 1;
            const on = railActive === i;
            return (
              <button
                key={c.id}
                type="button"
                aria-label={`Go to chapter: ${c.name}`}
                aria-current={on ? "step" : undefined}
                onClick={() => scrollToChapter(i)}
                className={cn(
                  "group flex h-6 cursor-pointer items-center justify-end gap-2.5 rounded-sm font-mono text-[11px] tracking-[0.12em] uppercase max-md:w-6 max-md:justify-center",
                  on ? "text-paper" : "text-teal-400",
                )}
              >
                <span
                  className={cn(
                    "transition-[opacity,translate] duration-300 [text-shadow:0_0_10px_var(--color-stage),0_0_3px_var(--color-stage)] max-md:hidden",
                    on ? "opacity-100" : "translate-x-1.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  )}
                >
                  {c.num} {c.name}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full border transition-[background-color,border-color,scale] duration-300",
                    on ? "scale-[1.35] border-lime bg-lime" : "border-teal-400",
                  )}
                />
              </button>
            );
          })}
        </nav>

        <div ref={barRef} aria-hidden data-story-ui className="absolute bottom-0 left-0 z-[6] h-0.5 w-0 bg-lime" />
      </div>
    </section>
  );
}
