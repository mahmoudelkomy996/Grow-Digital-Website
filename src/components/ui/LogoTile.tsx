import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { LogoItem } from "@/content/types";
import type { Tone } from "./Eyebrow";
import logoMeta from "@/content/logo-meta.json";

type LogoMeta = { w: number; h: number; coverage: number };
const META = logoMeta as Record<string, LogoMeta>;

/**
 * Optical sizing: wide wordmarks get less height, compact marks more, so every logo carries similar visual
 * weight. Height (rem) = 3.8 / sqrt(aspect), clamped to 1.7–4.4rem; thin, low-coverage marks get up to ~25% more;
 * then multiplied by item.scale.
 */
function logoBox(logo: string, scale: number): CSSProperties {
  const m = META[logo];
  const aspect = m ? m.w / m.h : 3;
  const thin = 1 + Math.max(0, 0.24 - (m?.coverage ?? 0.24)) * 1.8;
  const h = Math.min(4.4, Math.max(1.7, 3.8 / Math.sqrt(aspect)) * thin) * scale;
  return { height: `${h.toFixed(3)}rem`, width: `min(100%, ${(h * aspect).toFixed(3)}rem)` };
}

/** Solid badge logos (UNO, LEGO, IKEA…) would flatten into blobs as a silhouette; show them in greyscale instead. */
const isBadge = (logo: string) => (META[logo]?.coverage ?? 0) > 0.5;

interface LogoTileProps {
  item: LogoItem;
  tone?: Tone;
  className?: string;
}

/**
 * A partner / client logo. By default the mark is a monochrome silhouette (teal on paper, paper on dark),
 * drawn with a CSS mask of the PNG; on hover or keyboard focus it cross-fades to the original colours.
 * On dark surfaces a paper plate fades in behind the colour version so dark marks stay legible.
 * Items without a `logo` render as a clean text wordmark.
 */
export function LogoTile({ item, tone = "paper", className }: LogoTileProps) {
  const dark = tone === "dark";
  const scale = item.scale ?? 1;
  const box = item.logo ? logoBox(item.logo, scale) : undefined;
  const badge = item.logo ? isBadge(item.logo) : false;

  return (
    <div
      className={cn(
        "group/logo relative isolate flex h-full min-h-20 w-full items-center justify-center px-5 py-6 md:min-h-24",
        className,
      )}
    >
      {dark && item.logo ? (
        <span
          aria-hidden
          className="absolute inset-2 -z-10 rounded-[var(--radius-control)] bg-paper opacity-0 transition-opacity duration-500 group-focus-within/logo:opacity-100 group-hover/logo:opacity-100"
        />
      ) : null}
      {item.logo ? (
        <span className="relative block max-w-[10rem]" style={box}>
          {badge ? null : (<span
            aria-hidden
            className={cn(
              "absolute inset-0 bg-current transition-opacity duration-500 group-focus-within/logo:opacity-0 group-hover/logo:opacity-0",
              dark ? "text-paper/80" : "text-teal-900/80",
            )}
            style={{
              WebkitMaskImage: `url("${item.logo}")`,
              maskImage: `url("${item.logo}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />)}
          <Image
            src={item.logo}
            alt={item.name}
            fill
            sizes="152px"
            className={cn(
              "object-contain transition-[opacity,filter] duration-500",
              badge
                ? "opacity-70 grayscale group-focus-within/logo:opacity-100 group-focus-within/logo:grayscale-0 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
                : "opacity-0 group-focus-within/logo:opacity-100 group-hover/logo:opacity-100",
            )}
          />
        </span>
      ) : (
        <span
          className={cn(
            "text-center text-[1.0625rem] leading-tight font-medium tracking-[-0.015em] transition-colors duration-500",
            dark ? "text-paper/80 group-hover/logo:text-paper" : "text-teal-900/80 group-hover/logo:text-teal-900",
          )}
        >
          {item.name}
        </span>
      )}
    </div>
  );
}
