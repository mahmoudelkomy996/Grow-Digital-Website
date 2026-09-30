# Grow Digital Website V2 — Design Spec

Date: 2026-09-30
Status: Draft for review
Owner: master@nami-tec.com

## 1. Intent

Redesign growdigital.com around the new positioning in `GrowDigital_Deck_v2_Final.pptx` and the seven-pillar services portfolio.

- **Outcome:** a premium, multi-page marketing site that presents Grow Digital as "The Agile Integrator": one accountable team for enterprises and government in KSA and the UAE, not another vendor in the stack.
- **Audience:** CIOs and CDOs, transformation leads, and procurement at enterprises, healthcare providers and government entities in KSA and the UAE.
- **Success means:**
  - The homepage tells the CONSULT → GROW story through an interactive 3D scroll experience.
  - Every service is reachable within two clicks.
  - Every page ends in a clear contact CTA.
  - Pages meet WCAG 2.2 AA and hit the Lighthouse targets in §10.

### Decisions already made (with the user)

| Topic | Decision |
|---|---|
| Stack | Next.js (App Router) + TypeScript + Tailwind CSS |
| Language | English only (no RTL/i18n in this phase) |
| Scope | Full multi-page site (12 pages + 404 + internal design-system page) |
| Visual direction | "C — Hybrid lifecycle": paper base, dark teal bands, the 7 pillars as the site's spine |
| Accent | Lime `#C8F169`, used sparingly and on dark surfaces only |
| Homepage 3D | "The digital tree" concept (prototype: `prototypes/tree.html`) |
| Imagery | All photography generated with Magnific (AI), unified teal grade |

### Out of scope

- Arabic/RTL
- CMS
- Blog
- Training unit (from the old site)
- Analytics
- Deployment/hosting setup (the site is Vercel-ready but will not be deployed in this phase)
- Partners from the old site that are absent from the new content (XGEN, 3CX, CorporateStack, Envivo, Entropik, Fletum, Segmentify, Educational Services)

## 2. Information architecture

| Route | Purpose |
|---|---|
| `/` | Home: the 3D growth story plus a summary of everything else |
| `/about` | Who we are, mission, vision, values, how we work, KSA and UAE presence |
| `/pillars/consult` | 01 CONSULT: Consulting & Advisory |
| `/pillars/transform` | 02 TRANSFORM: Data, AI & IoT |
| `/pillars/build` | 03 BUILD: Software Development & Digital Experience |
| `/pillars/operate` | 04 OPERATE: Managed Services |
| `/pillars/secure` | 05 SECURE: Cybersecurity |
| `/pillars/solve` | 06 SOLVE: Digital, Cloud & AI Solutions |
| `/pillars/grow` | 07 GROW: Marketing & Growth |
| `/use-cases` | 12 use cases (8 AI + 4 IoT), filterable by pillar and industry |
| `/partners` | Solution, data/AI and cloud partners; clients by sector; key projects |
| `/contact` | Contact form, email, phone, social links |
| `/design-system` | Living style guide (noindex) |
| `not-found` | Custom 404 |

**Header:**
- Logo on the left.
- Nav items: Pillars, Solutions, Use cases, Partners, About.
  - **Pillars** opens a mega menu with the 7 pillars, numbered 01–07. Each entry shows its full name and 3 sample services.
  - **Solutions** links to `/pillars/solve`.
- "Talk to us" CTA on the right.
- Behavior: transparent over dark heroes and the home story; paper background with a hairline border after scrolling. Mobile gets a full-screen menu.

**Footer:**
- Logo and tagline "It's time to grow."
- Pillar links.
- Company links (About, Use cases, Partners, Contact).
- Contact block (info@growdigital.com, +971 50 3122672).
- Social links (growdigitalmea on LinkedIn, X, Instagram, Facebook, YouTube).
- © 2026 Grow Digital.

## 3. Content sources

- **Services:** the user-supplied "Services & Solutions Portfolio" (verbatim service names; pillar 6 renamed "Digital, Cloud & AI Solutions").
- **Positioning, mission, vision, values, deep dives, use cases, partners:** the deck (text extracted to `scratchpad/deck_text.txt`).
- **Copy editing:** light edits for the web. Fix typos (e.g. "inComerce" → "InCommerce", "tones" → "tonnes"), tighten long paragraphs, and keep every claim and figure exactly as stated in the deck.

All content lives in typed modules under `src/content/`. Pages render only from these modules, never from hard-coded copy.

