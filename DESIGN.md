---
name: Spark
description: A calm, one-fact-at-a-time feed with a lavender-and-cream visual system
colors:
  bg: "#F6F5F3"
  bg-alt: "#FFFFFF"
  accent-primary: "#8A82C4"
  accent-primary-pressed: "#7A73B0"
  illustration-fill-1: "#E4E0F5"
  illustration-fill-2: "#E9E7F9"
  illustration-icon: "#7A73B0"
  text-primary: "#2B2E38"
  text-secondary: "#6B7180"
  text-muted: "#8B90A0"
  border: "#D8D6D2"
  border-accent: "#C7C2DE"
  footer-bg: "#2B2E38"
  footer-text: "#F6F5F3"
typography:
  display:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1.1
  h1:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.15
  h2:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  button:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1
  stat-num:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1
  stat-label:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "System (iOS) / Inter (Android, web)"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  pill: "999px"
  card: "18px"
  sheet: "32px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent-primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "18px 24px"
  button-primary-pressed:
    backgroundColor: "{colors.accent-primary-pressed}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "18px 24px"
  action-button:
    backgroundColor: "{colors.bg-alt}"
    textColor: "{colors.text-primary}"
    rounded: "999px"
    size: "52px"
  action-button-liked:
    backgroundColor: "{colors.bg-alt}"
    textColor: "{colors.accent-primary}"
    rounded: "999px"
    size: "52px"
  card-illustration:
    backgroundColor: "{colors.bg-alt}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  input-text:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "18px 24px"
---

# Design System: Spark

## 1. Overview

**Creative North Star: "The Curious Notebook"**

Spark reads like flipping through a well-kept notebook of interesting things, not scrolling a feed engineered to grab you. Every screen keeps the fact itself as the only thing competing for attention — actions, navigation, and chrome stay quiet, soft-edged, and out of the way until touched. The palette leans into a lavender-and-cream calm rather than the bright-primary, high-contrast energy of typical short-form content apps; depth is ambient (a soft glow, never a hard "pop"), and every interactive surface is soft and quiet rather than tactile or attention-seeking.

This system explicitly rejects the loud, gamified register of mainstream trivia apps: no bright primary colors, no mascot characters, no streak-as-pressure badges, no heavy black outlines. Where Spark borrows from social feeds, it borrows the *pacing* (frictionless, one-thing-at-a-time), never the visual loudness.

**Key Characteristics:**
- Warm-neutral cream background with a single lavender accent, used sparingly
- System typography (San Francisco on iOS, bundled Inter elsewhere) at varying weights for hierarchy — see §3, and the phase-1 note there about rollout scope
- Soft, diffused, ambient shadows — never a hard offset "pop" shadow — for surfaces this plan hasn't touched; floating chrome on the Feed screen and bottom dock uses the `glass` material tier instead (§4a)
- Pill-shaped buttons and inputs; generous card radii (16–20px)
- No heavy black outlines anywhere — separation comes from tonal shifts, soft shadow, or a hairline glass edge, not stroke weight

## 2. Colors

A quiet, warm-neutral palette built around one lavender accent — color is used sparingly and deliberately, never to compete with the fact on screen.

### Primary
- **Periwinkle Lavender** (`#8A82C4`): the single accent color — CTAs, the liked-heart fill, the Dive Deeper button's emphasis, key highlights. Used on a small minority of any given screen; its rarity is the point.
- **Periwinkle Lavender, Pressed** (`#7A73B0`): the active/pressed state for the accent, standing in for a hover state RN doesn't have.

### Neutral
- **Warm Paper** (`#F6F5F3`): the base background across the whole app.
- **Card White** (`#FFFFFF`): card and panel surfaces sitting above the base background (action buttons, inputs, illustration cards).
- **Slate Ink** (`#2B2E38`): primary text and headlines; also doubles as the footer/dock background so the bottom bar reads as a deliberate dark anchor, not an accent color.
- **Muted Slate** (`#6B7180`): secondary text, subtext under headlines.
- **Faint Slate** (`#8B90A0`): captions, labels, the least-emphasized text tier.
- **Hairline Border** (`#D8D6D2`): default low-contrast border/divider.
- **Lavender Hairline** (`#C7C2DE`): the border used specifically on illustration/accent cards, tying borders back to the accent hue without raising contrast.

### Named Rules
**The One Accent Rule.** Periwinkle Lavender (`#8A82C4`) is the only saturated color in the system. Every other color is a neutral (warm paper, card white, slate ink) or a lavender-tinted neutral (illustration fills, lavender hairline border). If a screen needs a second "pop" of color, that's a sign to reconsider the design, not to add a second accent.

## 3. Typography

**System Font:** San Francisco on iOS, via React Native's native `'System'` family — no bundling, and it picks up RN's `fontWeight` prop directly. Android and web use bundled Inter, loaded per-weight as distinct font names (`Inter_400Regular`/`500Medium`/`600SemiBold`/`700Bold`) the same way the previous Manrope font was, since neither platform can synthesize weight from a single font file the way iOS can.

