import { cn } from "@/lib/cn";
import type { LogoItem } from "@/content/types";
import type { Tone } from "@/components/ui/Eyebrow";
import { LogoTile } from "@/components/ui/LogoTile";

interface LogoWallProps {
  items: LogoItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  tone?: Tone;
  className?: string;
}

const cols: Record<NonNullable<LogoWallProps["columns"]>, string> = {
  2: "",
  3: "sm:grid-cols-3 lg:grid-cols-3",
  4: "sm:grid-cols-3 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
};

/** Hairline grid of logos (2 columns on phones, 3 on tablets, `columns` on desktop; `2` stays at two). */
export function LogoWall({ items, columns = 5, tone = "paper", className }: LogoWallProps) {
  const dark = tone === "dark";
  return (
    <ul
      className={cn(
        "grid grid-cols-2 border-t border-s",
        cols[columns],
        dark ? "border-teal-300/15" : "border-line",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className={cn("border-e border-b", dark ? "border-teal-300/15" : "border-line")}>
          <LogoTile item={item} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