- `company.ts`: name, tagline, mission, vision, contact, social.
- `pillars.ts`: 7 pillars. Each has: slug, num, verb, name, oneLiner, heroImage, services[], deepDives[] ({title, objective, scope[], value[]}), partners[], relatedUseCases[].
- `solutions.ts`: Grow Bot, Medical Decision & Approval Intelligence Platform, ATHAR EMR (own); InCommerce by Inveon, OneStore by Mobilgi (partner).
- `useCases.ts`: 12 items. Each has: id, title, industry, pillar, project, results[] ({value, label}), image.
- `partners.ts`: solution partners (Inveon, Mobilgi, MaestroHub, SkySens); data/AI partners (Navinspire, GTech); cloud (Google Cloud, Microsoft Azure, Oracle Cloud, IBM Cloud); partner customer references.
- `clients.ts`: clients grouped by sector (Healthcare & Insurance, Retail & eCommerce, Government, Construction & Real Estate); key projects (ECB, Deutsche Bank, DB Netz, Saudia, European Commission).
- `values.ts`: Ownership, Integrity, Client Impact, One Team, Keep Growing, Make It Happen, Respect.
- `industries.ts`: Healthcare, Smart Cities & Government, Real Estate & Construction, Retail & eCommerce, Financial Services, Manufacturing & Energy, Aviation & Logistics.

## 4. Page designs

### 4.1 Home `/`

1. **Growth story (3D, pinned).** Nine chapters: intro, the 7 pillars, finale. See §6.
2. **Integrator statement** (paper). Headline: "A business integrator, not another vendor in the stack." Supporting line: "…so you stop managing five contracts and start managing one outcome." Mission and Vision as two columns.
3. **Impact band** (dark teal). Five metrics from the use cases, each labeled with its source:
   - 71% campaign conversion lift
   - up to 20% operating cost savings
   - +30% production capacity in one month
   - −50% quality problems in two months
   - responses in seconds, not days
4. **Pillars grid** (paper). Seven numbered cards with name, one-liner and 3 services, each linking to its pillar page. This gives visitors who skip the story the same map.
5. **Featured use cases.** Three cards, then "All use cases →".
6. **Solutions.** Our three products and the two partner platforms, then a link to `/pillars/solve`.
7. **Industries.** Seven tiles with images.
8. **Partners and clients.** A marquee of partner logos and a sector-grouped client logo wall, then a link to `/partners`.
9. **Values.** Seven values in a compact grid.
10. **CTA band.** "Let's grow together." Buttons: "Talk to us" and email.

### 4.2 Pillar template `/pillars/[slug]`

Statically generated from `pillars.ts`.

1. **Hero** (dark band). Eyebrow "0N — VERB", pillar full name as H1, one-liner, hero image, breadcrumb.
2. **Services.** The full list from the portfolio as a numbered, scannable grid. Sub-groups where the portfolio has them (e.g. Industry-Specific AI, GrowShield).
3. **Deep dives.** A `ScopeValue` block per deep dive: title, objective, "Scope includes" list, "Value delivered" list, image.
   - CONSULT: Advisory Services, Quality Assurance, PMO, Business Consultancy, Digital Transformation, Data & Analytics Advisory, AI Lab (ImpactLab), Change Management & Training.
   - TRANSFORM: Data Management, Data Integration, Data Lake, Reporting & BI, AI & Advanced Analytics, ImpactLab, Industry-specific AI, Industrial IoT (SkySens), Manufacturing IoT (MaestroHub), Agile Predictive Monitoring (AGPM) with its 4 benefits; partners Navinspire and GTech.
   - BUILD: Mobile/Web Development, UX/UI Design, Application Development, Integration Services (HIS↔ERP, patient apps↔HIS, Oracle Fusion↔NCR POS, payment gateways).
   - OPERATE: Cloud services (GCP, Azure, Oracle Cloud, IBM Cloud); GrowShield™ Managed Services (scope/value) and its 5 security services.
   - SECURE: 11 services; "A deeper look" (VAPT, 24/7 Managed Security, Cloud security incl. IAM, Awareness training); "What's special" (3 points); "Comprehensive expertise"; Key projects (5, with logos).
   - SOLVE:
     - Our solutions: Grow Bot, Medical Decision & Approval Intelligence, ATHAR EMR.
     - Partner solutions: InCommerce by Inveon (6 features), OneStore by Mobilgi (3 points).
     - "Exclusive representative and delivery arm in KSA and UAE" for Inveon, Mobilgi, MaestroHub and SkySens, with partner customer references.
   - GROW: Marketing Services BU (Digital Marketing, Business Development, Marketing Research), GrowthLab data analytics, growth management with Inveon know-how, 14 services.
