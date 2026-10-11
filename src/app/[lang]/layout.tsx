import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fontVariables } from "@/lib/fonts";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { LOCALES, LOCALE_META, isLocale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { Analytics } from "@/components/seo/Analytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RouteProgress } from "@/components/layout/RouteProgress";
import "../globals.css";

/**
 * Runs before first paint: turns the homepage preloader on (<html data-preloader="on">) only on a home page
 * ("/" or "/ar") and only once per browser session; everywhere else, and for no-JS visitors, CSS keeps
 * #preloader hidden.
 */
const HOME_PATHS = JSON.stringify(["/", ...LOCALES.filter((l) => l !== "en").map((l) => `/${l}`)]);
const PRELOADER_BOOT = `(function(){var d=document.documentElement,on=${HOME_PATHS}.indexOf(location.pathname)>-1;try{if(sessionStorage.getItem("gd:preloaded"))on=false}catch(e){}d.setAttribute("data-preloader",on?"on":"off")})()`;

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.siteTitle, template: t.meta.titleTemplate },
    description: t.meta.description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    formatDetection: { telephone: false, email: false, address: false },
    alternates: { types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: t.meta.rssTitle }] } },
    openGraph: { siteName: SITE_NAME, locale: LOCALE_META[locale].og, type: "website" },
    twitter: { card: "summary_large_image" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#083b3b",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { c, t } = await getI18n();
  return (
    <html lang={lang} dir={LOCALE_META[lang].dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOADER_BOOT }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink">
        <LocaleProvider locale={lang}>
          <Suspense fallback={null}>
            <RouteProgress />
          </Suspense>
          <a
            href="#main"
            className="fixed start-3 top-3 z-[100] -translate-y-[150%] rounded-full bg-lime px-5 py-3 text-[0.9375rem] font-medium text-teal-950 transition-transform duration-300 focus-visible:translate-y-0 focus-visible:outline-teal-950"
          >
            {t.common.skipToContent}
          </a>
          <SiteHeader nav={c.NAV} cta={c.NAV_CTA} />
          <main id="main" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <SiteFooter />
          <Analytics />
        </LocaleProvider>
      </body>
    </html>
  );
}
