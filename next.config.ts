import type { NextConfig } from "next";
import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * 301 redirects from the old WordPress site (growdigital.com) so links and rankings carry over.
 * Old posts lived at the root (/<slug>/); they now live at /blog/<slug>.
 */
const legacyPosts = readdirSync(join(process.cwd(), "content/blog"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

const legacyPages: [string, string][] = [
  // The 7 pillar pages became 4 service pillars (Oct 2026)
  ["/pillars/consult", "/services/consultancy"],
  ["/pillars/transform", "/services/software-development"],
  ["/pillars/build", "/services/software-development"],
  ["/pillars/solve", "/services/software-development"],
  ["/pillars/operate", "/services/managed-services"],
  ["/pillars/secure", "/services/managed-services"],
  ["/pillars/grow", "/services/digital-marketing"],
  ["/pillars", "/#pillars"],
  ["/services", "/#pillars"],
  ["/blog/category/consult", "/blog/category/consultancy"],
  ["/blog/category/transform", "/blog/category/software-development"],
  ["/blog/category/build", "/blog/category/software-development"],
  ["/blog/category/solve", "/blog/category/software-development"],
  ["/blog/category/operate", "/blog/category/managed-services"],
  ["/blog/category/secure", "/blog/category/managed-services"],
  ["/blog/category/grow", "/blog/category/digital-marketing"],
  ["/contact-us", "/contact"],
  ["/testing", "/"],
  ["/ecommerce-solutions", "/services/software-development"],
  ["/cloud-business-unit", "/services/managed-services"],
  ["/cloud-solutions-solutions", "/services/managed-services"],
  ["/cybersecurity-unit", "/services/managed-services"],
  ["/marketing-services-unit", "/services/digital-marketing"],
  ["/training-business-unit", "/about"],
  ["/grow-digital-academy", "/about"],
  ["/our-solutions", "/#pillars"],
  ["/gemini-is-powering-the-future-of-ai-2", "/blog/gemini-is-powering-the-future-of-ai"],
  ["/category/:path*", "/blog"],
  ["/author/:path*", "/blog"],
  ["/tag/:path*", "/blog"],
  ["/blog/page/1", "/blog"],
  ["/feed", "/blog/rss.xml"],
  ["/comments/feed", "/blog/rss.xml"],
  ["/:slug/feed", "/blog/rss.xml"],
  ["/wp-admin/:path*", "/"],
  ["/wp-login.php", "/"],
];

/** A redirect for both `/x` and `/x/` (wildcard sources already match both). */
const withSlash = (source: string, destination: string) =>
  source.includes(":") ? [{ source, destination, permanent: true }] : [
    { source, destination, permanent: true },
    { source: `${source}/`, destination, permanent: true },
  ];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // Old WordPress URLs end with a slash. Handle trailing slashes ourselves so every legacy URL is ONE 301 hop.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      ...legacyPosts.flatMap((slug) => withSlash(`/${slug}`, `/blog/${slug}`)),
      ...legacyPages.flatMap(([source, destination]) => withSlash(source, destination)),
      // Any other URL with a trailing slash → the same URL without it (what Next does by default)
      { source: "/:path+/", destination: "/:path+", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
