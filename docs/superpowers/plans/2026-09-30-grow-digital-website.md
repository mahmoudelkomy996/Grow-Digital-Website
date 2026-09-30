# Grow Digital Website V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the complete Grow Digital marketing site: 12 pages, the design system, and the "digital tree" 3D scroll story on the homepage.

**Architecture:**
- Next.js 16 App Router with Tailwind v4 tokens.
- All pages are statically generated from typed content modules in `src/content/`.
- The homepage story is a client component. It renders real HTML chapter panels over a lazily-loaded three.js canvas, ported from `prototypes/tree/`.
- The only server code is the contact-form Server Action.

**Tech Stack:** Next.js 16.3.7, React 19.2, TypeScript 5, Tailwind 4.3, three 0.186, gsap 3.15, lenis 1.3, zod 4, lucide-react, resend, @playwright/test 1.63, sharp (scripts only), Magnific MCP (image generation).

**Spec:** `docs/superpowers/specs/2026-09-30-grow-digital-website-design.md`. Content sources: `docs/content/services-portfolio.md`, `docs/content/deck-text.txt`.

## Global Constraints

- **Next.js 16 is newer than most training data.** Read the relevant guide in `node_modules/next/dist/docs/` before using an API.
  - `params` and `searchParams` are Promises.
  - `next/image` uses the `preload` prop, not `priority`.
  - `images.qualities` is `[75, 90]`.
  - `LayoutProps` and `PageProps` are global generated types (run `npx next typegen`).
- **Colors:** use only the tokens in `src/app/globals.css`: teal-50…950, stage, paper, paper-2, line, ink, mint, lime, danger. **Lime is never text on paper.**
- **Fonts:** Outfit (sans), Instrument Serif italic (`accent-word` utility, one word per headline via `*word*` and `accent()` from `src/lib/accent.tsx`), JetBrains Mono (`eyebrow` utility).
- **Layout:**
  - Container utility `container-site`; section padding utility `section-y`.
  - Card radius 20px (`rounded-[var(--radius-card)]`); controls 12px; pills `rounded-full`.
  - Icons: lucide-react at `strokeWidth={1.5}`.
- **Every page starts with a dark hero band** (the header is transparent with paper-colored text at the top, and becomes a paper background with teal text after scrolling).
- **Copy:**
  - Service names are verbatim from the portfolio.
  - Figures and claims are verbatim from the deck.
  - Sentence case for UI labels.
  - US English.
  - No invented clients, numbers or certifications.
- **Accessibility:** WCAG 2.2 AA.
  - One H1 per page.
  - Visible focus.
  - Keyboard-operable interactive elements.
  - Alt text from content.
  - `prefers-reduced-motion` respected.
- **Performance:**
  - three.js only on `/`, via dynamic import.
  - Images via `next/image` with `sizes`.
  - No client component unless it needs state, effects or browser APIs.
- **Git:** commit after each task with a conventional message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never push.
- **Content modules** import siblings with explicit `.ts` extensions (for example `./types.ts`), so that `node --test` can load them. Everything else uses the `@/` alias.

## Review Focus

1. **WebGL unavailable or scene init throws on `/`:** static poster frames appear, the text story still works, and there are no console errors. *Test:* Task 5, Playwright with `--disable-webgl`.
2. **Very narrow screens (320px), long service names, 200% zoom:** no horizontal scroll, and chips and cards wrap. *Test:* Task 11, Playwright checks `scrollWidth <= clientWidth` on every route at 320px.
3. **Contact form with invalid input, an unconfigured email provider, or a double submit:** inline errors, focus on the first invalid field, a mailto fallback in production, and the button disabled while pending. *Test:* Task 9, e2e.
4. **Keyboard-only navigation:** the mega menu opens with Enter or Space, Esc closes it, focus returns to the trigger, and the story rail buttons jump to their chapters. *Test:* Task 4 and Task 11, e2e.
5. **Missing assets:** every image and logo path referenced in content exists on disk, and a missing logo falls back to a wordmark. *Test:* Task 1 (unit) and Task 3 (asset check).

---

## Phase 0: Foundation (DONE, commit `d09d00d`)

- The scaffold, `globals.css` tokens, `src/lib/{fonts,cn,accent}`, `Logo`, `src/content/{types,images,story}.ts` and `next.config.ts` are in place.
- The build passes.

## Phase 1: runs in parallel

### Task 1: Content modules

