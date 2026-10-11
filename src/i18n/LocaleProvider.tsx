"use client";

// Locale + UI dictionary for Client Components (Server Components use @/i18n/server instead).
import { createContext, use, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return use(LocaleContext);
}

export function useDict(): Dictionary {
  return DICTIONARIES[use(LocaleContext)];
}

/**
 * The public pathname. Unprefixed (default-locale) URLs are rewritten to /en/… by the proxy, and
 * usePathname() can report that internal path; this strips it back to what the browser shows.
 */
export function usePublicPathname(): string {
  const p = usePathname();
  const prefix = `/${DEFAULT_LOCALE}`;
  return p === prefix ? "/" : p.startsWith(`${prefix}/`) ? p.slice(prefix.length) : p;
}
