import type { Pillar } from "@/content/types";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { PillarCard } from "./PillarCard";

interface PillarGridProps {
  pillars: Pillar[];
  className?: string;
}

/**
 * The seven pillars as a 4-column grid: the first card is the wide dark feature card (2 + 1 + 1 / 4 × 1),
 * two columns on tablets, one on phones.
 */
export function PillarGrid({ pillars, className }: PillarGridProps) {
  return (
    <ul className={cn("grid gap-3 md:grid-cols-2 lg:grid-cols-4", className)}>
      {pillars.map((p, i) => (
        <li key={p.slug} className={cn(i === 0 && "md:col-span-2")}>
          <Reveal className="h-full" delay={(i % 4) * 70}>
            <PillarCard pillar={p} variant={i === 0 ? "feature" : "default"} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
