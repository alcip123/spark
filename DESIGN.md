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
    fontFamily: "Georgia, serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1.1
  h1:
    fontFamily: "Georgia, serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.15
  h2:
    fontFamily: "Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: "Manrope, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  button:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1
  stat-num:
    fontFamily: "Georgia, serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1
  stat-label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "Manrope, sans-serif"
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
- Serif display type (Georgia) for anything the reader should read as "the content," sans (Manrope) for everything functional
- Soft, diffused, ambient shadows — never a hard offset "pop" shadow
- Pill-shaped buttons and inputs; generous card radii (16–20px)
- No heavy black outlines anywhere — separation comes from tonal shifts and soft shadow, not stroke weight

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

**Display Font:** Georgia (serif; Android falls back to the generic `serif` system family, a genuine equivalent, not a placeholder)
**Body Font:** Manrope (sans-serif; loaded per-weight as distinct font names — 400/500/600/700 — since React Native can't synthesize weights from one file)

**Character:** Serif headlines carry the "notebook" warmth and read as *content*; Manrope carries everything functional (body copy, buttons, labels) with a clean, humanist-geometric sans feel. The pairing is a deliberate contrast: serif for what you're meant to read and absorb, sans for what you're meant to use.

### Hierarchy
- **Display** (600, 44px, 1.1 line-height, Georgia): reserved for the largest one-off moments (e.g. onboarding headlines).
- **H1** (600, 32px, 1.15, Georgia): the fact text itself on the feed card — the single most important piece of type in the app.
- **H2** (600, 24px, 1.2, Georgia): section headers (Settings title, empty-state heading).
- **Body Large** (500, 18px, 1.5, Manrope): larger-scale body copy.
- **Body** (500, 16px, 1.5, Manrope): standard functional/body copy.
- **Button** (700, 17px, 1.0, Manrope, white): all button labels.
- **Stat Number** (600, 20px, 1.0, Georgia): numeric stats, serif for warmth even in data contexts.
- **Stat Label** (600, 11px, 1.3, Manrope): the caption under a stat number.
- **Caption** (600, 13px, 1.3, Manrope): category tags and other small secondary labels.

### Named Rules
**The Read vs. Use Rule.** Georgia (serif) is reserved for content the user is meant to read and dwell on — the fact itself, headlines, stat numbers. Manrope (sans) is reserved for everything the user is meant to operate — buttons, labels, captions, controls. Never swap the two; a button in Georgia or a fact in Manrope both break the system's internal logic.

## 4. Elevation

Depth in Spark is ambient, not structural — shadows read as a soft glow that suggests a surface is gently lifted off the background, never as a hard signal of "this is clickable" or "this is a separate layer." There are no hard offset "pop" shadows anywhere in the system; every shadow is heavily blurred and low-opacity.

### Shadow Vocabulary
- **Card** (`shadowColor: rgba(43,46,56,0.08), offset 0/6, radius 16, elevation 4`): the default lift for action buttons and illustration cards — a barely-there ambient glow.
- **Sheet** (`shadowColor: rgba(43,46,56,0.10), offset 0/12, radius 32, elevation 8`): a slightly stronger glow for full-sheet surfaces (the bottom dock, modal sheets) that need to visually separate from scrolling content behind them.
- **Button** (`shadowColor: rgba(138,130,196,0.35), offset 0/8, radius 20, elevation 6`): a lavender-tinted glow specifically under the primary accent button, tying its elevation back to the one-accent color rather than a neutral gray.

Note: Android's `elevation` shadow is grayscale-only in React Native's standard API, so the lavender-tinted Button shadow only renders its tint on iOS — Android gets a plain gray elevation glow at the same intensity. This is an accepted platform tradeoff, not a bug to fix.

### Named Rules
**The No-Pop Rule.** Every shadow in the system is diffused and low-opacity. If a shadow reads as a hard, dark-edged "pop" (sharp offset, high opacity, small blur radius), it's wrong for this system — soften the blur and lower the opacity until it reads as ambient glow, not a cutout sticker.

## 5. Components

Every interactive surface in Spark is soft and quiet: rounded to a pill or generous card radius, lifted with an ambient shadow instead of a hard border, and never louder than the fact it sits alongside.

### Buttons
- **Shape:** pill radius (999px) for all standalone buttons and circular icon buttons.
- **Primary:** Periwinkle Lavender (`#8A82C4`) background, white text (Button style, 700/17px Manrope), 18px/24px padding, lifted with the lavender-tinted Button shadow. Pressed state swaps to Periwinkle Lavender Pressed (`#7A73B0`) — React Native has no hover, so pressed is the only active-state signal.
- **Icon/action buttons** (like, share, settings, dock buttons): 52px (card actions) or 44px (settings gear) circles, Card White background, Card shadow, glyph rendered as plain styled `Text` (Slate Ink, or Periwinkle Lavender when in an active/liked state) — never an icon library asset.

### Cards / Containers
- **Corner Style:** 16–20px radius (card), 32px (full sheets like modals or the bottom dock).
- **Background:** Card White over the Warm Paper base.
- **Shadow Strategy:** Card shadow for standalone cards/buttons; Sheet shadow for anything separating from scrollable content behind it (modals, the bottom dock).
- **Border:** thin, low-contrast — Hairline Border (`#D8D6D2`) by default, or Lavender Hairline (`#C7C2DE`) specifically on illustration/accent cards. Never a heavy or dark stroke.

### Inputs / Fields
- **Style:** white background, pill radius, Hairline Border, 18px/24px padding, placeholder text in Faint Slate.

### Navigation
- **Settings gear** (top-left floating circle) and the **bottom tab dock** (Home / Dive Deeper / Profile) both use the icon/action-button pattern above rather than a navigation-library chrome — plain glyphs, soft circles, ambient shadow. The dock itself sits on Slate Ink (`#2B2E38`) rather than Card White, giving it a deliberately darker, more anchored feel than the rest of the light-on-cream UI — the one place in the system where the neutral flips dark.

### Segmented Control (Settings)
- **Style:** pill-radius track in Card White with a Hairline Border, active segment filled Periwinkle Lavender with white text — same primary-button color logic applied at a smaller scale.

## 6. Do's and Don'ts

### Do:
- **Do** keep Periwinkle Lavender (`#8A82C4`) as the only saturated accent color on any screen — everything else is a neutral or a lavender-tinted neutral.
- **Do** use ambient, heavily-diffused shadows (Card/Sheet/Button vocabulary above) for any new elevated surface — never a hard offset shadow.
- **Do** reserve Georgia/serif for content the user reads (facts, headlines, stat numbers) and Manrope/sans for everything the user operates (buttons, labels, controls).
- **Do** build new icons as plain styled-`Text` glyphs consistent with the existing heart/share/gear glyphs — this app has no icon library and shouldn't introduce one for a handful of icons.
- **Do** keep borders thin (1–1.5px) and low-contrast; separation comes from tonal shifts and soft shadow, not stroke weight.

### Don't:
- **Don't** introduce a second saturated accent color — no bright primaries, no gamified color-coding.
- **Don't** use heavy black outlines or thick strokes anywhere — this system has none, on purpose.
- **Don't** adopt Duolingo-style gamification: mascot characters, streak-as-pressure badges, bright primary colors, loud celebratory animation.
- **Don't** use a hard, dark-edged "pop" shadow (sharp offset, high opacity, small blur) — every shadow here is ambient and diffused.
- **Don't** clutter the feed card with stat overlays, badges, or extra chrome competing with the fact text — the fact is the only thing that should command attention on that screen.
