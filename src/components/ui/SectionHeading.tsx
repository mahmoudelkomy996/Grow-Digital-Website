import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow, type Tone } from "./Eyebrow";
import { SmileArc } from "./SmileArc";

type HeadingTag = "h1" | "h2" | "h3";
export type HeadingSize = "display" | "h1" | "h2" | "h3";

const sizeClass: Record<HeadingSize, string> = {
  display: "text-display font-light",
  h1: "text-h1 font-light",
  h2: "text-h2 font-light",
  h3: "text-h3",
};

/**
 * Renders "*word*" as the serif-italic accent. With `arc`, the accent word gets the smile-arc underline.
 * Accent colour: teal-600 on paper, mint on dark.
 */
export function Headline({ text, tone = "paper", arc = false }: { text: string; tone?: Tone; arc?: boolean }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (!(part.startsWith("*") && part.endsWith("*"))) return <Fragment key={i}>{part}</Fragment>;
        const word = part.slice(1, -1);
        return (
          <em
            key={i}
            className={cn(
              "accent-word pr-[0.04em]",
              tone === "dark" ? "text-mint" : "text-teal-600",
              arc && "relative inline-block",
            )}
          >
            {word}
            {arc ? (
              <SmileArc
                stretch
                strokeWidth={2}
                className={cn(
                  "pointer-events-none absolute left-[10%] top-[92%] h-[0.2em] w-[80%]",
                  tone === "dark" ? "text-lime" : "text-teal-500",
                )}
              />
            ) : null}
          </em>
        );
      })}
    </>
  );
}

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  /** Mono index before the eyebrow, e.g. "01" */
  num?: string;
  /** Headline; wrap one word in *asterisks* for the serif accent */
  title: string;
  lead?: ReactNode;
  as?: HeadingTag;
  size?: HeadingSize;
  align?: "left" | "center";
  tone?: Tone;
  arc?: boolean;
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  num,
  title,
  lead,
  as: Tag = "h2",
  size,
  align = "left",
  tone = "paper",
  arc = false,
  id,
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  const center = align === "center";
  return (
    <div className={cn("flex max-w-3xl flex-col gap-5", center && "mx-auto items-center text-center", className)}>
      {eyebrow ? (
        <Eyebrow tone={tone} num={num} className={cn(center && "justify-center")}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Tag id={id} className={cn(sizeClass[size ?? Tag], dark ? "text-paper" : "text-teal-900")}>
        <Headline text={title} tone={tone} arc={arc} />
      </Tag>
      {lead ? (
        <div className={cn("max-w-2xl text-body-l", dark ? "text-teal-200" : "text-teal-700")}>{lead}</div>
      ) : null}
    </div>
  );
}