**Character:** Spark no longer runs a serif/sans split. One system-native font family, used at different weights (400–700) and sizes, carries the entire type hierarchy — the same approach iOS's own first-party apps use, where hierarchy comes from weight/size/color rather than switching typefaces. Georgia and Manrope have been fully removed as dependencies.

> **Phase-1 rollout note:** this migration to system typography was scoped to the Feed screen and bottom dock (`FeedScreen`, `FactCard`, `BottomDock`). Because the `typography` tokens below are global (defined once in `src/theme.ts`), every screen in the app renders the new system font regardless of doc scope — there is no lingering Georgia/Manrope rendering anywhere. This section, and the "glass" section below, document the *design intent* established for Feed/Dock; other screens (Onboarding, Dive Deeper, Settings, Profile) haven't had their layouts/surfaces otherwise reconsidered for this system yet and may still read as designed for the old serif/sans pairing even though the font itself has changed everywhere.

### Hierarchy
- **Display** (600, 44px, 1.1 line-height, System/Inter): reserved for the largest one-off moments (e.g. onboarding headlines).
- **H1** (600, 32px, 1.15, System/Inter): the fact text itself on the feed card — the single most important piece of type in the app.
- **H2** (600, 24px, 1.2, System/Inter): section headers (Settings title, empty-state heading).
- **Body Large** (500, 18px, 1.5, System/Inter): larger-scale body copy.
- **Body** (500, 16px, 1.5, System/Inter): standard functional/body copy.
- **Button** (700, 17px, 1.0, System/Inter, white): all button labels.
- **Stat Number** (600, 20px, 1.0, System/Inter): numeric stats.
- **Stat Label** (600, 11px, 1.3, System/Inter): the caption under a stat number.
- **Caption** (600, 13px, 1.3, System/Inter): category tags and other small secondary labels.

### Named Rules
**~~The Read vs. Use Rule~~ (superseded).** This rule described the old Georgia/Manrope serif-vs-sans split ("serif for what you're meant to read, sans for what you're meant to use") and no longer applies — the system now uses one font family throughout, with hierarchy expressed through weight and size instead. Left here, struck through, so old references to "the Read vs. Use Rule" in review history resolve to something rather than a dangling citation.

## 4. Elevation

Depth in Spark is ambient, not structural — shadows read as a soft glow that suggests a surface is gently lifted off the background, never as a hard signal of "this is clickable" or "this is a separate layer." There are no hard offset "pop" shadows anywhere in the system; every shadow is heavily blurred and low-opacity.

### Shadow Vocabulary
- **Card** (`shadowColor: rgba(43,46,56,0.08), offset 0/6, radius 16, elevation 4`): the default lift for action buttons and illustration cards — a barely-there ambient glow.
- **Sheet** (`shadowColor: rgba(43,46,56,0.10), offset 0/12, radius 32, elevation 8`): a slightly stronger glow for full-sheet surfaces (the bottom dock, modal sheets) that need to visually separate from scrolling content behind them.
- **Button** (`shadowColor: rgba(138,130,196,0.35), offset 0/8, radius 20, elevation 6`): a lavender-tinted glow specifically under the primary accent button, tying its elevation back to the one-accent color rather than a neutral gray.

Note: Android's `elevation` shadow is grayscale-only in React Native's standard API, so the lavender-tinted Button shadow only renders its tint on iOS — Android gets a plain gray elevation glow at the same intensity. This is an accepted platform tradeoff, not a bug to fix.

### Named Rules
**The No-Pop Rule.** Every shadow in the system is diffused and low-opacity. If a shadow reads as a hard, dark-edged "pop" (sharp offset, high opacity, small blur radius), it's wrong for this system — soften the blur and lower the opacity until it reads as ambient glow, not a cutout sticker.

## 4a. Glass Material (Feed + Dock)

Floating chrome that sits *above* scrolling content — the Feed screen's settings button, the like/share buttons on each `FactCard`, and the bottom tab dock — uses a translucent "glass" material instead of the solid Card White + shadow treatment above. It's built from the shared `GlassSurface` component (`src/components/GlassSurface.tsx`), which composes three layers, in order, back to front:

1. **Base fill** — a translucent `bgAlt` ("Card White") layer (`rgba(255,255,255,0.62)` light / `rgba(39,41,53,0.6)` dark). Spark's background is a flat, uniform color with nothing scrolling behind these surfaces, so blur alone (below) is nearly invisible against it — the base fill is what gives the surface actual presence.
2. **Blur** — `expo-blur`'s `BlurView`, blended on top of the base fill for the frosted-glass quality.
3. **Hairline border** — a low-alpha edge off the ink/white end of the palette (`rgba(43,46,56,0.12)` light / `rgba(255,255,255,0.10)` dark for the lighter "chrome" tier; slightly stronger for "dock"), replacing the default Hairline Border token for this surface only.

### Tiers
- **`chrome`** (intensity 30): small floating controls — Feed's settings gear, `FactCard`'s like/share buttons.
- **`dock`** (intensity 50): the bottom tab dock pill — larger, more grounded, a stronger blur to match.

