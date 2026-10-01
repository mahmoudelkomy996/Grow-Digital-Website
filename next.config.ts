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
  ["/contact-us", "/contact"],
  ["/testing", "/"],
  ["/ecommerce-solutions", "/pillars/solve"],
  ["/cloud-business-unit", "/pillars/operate"],
  ["/cloud-solutions-solutions", "/pillars/operate"],
  ["/cybersecurity-unit", "/pillars/secure"],
  ["/marketing-services-unit", "/pillars/grow"],
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
  async redirects() {
    return [
      ...legacyPosts.map((slug) => ({ source: `/${slug}`, destination: `/blog/${slug}`, permanent: true })),
      ...legacyPages.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
