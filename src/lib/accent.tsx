import { Fragment, type ReactNode } from "react";

/**
 * Renders a headline where one word is wrapped in *asterisks* as the serif italic accent,
 * e.g. accent("It's time to *grow*.") → It's time to <em class="accent-word">grow</em>.
 */
export function accent(text: string, accentClassName = ""): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i} className={`accent-word ${accentClassName}`.trim()}>
        {part.slice(1, -1)}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Plain-text version (for metadata, aria labels) */
export function plain(text: string): string {
  return text.replace(/\*/g, "");
}
