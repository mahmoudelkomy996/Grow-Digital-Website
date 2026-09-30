import { cn } from "@/lib/cn";
import type { LogoItem } from "@/content/types";
import type { Tone } from "@/components/ui/Eyebrow";
import { LogoTile } from "@/components/ui/LogoTile";

interface LogoWallProps {
  items: LogoItem[];
  columns?: 3 | 4 | 5 | 6;
  tone?: Tone;
  className?: string;
}

const cols: Record<NonNullable<LogoWallProps["columns"]>, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/** Hairline grid of logos (2 columns on phones, 3 on tablets, `columns` on desktop). */
export function LogoWall({ items, columns = 5, tone = "paper", className }: LogoWallProps) {
  const dark = tone === "dark";
  return (
    <ul
      className={cn(
        "grid grid-cols-2 border-t border-l sm:grid-cols-3",
        cols[columns],
        dark ? "border-teal-300/15" : "border-line",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className={cn("border-r border-b", dark ? "border-teal-300/15" : "border-line")}>
          <LogoTile item={item} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