### When to use which
Use `glass.chrome`/`glass.dock` (via `<GlassSurface variant="..." radius={...} />`) only for surfaces that float over actively-scrolling feed content on the Feed screen and dock. Everything else — Settings, Profile, Dive Deeper, Onboarding, modal sheets — keeps the solid Card White + Card/Sheet shadow treatment from §4; those surfaces don't sit over moving content, so glass has no visual payoff there and would be inconsistent with the rest of the system.

### Platform note
`BlurView` has no true blur on Android by default (`experimentalBlurMethod` defaults to `'none'`, a flat translucent overlay). `GlassSurface` passes `experimentalBlurMethod="dimezisBlurView"` to enable real blur there via the third-party implementation `expo-blur` bundles support for; if that ever needs to be dialed back, the base-fill layer above means Android degrades gracefully to "translucent, no blur" rather than "invisible," so it's an accepted tradeoff either way — same tone as the Android `elevation` grayscale-shadow note above.

## 5. Components

Every interactive surface in Spark is soft and quiet: rounded to a pill or generous card radius, lifted with an ambient shadow instead of a hard border, and never louder than the fact it sits alongside.

### Buttons
- **Shape:** pill radius (999px) for all standalone buttons and circular icon buttons.
- **Primary:** Periwinkle Lavender (`#8A82C4`) background, white text (Button style, 700/17px Manrope), 18px/24px padding, lifted with the lavender-tinted Button shadow. Pressed state swaps to Periwinkle Lavender Pressed (`#7A73B0`) — React Native has no hover, so pressed is the only active-state signal.
- **Icon/action buttons:** 52px (card actions) or 44px (settings gear) circles, glyph rendered as plain styled `Text` (Slate Ink, or Periwinkle Lavender when in an active/liked state) — never an icon library asset. On the Feed screen specifically, the like/share/settings buttons use the `glass.chrome` material (§4a) instead of Card White + Card shadow; everywhere else this pattern still uses Card White background + Card shadow as originally specified.

### Cards / Containers
- **Corner Style:** 16–20px radius (card), 32px (full sheets like modals or the bottom dock).
- **Background:** Card White over the Warm Paper base.
- **Shadow Strategy:** Card shadow for standalone cards/buttons; Sheet shadow for anything separating from scrollable content behind it (modals, the bottom dock).
- **Border:** thin, low-contrast — Hairline Border (`#D8D6D2`) by default, or Lavender Hairline (`#C7C2DE`) specifically on illustration/accent cards. Never a heavy or dark stroke.

### Inputs / Fields
- **Style:** white background, pill radius, Hairline Border, 18px/24px padding, placeholder text in Faint Slate.

### Navigation
- **Settings gear** (top-left floating circle) and the **bottom tab dock** (Home / Dive Deeper / Profile) both use the icon/action-button pattern above rather than a navigation-library chrome — plain glyphs, soft circles. Both now use the `glass.chrome`/`glass.dock` material (§4a) rather than a solid background: the dock pill is translucent glass over the scrolling feed, not the solid Slate Ink surface used in earlier revisions of this system. The Dive Deeper button is the one exception — it stays a solid filled Periwinkle Lavender circle, the system's only fully-opaque saturated surface (see the Global Constraints in the implementation plan).

### Segmented Control (Settings)
- **Style:** pill-radius track in Card White with a Hairline Border, active segment filled Periwinkle Lavender with white text — same primary-button color logic applied at a smaller scale.

## 6. Do's and Don'ts

### Do:
- **Do** keep Periwinkle Lavender (`#8A82C4`) as the only saturated accent color on any screen — everything else is a neutral or a lavender-tinted neutral.
- **Do** use ambient, heavily-diffused shadows (Card/Sheet/Button vocabulary above) for any new elevated surface — never a hard offset shadow.
- **Do** use the System/Inter typeface at the weight the tier specifies (see §3) — hierarchy comes from size and weight now, not from switching typeface. (Superseded: this used to be a Georgia-serif/Manrope-sans split — see §3's Named Rules.)
- **Do** build new icons as plain styled-`Text` glyphs consistent with the existing heart/share/gear glyphs — this app has no icon library and shouldn't introduce one for a handful of icons.
- **Do** keep borders thin (1–1.5px) and low-contrast; separation comes from tonal shifts and soft shadow, not stroke weight.

### Don't:
- **Don't** introduce a second saturated accent color — no bright primaries, no gamified color-coding.
- **Don't** use heavy black outlines or thick strokes anywhere — this system has none, on purpose.
- **Don't** adopt Duolingo-style gamification: mascot characters, streak-as-pressure badges, bright primary colors, loud celebratory animation.
- **Don't** use a hard, dark-edged "pop" shadow (sharp offset, high opacity, small blur) — every shadow here is ambient and diffused.
- **Don't** clutter the feed card with stat overlays, badges, or extra chrome competing with the fact text — the fact is the only thing that should command attention on that screen.