4. **Related use cases.** Up to 3 cards, only when the pillar has any.
5. **Partners strip.** Only when the pillar has partners.
6. **Pillar navigation.** Previous/next pillar, with the 01–07 rail.
7. **CTA band.**

### 4.3 Other pages

- **About:**
  1. Hero (image)
  2. Who we are (integrator copy)
  3. Mission and Vision
  4. How we work (a Consult → Grow lifecycle diagram of the seven verbs)
  5. Values
  6. KSA and UAE presence
  7. Partners strip
  8. CTA
- **Use cases:**
  - Filter chips for pillar and industry. Filtering is client-side and the state is kept in the URL query.
  - Cards show industry, title, project summary and 1–4 result metrics. Clicking a card expands it in place into the full description, as an accessible disclosure.
- **Partners:** four sections:
  1. Solution partners (exclusive in KSA/UAE)
  2. Data and AI partners, and cloud partners
  3. Clients by sector
  4. Key projects
- **Contact:** form and details (see §9).
- **404:** a short line, a small still of the seed, and links to the pillars.

## 5. Design system

The logo is the source for the whole system.

### 5.1 Color tokens

The ramp is anchored on the logo teal, sampled as `#083B3B`.

| Token | Hex | Use |
|---|---|---|
| `teal-950` | `#041F1F` | deepest surfaces |
| `teal-900` | `#083B3B` | logo, primary brand, dark bands, primary buttons on paper |
| `teal-800` | `#0D4B4A` | dark raised surfaces |
| `teal-700` | `#145E5C` | secondary text on paper |
| `teal-600` | `#1E7773` | links on paper |
| `teal-500` | `#2E948E` | accents, focus rings on paper |
| `teal-400` | `#58B0A9` | muted text on dark |
| `teal-300` | `#8FCDC6` | secondary text on dark |
| `teal-200` | `#C2E5E0` | body text on dark |
| `teal-100` | `#E2F2EF` | tints on paper |
| `teal-50` | `#F1F8F6` | subtle fills |
| `stage` | `#052626` | 3D stage background |
| `paper` | `#F6F5F0` | page background |
| `paper-2` | `#EDEBE3` | alternate sections |
| `line` | `#D9D6CC` | hairlines on paper |
| `ink` | `#0E1C1C` | body text on paper |
| `mint` | `#7FE0C8` | glow and highlights on dark |
| `lime` | `#C8F169` | accent: CTAs, active states and numbers **on dark only**; never as text on paper |
| `danger` | `#C2412D` | form errors |

Every text/background pairing used must pass WCAG AA. The `/design-system` page documents each approved pair.

### 5.2 Typography

- **Display and UI:** Outfit (300/400/500), a geometric round sans that echoes the logo's round letterforms.
- **Accent:** Instrument Serif Italic, for one emphasized word per headline (e.g. "It's time to *grow*.").
- **Mono:** JetBrains Mono, for eyebrows, numbers and pillar indices ("01 — CONSULT").
- **Fluid scale** (clamp-based):

  | Style | Size |
  |---|---|
  | Display | 56 → 120px |
  | H1 | 44 → 80px |
  | H2 | 32 → 56px |
  | H3 | 22 → 28px |
  | Body-L | 19px |
  | Body | 17px |
  | Small | 14px |
  | Eyebrow | 12px, mono, +0.16em tracking |

- Loaded with `next/font/google` (self-hosted, `display: swap`).

### 5.3 Shape language

- The logo's round terminals give pill buttons and chips, 20px card radius, 12px control radius, and monoline icons with round caps. Icons come from Lucide at 1.5px stroke.
- **The "smile arc"** (the round-ended U under each g) is the signature motif. It appears as:
  - the underline for highlighted words,
  - section dividers,
  - list bullets,
  - the loading and active indicators.
- It is implemented once as a `SmileArc` SVG component.
- **Surfaces:** paper, `paper-2`, dark teal bands (`teal-900`/`stage`), with hairline borders instead of heavy shadows.
- **Spacing:** 4px base; section rhythm 96/128/160px desktop and 64/80px mobile; 12-column grid; container max 1280px; gutters 16px on mobile and 32px on desktop.

### 5.4 Components (`src/components/ui`, `src/components/sections`)

