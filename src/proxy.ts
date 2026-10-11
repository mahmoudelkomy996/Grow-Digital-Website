import { NextResponse, type NextRequest } from "next/server";
import { BLOG_LOCALES, DEFAULT_LOCALE, LOCALES } from "@/i18n/config";

/**
 * Locale routing. Every page lives under app/[lang]; English keeps its unprefixed URLs.
 *   /about           → rewrite to /en/about (URL unchanged)
 *   /en/about        → 308 to /about (one canonical URL per page)
 *   /ar/about        → served as is
 *   /ar/blog/…       → 307 to /blog/… while the blog is English-only
 * Files (anything with an extension, except the RSS feed) and Next internals pass through untouched.
 * The next.config redirects (legacy WordPress URLs) run before this.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if ((LOCALES as readonly string[]).includes(first)) {
    const rest = pathname.slice(first.length + 1);
    if ((rest === "/blog" || rest.startsWith("/blog/")) && !(BLOG_LOCALES as readonly string[]).includes(first)) {
      const url = request.nextUrl.clone();
      url.pathname = rest;
      return NextResponse.redirect(url, 307);
    }
    return NextResponse.next();
  }

  const last = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (last.includes(".") && pathname !== "/blog/rss.xml") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except Next internals, the image optimizer and server actions' API routes
  matcher: ["/((?!_next/|api/).*)"],
};
