import { cn } from "@/lib/cn";
import type { LogoItem } from "@/content/types";
import type { Tone } from "@/components/ui/Eyebrow";
import { LogoTile } from "@/components/ui/LogoTile";

interface LogoMarqueeProps {
  items: LogoItem[];
  tone?: Tone;
  /** Accessible name for the strip */
  label?: string;
  className?: string;
}

/** Repeat short lists so one copy of the track is always wider than the viewport. */
function fill(items: LogoItem[], min = 10): LogoItem[] {
  if (!items.length) return items;
  const out: LogoItem[] = [];
  while (out.length < min) out.push(...items);
  return out;
}

/**
 * Infinite CSS marquee (two identical tracks translated by -50%). Pauses on hover and focus; under
 * reduced motion it becomes a static, wrapping row with the duplicate track removed.
 */
export function LogoMarquee({ items, tone = "paper", label = "Partners", className }: LogoMarqueeProps) {
  const track = fill(items);
  const itemClass = "w-40 shrink-0 md:w-52";
  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        "group/mq relative overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] motion-reduce:[mask-image:none]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max animate-marquee group-hover/mq:[animation-play-state:paused] group-focus-within/mq:[animation-play-state:paused]",
          "motion-reduce:w-full motion-reduce:animate-none",
        )}
      >
        <ul className="flex shrink-0 items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
          {(track.length ? track : items).map((item, i) => (
            <li key={`${item.id}-${i}`} className={cn(itemClass, i >= items.length && "motion-reduce:hidden")}>
              <LogoTile item={item} tone={tone} />
            </li>
          ))}
        </ul>
        <ul aria-hidden inert className="flex shrink-0 items-center motion-reduce:hidden">
          {track.map((item, i) => (
            <li key={`${item.id}-dup-${i}`} className={itemClass}>
              <LogoTile item={item} tone={tone} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
