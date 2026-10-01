# Grow Digital design system

The whole system grows from the logo. The living reference is the `/design-system` page (noindex), which renders every token and component from the same code the site ships.

## Principles

- **Paper and deep teal.** Pages alternate warm paper bands with deep-teal bands. Every page opens on a dark hero, so the fixed header can sit transparently over it.
- **One accent word.** Each headline sets one word in Instrument Serif italic: `"It's time to *grow*."` rendered through `accent()` or `<Headline>`.
- **The smile arc.** The round-ended U under each "g" of the wordmark is the signature motif. It appears as underlines, bullets, dividers, active indicators and large background shapes, always through `<SmileArc>`.
- **Restraint.** Hairlines instead of shadows. Generous whitespace. Lime appears only on dark surfaces.

## Color tokens (`src/app/globals.css`)

| Token | Hex | Use |
|---|---|---|
| `teal-900` | `#083B3B` | Logo colour, primary buttons on paper, dark bands |
| `teal-950` / `stage` | `#041F1F` / `#052626` | Footer, impact band, 3D stage |
| `teal-800 … teal-50` | ramp | Raised dark surfaces, secondary text, tints |
| `paper` / `paper-2` | `#F6F5F0` / `#EDEBE3` | Page and alternate section backgrounds |
| `line` | `#D9D6CC` | Hairlines on paper |
| `ink` | `#0E1C1C` | Body text on paper |
| `mint` | `#7FE0C8` | Accent word and glow on dark |
| `lime` | `#C8F169` | CTAs, numbers, active states — **dark surfaces only, never text on paper** |
| `danger` | `#C2412D` | Form errors |

Approved text and background pairs, with their WCAG ratios, are listed on `/design-system`.

## Typography

- **Outfit** (300/400/500/600) for display and UI.
- **Instrument Serif italic** for the accent word (`accent-word` utility).
- **JetBrains Mono** for eyebrows and indices (`eyebrow` utility, uppercase, 0.16em tracking).
- **Fluid scale:**

  | Token | Range |
  |---|---|
  | `text-display` | 56 → 120px |
  | `text-h1` | 44 → 80px |
  | `text-h2` | 32 → 56px |
  | `text-h3` | 22 → 28px |
  | `text-body-l` | 19px |
  | `text-body` | 17px |
  | `text-small` | 14px |

## Layout and shape

- `container-site`: max 1280px of content, with a 16px gutter on phones growing to 32px.
- `section-y`: vertical rhythm of 64px on mobile and 128px on desktop.
- Corner radii: cards 20px (`--radius-card`), controls 12px, buttons and chips fully round.
- Icons: lucide-react with `strokeWidth={1.5}`, which matches the logo's round terminals.

## Components

**Primitives** (`src/components/ui`):
- Button (`primary` | `accent` | `ghost` | `ghost-dark` | `link`)
- Section (`paper` | `paper-2` | `dark` | `stage`)
- Container, Eyebrow, SectionHeading / Headline, Chip, SmileArc, ArrowLink
- Reveal (scroll entrance)
- Breadcrumb
- LogoTile: optical sizing from `logo-meta.json`; silhouette by default, colour on hover; solid badges render in greyscale
- Disclosure

**Sections** (`src/components/sections`):
- PageHero, CtaBand, MetricBand
- PillarCard / PillarGrid, PillarNav
- UseCaseCard, SolutionCard
- LogoWall, LogoMarquee
- ScopeValue, ServiceGrid, ValuesGrid

## Motion

- Scroll entrances fade in with a 16px rise over 600ms with `ease-out-expo`.
- Hovers move at most 2px.
- The homepage 3D growth story is scroll-scrubbed: chapter *i* maps to progress *p* ∈ [i/9, (i+1)/9].
- Everything respects `prefers-reduced-motion`: no smooth scroll, no idle motion, and the marquee is static.

## Don't

- Use lime as text or a fill on paper.
- Set more than one accent word per headline.
- Put two dark bands back to back (the impact band directly after a paper band is fine).
- Use drop shadows, gradients on text, or new colors outside the tokens.