- **Primitives:** Button (primary teal / accent lime on dark / ghost / link), Chip, Eyebrow, SectionHeading, Container, Card, SmileArc, Logo, Icon, Breadcrumb, Disclosure, FilterChips, Field (input, textarea, select, checkbox with error states).
- **Sections:** SiteHeader (with MegaMenu and MobileMenu), SiteFooter, PillarHero, ServiceGrid, ScopeValue, MetricBand, PillarGrid, UseCaseCard, SolutionCard, IndustryTiles, LogoMarquee, LogoWall, ValuesGrid, CtaBand, PillarNav, LifecycleDiagram, ContactForm.
- **Motion:** GSAP for scroll reveals (fade and a 16px rise, 600ms, `ease-out`), respecting `prefers-reduced-motion`. The marquee pauses on hover and focus.
- **Deliverables:**
  - tokens in `src/app/globals.css` (Tailwind v4 `@theme`),
  - the `/design-system` page, which renders every token and component state,
  - `DESIGN.md` at the repo root summarising rules and do/don't.

## 6. Homepage 3D story — "The digital tree"

The reference implementation is `prototypes/tree/` (scene.js, gen.js, shaders.js, bloom.js), which is being refined now. Chapter mapping, copy and interaction follow `prototypes/shared/story.js`.

| # | Chapter | Scene |
|---|---|---|
| 0 | Intro: "It's time to grow." | A luminous seed on a polar grid, with a heartbeat ring |
| 1 | CONSULT | The seed opens; roots spread and light the grid (strategy, roadmap); branch 1 sprouts |
| 2 | TRANSFORM | The trunk rises; data particles flow up like sap; branch 2 |
| 3 | BUILD | Segment rings on the trunk; crystalline blocks snap onto branch 3 |
| 4 | OPERATE | Continuous pulses through all branches, fireflies, a monitoring dial; branch 4 |
| 5 | SECURE | A geodesic hex shell tiles around the canopy; branch 5 |
| 6 | SOLVE | Three product orbs bloom with partner satellites; branch 6 |
| 7 | GROW | The canopy bursts into ~11k leaf particles; the camera rises; branch 7 |
| 8 | Finale | The complete tree, calm and wide; logo, statement and CTA in the panel |

- **Integration:**
  - The prototype is ported to TypeScript modules under `src/components/story/tree/`, importing `three` from npm.
  - A client component `GrowthStory` renders the text panels and chapter rail as real HTML, so the text is crawlable and accessible.
  - The canvas is loaded with `next/dynamic` (`ssr: false`), and only once the story enters the viewport.
  - Lenis is used for smooth scrolling on the home page only.
- **Contract (unchanged from the prototype):**
  - `createScene({canvas, reducedMotion, isMobile, chapters, logoUrl})` returns `{resize(w,h,dpr), render(t,p)}`.
  - The scene state is a pure function of the story progress `p`.
- **Accessibility:**
  - The canvas is `aria-hidden`.
  - The rail consists of buttons with labels.
  - Keyboard users can jump between chapters with the rail.
  - There is a "Skip the story" link to the integrator section.
- **Fallbacks:**
  - Under `prefers-reduced-motion`, there is no smooth scroll and no idle motion; the scene still follows scroll progress.
  - If WebGL is unavailable or the scene fails to initialize, a static poster frame per chapter is shown. The nine PNGs are rendered from the scene itself with the screenshot harness.
  - On mobile, particle counts and bloom are reduced; the prototype's mobile path is kept.
- **Performance budget:**
  - ≥ 50 fps at 1440×900 on integrated graphics (Intel UHD 630, as measured in the prototype).
  - Three.js chunk ≤ 200 KB gzip.
  - The story must not block LCP. The LCP element is the intro headline (HTML).

## 7. Imagery (Magnific)

- **Model:** Seedream 5 Pro at 2K, ~100 credits per image. Hero images get 2 variants to choose from.
- **Art direction** (shared prompt suffix): editorial corporate photography; cinematic; deep teal shadows and soft cream highlights to match `#083B3B` and `#F6F5F0`; soft natural light; shallow depth of field; modern Gulf context (Riyadh, Dubai); premium and calm; no text, logos or watermarks.
- **People:** Gulf professionals in modern business attire (including thobe and ghutra, abaya and hijab), portrayed respectfully.
- **Set** (~45 images):

  | Group | Count |
  |---|---|
  | Pillar heroes | 7 |
  | Pillar secondary | 7 |
  | About | 3 |
  | Use cases | 12 |
  | Solutions | 5 |
  | Industries | 7 |
  | Contact | 1 |
  | Home CTA | 1 |
  | Fallback spares | 2 |