**Files:**
- Create in `src/content/`: `company.ts`, `pillars.ts`, `solutions.ts`, `use-cases.ts`, `partners.ts`, `clients.ts`, `values.ts`, `industries.ts`, `metrics.ts`, `index.ts`
- Modify: `tsconfig.json` (add `"allowImportingTsExtensions": true`); change `images.ts`/`story.ts` to import `./types.ts`
- Test: `tests/unit/content.test.ts`; `package.json` script `"test:unit": "node --test tests/unit/"`

**Interfaces (produced, exported from `src/content/index.ts`):**
- `COMPANY: Company`
- `PILLARS: Pillar[]` (ordered 01–07)
- `getPillar(slug: string): Pillar | undefined`
- `pillarHref(slug: PillarSlug): string` → `/pillars/${slug}`
- `SOLUTIONS: Solution[]`
- `USE_CASES: UseCase[]`
- `getUseCases(ids: string[]): UseCase[]`
- `PARTNERS: Partner[]`
- `getPartner(id: string): Partner | undefined`
- `CLIENT_SECTORS: ClientSector[]`
- `KEY_PROJECTS: KeyProject[]`
- `REFERENCE_GROUPS: ReferenceGroup[]`
- `VALUES: Value[]`
- `INDUSTRIES: Industry[]`
- `METRICS: Metric[]`
- re-exports of `STORY`, `IMAGES`, `img`

**Logo path convention** (Task 2 creates exactly these files; Task 1 references them):
- `/logos/partners/{inveon,mobilgi,maestrohub,skysens}.png`
- `/logos/clients/{riyadh-hospital,tmc-health,bupa-careconnect,alfagih-hospital,bin-taleb,wlmma,prime-scent,anaqeed,bazarluks,uno,ncm,riyadh-municipality,aqarverse,marco}.png`
- `/logos/projects/{ecb,deutsche-bank,db-netz,saudia,european-commission}.png`
- `/logos/references/{advantech,arup,vestel,bridgestone,kansai-paint,bimbo,organik-kimya,isg,iga,columbia,hotic,watsons,horizon,sneaks-up,ikea,garanti,lc-waikiki,mudo,beko,bizim,lego,afia}.png`
- Navinspire, GTech, Google Cloud, Microsoft Azure, Oracle Cloud and IBM Cloud have **no** `logo` (wordmark).

**Content requirements:**
- The spec §3–4 lists every deep dive per pillar. Fill them from `docs/content/deck-text.txt`.
- Pillar `headline`s match `src/content/story.ts` titles. `featured` matches the story chips.
- Use cases:
  - 12 total (8 AI: inflight catering, vehicle purchase prediction, banking regulatory chatbot, 24/7 healthcare assistant, fraud & AML agentic AI, clinical decision support, maintenance scheduling, competency & skill gap; 4 IoT: energy cost optimization, reducing downtime, production efficiency, product quality).
  - Industry IDs from `IndustryId`.
  - Image ids from `IMAGES`.
- Metrics (5): 71% campaign conversion, up to 20% operating-cost savings, +30% production capacity in one month, −50% quality problems in two months, and "Seconds" response time vs. days.

