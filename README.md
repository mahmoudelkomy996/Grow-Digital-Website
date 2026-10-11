# Grow Digital website

The marketing site for Grow Digital, "The agile integrator". It covers one accountable team that consults, transforms, builds, operates, secures and grows, plus Grow Digital's own digital and AI solutions.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and three.js for the homepage 3D growth story.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
```

## Checks

```bash
npm run typecheck    # next typegen + tsc
npm run lint
npm run test:unit    # content integrity (node --test)
npx playwright install chromium
npm run test:e2e     # builds, starts on :3100 and runs every e2e spec
BASE_URL=http://localhost:3000 npx playwright test   # against a running server
```

## Pages

| Route | Content |
|---|---|
| `/` | 3D growth story (9 chapters), integrator statement, impact, pillars, use cases, solutions, industries, partners and clients, values |
| `/services/[slug]` | The four service pillars (consultancy, managed-services, software-development, digital-marketing): every service with its deliverables and outcome, plus coverage models, products and packages. Content: `src/content/services.ts` (from the October 2026 services document). Old `/pillars/*` URLs 301-redirect here. |
| `/use-cases` | 12 AI and IoT use cases with URL-based filters |
| `/partners` | Exclusive solution partners, data/AI and cloud partners, clients by sector, key projects, partner references |
| `/about` | Who we are, mission and vision, lifecycle, values, KSA and UAE |
| `/contact` | Contact form (Server Action) and details |
| `/blog` | Insights: 47 articles migrated from the old WordPress blog, paginated (12 per page), with category pages `/blog/category/[pillar]` |
| `/blog/[slug]` | Article: table of contents, share links, related posts, BlogPosting + BreadcrumbList JSON-LD, per-post OG image |
| `/design-system` | Living style guide (noindex) |

## Editing content

All copy lives in typed modules in `src/content/`: `pillars.ts`, `use-cases.ts`, `partners.ts`, `clients.ts`, `solutions.ts`, `company.ts`, `story.ts` and others. Pages never hard-code copy.

- In headlines, wrap one word in `*asterisks*` to set it in the serif accent.
- Sources are the deck (`docs/content/deck-text.txt`) and the services portfolio (`docs/content/services-portfolio.md`).
- After editing, run `npm run test:unit`. It checks counts, cross-references, and that every image and logo file exists.

## Images and logos

- **Photography** is AI-generated with Magnific (Seedream 5 Pro, 2K).
  - Prompts and alt text live in `src/content/images.ts`, along with the shared art-direction suffix `IMAGE_STYLE`.
  - To replace an image, generate it with the same aspect, then run `node scripts/optimize-image.mjs <in> public/images/...` and `node scripts/check-images.mjs`.
- **Logos** were extracted from the company deck with `scripts/extract-logos.mjs` into `public/logos/`.
  - After adding or replacing a logo, run `node scripts/logo-meta.mjs` to refresh optical sizing.
  - A partner without a `logo` field renders as a text wordmark.

## Blog

Posts are Markdown files in `content/blog/<slug>.md`. The file name is the URL slug.

```yaml
---
title: "Article title"
description: "One or two sentences (used as meta description, max ~158 chars shown)"
date: "2026-10-01"
updated: "2026-10-01"
category: "software-development"   # consultancy | managed-services | software-development | digital-marketing
cover: "/blog/<slug>.jpg"  # optional; put the original in assets-src/blog-covers/ and run node scripts/grade-covers.mjs
coverAlt: "What the cover shows"
author: "Grow Digital Team"
---

Body in Markdown (GFM). Use ## and ### for sections; they build the table of contents.
```

- New posts appear automatically in `/blog`, the category page, the sitemap, the RSS feed (`/blog/rss.xml`), `llms.txt`, and the related-posts sections on the home and pillar pages.
- `scripts/migrate-wp-blog.mjs` re-imports the old WordPress posts (it overwrites `content/blog`); `npm run test:unit` validates every post.

## SEO

- **Metadata:** every page has a unique title, meta description (≤160 chars), canonical URL, Open Graph and Twitter card; posts use `og:type=article` with published and modified times.
- **Open Graph images:** generated per page, per pillar and per post (`opengraph-image.tsx`).
- **Structured data (JSON-LD):** Organization and WebSite (home), Service (pillars), BreadcrumbList (every page with a breadcrumb), Blog (listings), BlogPosting (articles).
- **Crawling:** `/sitemap.xml` (all pages, categories, pagination and posts with lastModified and cover images), `/robots.txt`, `/blog/rss.xml`, `/llms.txt` (summary for AI assistants), `/manifest.webmanifest`.
- **Migration:** every old WordPress URL (`/<post-slug>/`, `/contact-us/`, `/cybersecurity-unit/`, `/category/*`, `/feed/`…) 301-redirects to its new page (see `next.config.ts`).
- **Verification and analytics:** set `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` and `NEXT_PUBLIC_GA_ID` (see `.env.example`). After launch, submit `https://growdigital.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- **Headers:** HSTS, nosniff, referrer policy, frame options and permissions policy are set for every route; `X-Powered-By` is off.

## Contact form email

Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`, `CONTACT_TO` and `CONTACT_FROM`.

- **Without them:** development logs submissions to the console, and production shows a friendly fallback pointing to info@growdigital.com.

## Docs

- Design spec: `docs/superpowers/specs/2026-09-30-grow-digital-website-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-30-grow-digital-website.md`
- Design system rules: `DESIGN.md`
- The 3D concept prototypes (tree, city, arc) live in `prototypes/`; the tree was chosen. Serve them with `node prototypes/serve.js 5178`.
