"use client";

import { cn } from "@/lib/cn";
import { LOCALES, LOCALE_META, hasPath, localizeHref } from "@/i18n/config";
import { useDict, useLocale } from "@/i18n/LocaleProvider";

/**
 * Link to the same page in the other language (or that language's home when the page does not exist there,
 * e.g. the English-only blog). A full page load on purpose: <html lang/dir> and fonts change with the locale.
 */
/** `className` must include the display utility (e.g. "inline-flex" or "hidden lg:inline-flex"). */
export function LanguageSwitch({ pathname, className }: { pathname: string; className: string }) {
  const locale = useLocale();
  const t = useDict();
  const other = LOCALES.find((l) => l !== locale)!;
  const href = localizeHref(other, hasPath(other, pathname) ? pathname : "/");
  return (
    <a
      href={href}
      hrefLang={LOCALE_META[other].hreflang}
      lang={other}
      aria-label={t.common.switchToLabel}
      className={cn(
        "h-10 items-center rounded-full px-3 text-[0.9375rem] underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color] duration-300 hover:decoration-current",
        className,
      )}
    >
      {LOCALE_META[other].native}
    </a>
  );
}