- [ ] **Step 1: Write the failing test** `tests/unit/content.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  PILLARS, USE_CASES, SOLUTIONS, PARTNERS, CLIENT_SECTORS, KEY_PROJECTS, REFERENCE_GROUPS,
  VALUES, INDUSTRIES, METRICS, COMPANY, STORY, IMAGES, getPillar,
} from "../../src/content/index.ts";

const imageSrcs = new Set(Object.values(IMAGES).map((i) => i.src));

test("seven ordered pillars with services and deep dives", () => {
  assert.deepEqual(PILLARS.map((p) => p.slug), ["consult", "transform", "build", "operate", "secure", "solve", "grow"]);
  PILLARS.forEach((p, i) => {
    assert.equal(p.num, String(i + 1).padStart(2, "0"));
    assert.ok(p.services.flatMap((g) => g.items).length >= 5, `${p.slug} services`);
    assert.ok(p.deepDives.length >= 2, `${p.slug} deep dives`);
    assert.ok(p.featured.length >= 3 && p.featured.length <= 5);
    assert.ok(imageSrcs.has(p.hero.src) && imageSrcs.has(p.secondary.src));
    assert.equal(getPillar(p.slug), p);
  });
});

test("story titles match pillar headlines", () => {
  for (const p of PILLARS) assert.equal(STORY.find((c) => c.id === p.slug)?.title, p.headline);
});

test("use cases reference valid pillars, industries and images", () => {
  assert.equal(USE_CASES.length, 12);
  const industries = new Set(INDUSTRIES.map((i) => i.id));
  for (const u of USE_CASES) {
    assert.ok(getPillar(u.pillar), u.id);
    assert.ok(industries.has(u.industry), u.id);
    assert.ok(imageSrcs.has(u.image.src), u.id);
    assert.ok(u.results.length >= 1, u.id);
  }
  const ids = new Set(USE_CASES.map((u) => u.id));
  for (const p of PILLARS) for (const id of p.useCaseIds) assert.ok(ids.has(id), `${p.slug} → ${id}`);
});

test("partners resolve and logo files exist", () => {
  const partnerIds = new Set(PARTNERS.map((p) => p.id));
  for (const p of PILLARS) for (const id of p.partnerIds) assert.ok(partnerIds.has(id), `${p.slug} → ${id}`);
  const logos = [
    ...PARTNERS, ...CLIENT_SECTORS.flatMap((s) => s.clients), ...KEY_PROJECTS, ...REFERENCE_GROUPS.flatMap((g) => g.logos),
  ].filter((l) => l.logo);
  for (const l of logos) assert.ok(existsSync(`public${l.logo}`), `missing ${l.logo}`);
});

test("company, values, solutions, industries, metrics", () => {
  assert.equal(VALUES.length, 7);
  assert.equal(SOLUTIONS.length, 5);
  assert.equal(SOLUTIONS.filter((s) => s.kind === "own").length, 3);
  assert.equal(INDUSTRIES.length, 7);
  assert.equal(METRICS.length, 5);
  assert.equal(COMPANY.email, "info@growdigital.com");
});
```

