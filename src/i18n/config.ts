// Locales and locale-aware URLs. Safe to import from client and server code.
//
// URL scheme: the default locale (English) keeps unprefixed URLs (/about); every other locale lives under
// its prefix (/ar/about). src/proxy.ts rewrites unprefixed requests to /en/… internally, so all routes sit
// under app/[lang]. The blog is English-only for now: BLOG_LOCALES lists the locales that have it.

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Locales that have a translated blog; other locales link to the English blog. */
export const BLOG_LOCALES: readonly Locale[] = ["en"];

export const LOCALE_META: Record<Locale, { label: string; native: string; dir: "ltr" | "rtl"; og: string; hreflang: string }> = {
  en: { label: "English", native: "English", dir: "ltr", og: "en_US", hreflang: "en" },
  ar: { label: "Arabic", native: "العربية", dir: "rtl", og: "ar_SA", hreflang: "ar" },
};

export const isLocale = (v: string | undefined | null): v is Locale => !!v && (LOCALES as readonly string[]).includes(v);

export const dirOf = (locale: Locale) => LOCALE_META[locale].dir;

const isBlogPath = (path: string) => path === "/blog" || path.startsWith("/blog/");

/**
 * The public URL of an internal path in a locale: "/about" → "/ar/about".
 * External URLs, mailto:/tel: links, in-page anchors and blog URLs in locales without a blog are returned as is.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (locale === DEFAULT_LOCALE) return href;
  if (isBlogPath(href) && !BLOG_LOCALES.includes(locale)) return href;
  return href === "/" ? `/${locale}` : href.startsWith("/#") ? `/${locale}${href.slice(1)}` : `/${locale}${href}`;
}

/** Strip the locale prefix from a public pathname: "/ar/about" → { locale: "ar", path: "/about" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const seg = pathname.split("/")[1];
  if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
    const rest = pathname.slice(seg.length + 1);
    return { locale: seg, path: rest || "/" };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/** Whether a (locale-free) path exists in a locale; used by the language switcher and hreflang. */
export const hasPath = (locale: Locale, path: string) => !isBlogPath(path) || BLOG_LOCALES.includes(locale);

/** Whether a locale (string from route params) has the blog. */
export const hasBlog = (lang: string) => (BLOG_LOCALES as readonly string[]).includes(lang);