- **Budget:** ≈ 6–9k credits of the 537k available.
- **Pipeline:** generate → review → pick → download to `public/images/<group>/<name>.jpg` (2K) → served via `next/image` (AVIF/WebP, responsive sizes) → alt text written for every image.
- **Logo:**
  - Vectorize the supplied logo PNG with Magnific image-to-SVG (150 credits) and verify it against the original at 400% zoom.
  - Fallback: the high-resolution transparent PNGs already created (`logo-teal.png`, `logo-paper.png`).
  - Favicon and app icon: the "g" with its smile arc.
- **Open Graph image:** generated in code (`opengraph-image.tsx`) with the logo and page title on teal. Not AI-generated.

## 8. Partner and client logos

- Cropped from the deck into individual transparent PNGs under `public/logos/<group>/<slug>.png`:
  - slide 39: Inveon, Mobilgi, MaestroHub, SkySens
  - slide 32: 15 client logos
  - slide 38: 5 key-project logos
  - slide 21: 9 IoT references
  - slides 40–41: Inveon and Mobilgi references
- **Display:** a monochrome teal treatment by default and original colors on hover and focus, with consistent optical sizing via a per-logo scale factor in `partners.ts`.
- **Missing logos:** Navinspire, GTech, Google Cloud, Microsoft Azure, Oracle Cloud and IBM Cloud are rendered as clean text wordmarks until official files are supplied.

## 9. Contact form

- **Fields:**
  - Required: name, company, work email, message, consent checkbox.
  - Optional: phone, "area of interest" (the 7 pillars plus "Not sure yet").
- **Validation:** client-side and server-side with zod, plus a honeypot field and a basic per-IP rate limit (in memory).
- **Submission:** a Server Action `submitContact`.
  - If `RESEND_API_KEY` and `CONTACT_TO` are set, it sends via Resend.
  - Otherwise, in development, it logs and returns success.
  - In production without configuration, it returns a friendly message with a `mailto:info@growdigital.com` fallback.
- **States:** idle / submitting / success / error. Errors show inline per field, and focus moves to the first invalid field.

## 10. Quality, SEO and testing

- **SEO:**
  - Per-page metadata and canonical URLs.
  - `sitemap.ts`, `robots.ts`.
  - JSON-LD `Organization` (and `Service` on pillar pages).
  - Semantic headings (one H1 per page).
- **Accessibility:** WCAG 2.2 AA; skip link; visible focus (`teal-500` or `lime` depending on surface); keyboard-operable mega menu, disclosure and filters; alt text; reduced motion.
- **Automated checks:**
  - `tsc --noEmit`, ESLint and `next build` must pass.
  - Playwright:
    - every route returns 200, renders its H1 and logs no console errors;
    - mega menu keyboard navigation;
    - use-case filters;
    - contact form validation and success path (mocked);
    - the story renders a canvas, or the fallback when WebGL is disabled.
- **Visual review:** screenshots of every page at 375, 768 and 1440 px, reviewed before handoff.
- **Lighthouse targets:**

  | Pages | Performance (mobile) | Accessibility | SEO | Best Practices |
  |---|---|---|---|---|
  | Inner pages | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 |
  | Home | ≥ 75 (3D) | ≥ 95 | ≥ 95 | ≥ 95 |

## 11. Architecture

```
src/
  app/
    layout.tsx, globals.css (tokens), page.tsx (home)
    about/ use-cases/ partners/ contact/ design-system/
    pillars/[slug]/page.tsx (generateStaticParams)
    sitemap.ts robots.ts opengraph-image.tsx not-found.tsx
    actions/contact.ts
  components/
    ui/ sections/ story/ (GrowthStory.tsx, tree/*.ts)
  content/ (typed content modules, §3)
  lib/ (seo.ts, fonts.ts, cn.ts)
public/ images/ logos/ brand/ story-fallback/
docs/ DESIGN.md
tests/ (Playwright)
```

- **Rendering:** all pages are static (SSG). The only server code is the contact Server Action.
- **Dependencies (kept minimal):** next, react, typescript, tailwindcss, three, gsap, lenis, zod, lucide-react, resend (optional at runtime), @playwright/test (dev).

## 12. Open items

These need input from the user but do not block the build.

1. **Permission to show client logos and key-project logos.** Key projects (ECB, Deutsche Bank, DB Netz, Saudia, European Commission) will be labelled "delivered by our cybersecurity experts and partners". Confirm this wording is accurate.
2. **Official logo files** for Navinspire, GTech and the cloud vendors.
3. **Office addresses** in KSA and the UAE, if they should be shown.
4. **Email provider** for the contact form (Resend key and recipient address).
5. **Real descriptions for the three own products** (Grow Bot, Medical Decision & Approval Intelligence, ATHAR EMR). The deck has one line each, and the site will expand them modestly without inventing claims.