- [ ] **Step 2:** Run `npm run test:unit`. Expected: FAIL (the modules are missing).
- [ ] **Step 3:** Write the content modules.
- [ ] **Step 4:** Run `npm run test:unit`. Expected: PASS, except the logo-file assertion, which passes once Task 2 lands.
- [ ] **Step 5:** Run `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 6:** Commit with `feat(content): typed content modules`.

### Task 2: Logos and brand assets

**Files:**
- Create: `scripts/extract-logos.mjs` (sharp)
- Create: `public/logos/**` (exact list in Task 1)
- Create: `src/app/icon.png` (512×512, the logo "g" with its smile on teal-900)
- Create: `src/app/apple-icon.png` (180×180)
- Optional: `public/brand/logo.svg` (Magnific image-to-SVG; keep it only if it matches the PNG at 400% zoom)

**Inputs** (deck media under `…/scratchpad/deck/x/ppt/media/`):

| File | Contents |
|---|---|
| `image61.png` | partners |
| `image52.png` | clients, 4 sector rows |
| `image59.png` | key projects on a dark slide, logos in white boxes |
| `image31`–`image39.png` | IoT references |
| `image63.png` | Inveon references |
| `image67.png` | Mobilgi references |

**Keying rules:**
- Dark logos on white: turn white into transparent, preserving anti-aliasing.
- Light logos on dark tiles (Mobilgi, SkySens, MaestroHub): key the background out and keep the light mark.
- Trim to the content bounds plus 4% padding.
- Output height 160px, transparent PNG.

- [ ] **Step 1:** Run the script, then open every output PNG with the Read tool on a mid-gray background to confirm it is clean (no halo, not cropped). Iterate on the crop boxes.
- [ ] **Step 2:** Produce the icons.
- [ ] **Step 3:** Commit with `feat(brand): partner/client logos and app icons`.

### Task 3: Photography (Magnific)

**Files:** `public/images/**` (43 files, exactly the `src` paths in `src/content/images.ts`), `scripts/check-images.mjs`

**Steps:**
- [ ] **Step 1: Generate.** For each `IMAGES` entry, call `images_generate` with mode `seedream-5-pro`, resolution `2k`, the entry's `aspect`, and prompt `${prompt}, ${IMAGE_STYLE}`. Use count 2 for the 7 pillar heroes and `about-hero`, and count 1 otherwise. Then call `creations_wait` in batches of up to 8.
- [ ] **Step 2: Review and download.** Look at each result. Reject anything with text, garbled hands or faces, wrong culture or attire, or an off-palette grade, and regenerate it. Download the chosen results, then convert them with sharp to JPEG quality 82, max width 2400, mozjpeg.
- [ ] **Step 3: Check.** `scripts/check-images.mjs` asserts every `IMAGES[*].src` exists and is at least 1600px wide. Run it and expect PASS.
- [ ] **Step 4: Commit** with `feat(images): AI photography set`.

### Task 4: UI foundation (primitives, chrome, shared sections, design-system page)

**Files:**
- Create `src/components/ui/`: `Button.tsx`, `Container.tsx`, `Section.tsx`, `Eyebrow.tsx`, `SectionHeading.tsx`, `Chip.tsx`, `SmileArc.tsx`, `ArrowLink.tsx`, `Reveal.tsx` (client), `Breadcrumb.tsx`, `LogoTile.tsx`, `Disclosure.tsx` (client)
- Create `src/components/layout/`: `SiteHeader.tsx` (client), `MegaMenu.tsx`, `MobileMenu.tsx`, `SiteFooter.tsx`
- Create `src/components/sections/`: `PageHero.tsx`, `CtaBand.tsx`, `PillarCard.tsx`, `PillarGrid.tsx`, `UseCaseCard.tsx`, `SolutionCard.tsx`, `LogoMarquee.tsx`, `LogoWall.tsx`, `MetricBand.tsx`, `ScopeValue.tsx`, `ServiceGrid.tsx`, `PillarNav.tsx`, `ValuesGrid.tsx`
- Create: `src/content/navigation.ts`
- Create: `src/app/design-system/page.tsx` (noindex)
- Modify: `src/app/layout.tsx` (header, footer, skip link, `<main id="main">`)
- Test: `tests/e2e/chrome.spec.ts`, `playwright.config.ts`

**Interfaces (produced):**
- `Button({ href?, variant = "primary" | "accent" | "ghost" | "ghost-dark" | "link", size = "md" | "lg", arrow?: boolean, children, ...anchor/button props })`
  - Renders a `next/link` when `href` is set. `accent` = lime on dark. `ghost-dark` = paper outline on dark.
- `Container({ as?, className?, children })`: applies `container-site`.
- `Section({ tone = "paper" | "paper-2" | "dark" | "stage", id?, className?, children })`
  - Applies the background, text color and `section-y`.
  - Dark tones add the `surface-dark` class, `text-teal-100` and `bg-teal-900` / `bg-stage`.
- `Eyebrow({ children, tone? })`: mono eyebrow. Lime on dark, teal-600 on paper.
- `SectionHeading({ eyebrow?, title, lead?, as = "h2", align = "left", tone = "paper" | "dark", className? })`: `title` supports `*accent*`.
- `Chip({ children, tone })`
- `SmileArc({ className?, strokeWidth = 2 })`: inline SVG U-arc with round caps, drawn from the logo (`currentColor`).
- `ArrowLink({ href, children, tone })`
- `Reveal({ children, delay?, className?, as? })`: fade plus a 16px rise on enter (IntersectionObserver). Static under reduced motion.
- `Breadcrumb({ items: { label: string; href?: string }[], tone })`
- `LogoTile({ item: LogoItem, tone = "paper" | "dark" })`
  - Monochrome (CSS `filter`) by default, original colors on hover and focus.
  - Renders a text wordmark when `item.logo` is missing.
- `Disclosure({ summary, children, defaultOpen? })`
- `PageHero({ eyebrow, title, lead?, image?: ImageRef, breadcrumb?, children? })`
  - Dark band; the image sits right on desktop and full-bleed with an overlay on mobile.
  - Renders the page H1.
- `CtaBand({ title = "Let's *grow* together.", lead?, primary?, secondary? })`: dark.
- `PillarCard({ pillar: Pillar })`
- `PillarGrid({ pillars: Pillar[] })`
- `UseCaseCard({ useCase: UseCase, expandable?: boolean })`
- `SolutionCard({ solution: Solution })`
- `LogoMarquee({ items: LogoItem[], tone })`: CSS marquee that pauses on hover or focus; static under reduced motion.
- `LogoWall({ items: LogoItem[], columns?: 3 | 4 | 5 | 6, tone })`
- `MetricBand({ metrics: Metric[] })`
- `ScopeValue({ deepDive: DeepDive, index: number, reverse?: boolean })`
- `ServiceGrid({ groups: ServiceGroup[] })`
- `PillarNav({ current: PillarSlug })`: previous/next plus the 01–07 rail.
- `ValuesGrid({ values: Value[] })`
- `NAV: { label: string; href: string; children?: … }[]` and `FOOTER_LINKS` in `navigation.ts`.

- [ ] **Step 1:** Write `playwright.config.ts`:
  - `webServer`: `npm run build && npm run start -- -p 3100`, with `reuseExistingServer: true`.
  - `baseURL`: `http://localhost:3100`.
  - Projects: chromium-desktop 1440×900 and chromium-mobile 390×844.
- [ ] **Step 2:** Write `tests/e2e/chrome.spec.ts`:
  - the header is visible on `/design-system`;
  - the skip link focuses `#main`;
  - the Pillars mega menu opens with Enter, lists 7 links, closes on Esc, and focus returns to the trigger;
  - the mobile menu opens and closes;
  - the footer has `mailto:info@growdigital.com`.
  - Run it and expect FAIL.
- [ ] **Step 3:** Implement the primitives, chrome and sections. The design-system page renders every token swatch (with contrast pairs), the type scale, and every component in its states.
- [ ] **Step 4:** Run `npx playwright test tests/e2e/chrome.spec.ts` and expect PASS. Then screenshot `/design-system` at 390 and 1440 and review it.
- [ ] **Step 5:** Commit with `feat(ui): design system primitives, chrome and shared sections`.

## Phase 2: runs in parallel, after Phase 1

### Task 5: Growth story (3D tree) on the homepage

**Files:**
- Create: `src/components/story/GrowthStory.tsx` (client), `src/components/story/StoryPanels.tsx`, `src/components/story/StoryRail.tsx`
- Create: `src/components/story/tree/{scene,gen,shaders,bloom}.ts` (ported from `prototypes/tree/*.js`, typed)
- Create: `public/story/fallback-{0..8}.jpg`
- Test: `tests/e2e/story.spec.ts`

**Interfaces:**
- Consumes `STORY` and the Task 4 primitives.
- `createScene({ canvas, reducedMotion, isMobile, logoUrl }): Promise<{ resize(w: number, h: number, dpr: number): void; render(t: number, p: number): void; dispose(): void }>`
- `GrowthStory()` takes no props. It renders the pinned section with id `story`, then a "Skip the story" link to `#integrator`.

**Requirements:**
- Keep the prototype's behavior and visuals (chapter i ↔ p ∈ [i/9, (i+1)/9]), including mobile and reduced-motion paths.
- Lazy-init the canvas when the section is near the viewport.
- On unmount: dispose the renderer and geometries, and cancel rAF.
- Lenis is active only while the home page is mounted.
- On WebGL failure: show `public/story/fallback-{i}.jpg`, cross-faded by chapter.
- Generate the fallbacks by rendering the prototype at the chapter midpoints with the screenshot harness (`scratchpad/tools/shoot.js`), 1600×1000, JPEG.

- [ ] **Step 1:** Write `tests/e2e/story.spec.ts`:
  - the canvas exists and `window.__sceneReady` becomes true;
  - scrolling to 50% shows the "Operate" panel active;
  - rail button "05" moves to the Secure chapter;
  - with `launchOptions.args: ["--disable-webgl"]`, a fallback image is visible and no console errors are logged.
  - Run it and expect FAIL.
- [ ] **Step 2:** Port the scene and build the component.
- [ ] **Step 3:** Run the tests and expect PASS. Measure fps ≥ 50 at 1440×900 via the harness.
- [ ] **Step 4:** Commit with `feat(home): 3D growth story`.

### Task 6: Homepage sections

**Files:**
- Modify: `src/app/page.tsx`
- Create in `src/components/home/`: `IntegratorStatement.tsx`, `FeaturedUseCases.tsx`, `SolutionsShowcase.tsx`, `IndustryTiles.tsx`, `PartnersAndClients.tsx`

**Sections, in spec §4.1 order:**
- story (Task 5 component; import `GrowthStory`)
- `#integrator` statement plus mission and vision
- `MetricBand`
- `PillarGrid`
- featured use cases (3)
- solutions (5)
- industries (7)
- partners marquee plus client wall
- values
- `CtaBand`

- [ ] Test: add to `tests/e2e/pages.spec.ts` the home case: one H1; the sections by heading text; 7 pillar links; no console errors.
- [ ] Commit with `feat(home): homepage sections`.

### Task 7: Pillar pages

**Files:**
- Create: `src/app/pillars/[slug]/page.tsx`
  - `generateStaticParams` over `PILLARS`, with `dynamicParams = false`.
  - `generateMetadata`.
- Create: `src/components/pillar/{PillarPage,SolveExtras,SecureExtras,TransformExtras}.tsx`

**Page structure** (spec §4.2, in order):
- `PageHero`
- `ServiceGrid`
- `ScopeValue` per deep dive (alternating)
- pillar-specific extras:
  - TRANSFORM: AGPM benefits, the Navinspire/GTech/SkySens/MaestroHub partners
  - SECURE: what's special, key projects
  - SOLVE: own vs partner solutions, exclusive representation, customer references
  - OPERATE: cloud platforms
- related use cases
- partners strip
- `PillarNav`
- `CtaBand`

- [ ] Test: for each of the 7 slugs, the page returns 200, the H1 contains the pillar headline, and the services count equals the content count. `/pillars/unknown` returns 404.
- [ ] Commit with `feat(pillars): pillar pages`.

### Task 8: About and Use cases

**Files:**
- Create: `src/app/about/page.tsx`, `src/components/about/LifecycleDiagram.tsx`
- Create: `src/app/use-cases/page.tsx`, `src/components/use-cases/UseCaseExplorer.tsx` (client; filter state kept in the URL `?pillar=&industry=`)

- [ ] Test:
  - About shows 7 values and the lifecycle with 7 verbs.
  - Use cases shows 12 cards.
  - Filtering by pillar=transform plus category shows only matching cards.
  - Filter state survives a reload.
  - Each card's expand button toggles `aria-expanded`.
- [ ] Commit with `feat: about and use cases pages`.

### Task 9: Partners, Contact, 404

**Files:**
- Create: `src/app/partners/page.tsx`, `src/app/contact/page.tsx`, `src/components/contact/ContactForm.tsx` (client)
- Create: `src/app/actions/contact.ts` (`"use server"`, zod, honeypot, in-memory rate limit, Resend when `RESEND_API_KEY` and `CONTACT_TO` are set)
- Create: `src/app/not-found.tsx`, `.env.example`

**Interfaces:**
- `submitContact(prev: ContactState, formData: FormData): Promise<ContactState>`
- `ContactState = { status: "idle" | "success" | "error"; message?: string; fieldErrors?: Partial<Record<"name" | "company" | "email" | "phone" | "interest" | "message" | "consent", string>> }`
- Used via `useActionState`.

- [ ] Test:
  - Partners renders 4 sections and at least 30 logos or wordmarks.
  - Contact: submitting empty shows 5 field errors and focuses the name field; valid data in dev shows success; the submit button is disabled while pending.
  - Unknown route shows the custom 404 with pillar links.
- [ ] Commit with `feat: partners, contact and 404`.

### Task 10: SEO and metadata

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/pillars/[slug]/opengraph-image.tsx`, `src/lib/seo.ts` (`pageMetadata()`, `organizationJsonLd()`, `serviceJsonLd(pillar)`)
- Modify: every page's `metadata`/`generateMetadata`

- [ ] Test:
  - `/sitemap.xml` lists 12 URLs.
  - `/robots.txt` disallows `/design-system`.
  - Every page has a unique `<title>`, a meta description and a canonical URL.
  - Home has Organization JSON-LD.
  - The OG image routes return `image/png`.
- [ ] Commit with `feat(seo): metadata, sitemap, robots, OG images, JSON-LD`.

## Phase 3: Integration and review

### Task 11: Full verification

- [ ] `npx tsc --noEmit`, `npm run lint` and `npm run build` show zero errors. `npm run test:unit` and `npx playwright test` pass.
- [ ] Add `tests/e2e/responsive.spec.ts`: every route at 320, 390, 768 and 1440 has no horizontal overflow and no console errors.
- [ ] Take screenshots of every route at 390, 768 and 1440, review each one, and fix defects.
- [ ] Run Lighthouse on `/`, `/pillars/transform` and `/contact`, and meet the spec §10 targets.
- [ ] Commit with `test: responsive and e2e coverage; fixes`.

### Task 12: Design and accessibility review

- [ ] Independent reviewers look at the screenshots and the code through three lenses: art direction and brand, UX and copy, and accessibility (contrast, focus, keyboard, semantics).
- [ ] Fix every P0 and P1 finding, then re-verify with Task 11.
- [ ] Commit with `fix: review findings`.

### Task 13: Docs

- [ ] Write `DESIGN.md` (tokens, typography, motif, components, do's and don'ts) and `README.md` (run, build, env vars, content editing, image regeneration).
- [ ] Commit with `docs: design system and README`.
