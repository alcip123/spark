# Apple System Pass: Feed + Dock

## Context

Spark's current visual system ("Cool Modern" / "Curious Notebook," documented in
`DESIGN.md`) is a deliberate, well-executed lavender-and-cream identity: Georgia
serif for content, Manrope sans for chrome, solid white cards lifted with
ambient soft shadows, pill radii. It's internally consistent everywhere except
the new onboarding flow (`PopButton`, `WelcomeScreen`, `SignUpScreen`), which
uses an unrelated neo-brutalist hard-shadow/black-border style — a separate,
already-known inconsistency that is explicitly **out of scope** for this pass.

The goal of this spec is a different, additive direction: make Spark's core
screens feel like a native iOS system app — Weather, Health, Journal — rather
than a branded content feed. That means system typography, translucent glass
materials, and physics-tuned motion, while keeping Spark's lavender accent and
calm/quiet brand personality intact.

This spec covers **Phase 1 only**: the Feed screen and the Bottom Dock (the
two surfaces a user sees on essentially every visit). Onboarding, Dive Deeper,
Settings, and Profile get the same treatment in a later phase, once this
direction is confirmed to feel right in practice.

## Goals

- Replace the serif/Manrope typographic split with a single system-font
  family, weight-differentiated, matching how iOS system apps build hierarchy.
- Introduce real translucent "glass" materials (blur) for floating chrome —
  the settings button, like/share buttons, category tag, and the bottom dock —
  replacing today's solid white cards + soft shadow.
- Unify all interactive press motion on Feed/Dock onto one shared spring
  curve, so every control feels like the same physical material.
- Keep the lavender accent (`#8A82C4`) as the single saturated color, used
  even more sparingly than today (the Dive Deeper dock button remains the one
  filled-lavender surface; everything else on these two screens goes to
  glass/translucent).
- Preserve every existing behavior on these screens exactly: personalization
  scoring, dwell tracking, like/share side effects, haptics, reduced-motion
  handling, accessibility labels/roles, safe-area handling, and the responsive
  `maxReadingWidth`/`contentInset` centering on wide viewports.

## Non-Goals

- Onboarding (`WelcomeScreen`, `SignUpScreen`, `OnboardingScreen`,
  `PopButton`) is not touched in this pass.
- `DiveDeeperScreen`, `SettingsScreen`, `ProfileScreen` are not touched in
  this pass.
- No changes to data model, personalization logic, or store behavior —
  this is a presentation-layer pass only.
- No new accent color and no shift toward Apple's system blue — confirmed:
  lavender stays.
- Dark mode gets the same treatment conceptually (glass tokens are defined
  for both light and dark) but is not a separate design exercise here — it
  follows the existing light/dark token-pairing pattern already in
  `theme.ts`.

## 1. Typography: system font, single family

Remove `fontSerif` and the `manrope` weight map from `theme.ts`. Replace with
one `fontSystem` platform-select:

- **iOS**: `'System'` — resolves to San Francisco automatically, no font
  files needed, no licensing concern (Apple's own OS font, on Apple's own
  platform).
- **Android / web**: bundle **Inter** via `@expo-google-fonts/inter`, loaded
  per-weight (400/500/600/700) the same way Manrope is loaded today — same
  geometry family as SF Pro (grotesque sans, tall x-height, rounded
  terminals), the standard substitute apps use to read as "native-ish" on
  platforms Apple doesn't license SF Pro to.

Every typography tier in `theme.ts` (`display`, `h1`, `h2`, `bodyLg`, `body`,
`button`, `statNum`, `statLabel`, `caption`) switches to `fontSystem` at its
existing size/weight/line-height — hierarchy comes from size and weight only,
not from switching typeface. `display`/`h1`/`h2` drop their explicit
`fontWeight: '600'` serif styling in favor of the system font's own 600
weight file.

Only `FeedScreen`/`FactCard` and `BottomDock` consume typography in this
phase, but the token change in `theme.ts` is global — screens not yet
migrated (onboarding, Dive Deeper, Settings) will pick up the new system font
too as a side effect, since there's no per-screen typography override today.
This is expected and acceptable: it makes those screens *more* consistent
with this direction in the meantime, not less.

## 2. Materials: glass tokens

New `glass` export in `theme.ts`, light/dark-aware like `colors`:

```ts
glass: {
  chrome: { intensity: 30, tint: 'light' | 'dark', ... },
  dock:    { intensity: 50, tint: 'light' | 'dark', ... },
}
```

- **`glass.chrome`** — lighter blur, used for small floating controls: the
  settings gear button, the like/share action buttons, the category tag.
- **`glass.dock`** — stronger blur, used for the bottom dock pill only —
  gives it more visual weight as a fixed system layer, matching how iOS's own
  tab bars blur more aggressively than small floating buttons.

Implementation: `expo-blur`'s `BlurView` (new dependency — not currently in
`package.json`), `tint` driven by the existing `colorScheme` resolution in
`theme.ts` (`'light'` in light mode, `'dark'` in dark mode), `intensity` per
the values above. Web: `expo-blur` renders `BlurView` via a CSS
`backdrop-filter` fallback on `react-native-web`, so the same component works
across all three targets Spark already ships to (per `Platform.select` usage
elsewhere in the codebase) — no separate web code path needed.

Every surface migrating to glass keeps a hairline edge, but the edge softens
from today's flat `colors.border` gray to a lighter, more translucent
highlight (`rgba(255,255,255,0.3)`-family in light mode, an equivalently
subtle light-on-dark edge in dark mode) — consistent with how iOS glass
surfaces catch a light edge rather than using a flat stroke color.

Solid-surface `shadows.card` usage is removed from the components this phase
touches (glass + blur is the depth cue now, not a drop shadow) — `shadows`
tokens themselves stay in `theme.ts` unchanged, since Onboarding/Dive
Deeper/Settings still use them until their own phase.

## 3. Feed screen changes

Scoped to `FeedScreen.tsx` and `FactCard.tsx`.

- **Card body**: unchanged structurally — full-bleed background, fact text
  centered, no container. Only the font changes (system font via the
  `typography.h1` token update above).
- **Category tag**: currently absent from `FactCard`'s rendered output per
  the code as read (no category label is currently rendered on the card
  itself, only used internally for personalization) — if a category tag is
  reintroduced visually in this pass, it renders as a small `glass.chrome`
  pill. If not reintroduced, this bullet is a no-op; confirmed at
  implementation time by checking current `FactCard` output against
  `DESIGN.md`'s caption/category-label description.
- **Like / Share buttons**: `FactCard`'s `actionButton` style swaps from
  `backgroundColor: colors.bgAlt` + `shadows.card` to a `BlurView` wrapper
  using `glass.chrome`, same 52×52 circle size, same icon components
  (`HeartIcon`/`ShareIcon`) and same liked/unliked color logic unchanged.
  `SparkBurst` (the like animation) is unaffected — it renders above this
  surface, not part of it.
- **Settings gear button**: `FeedScreen`'s floating `circleButton` swaps to
  the same `glass.chrome` `BlurView` treatment, same 44×44 size and position
  (`top: insets.top + spacing.md`, tracking `contentInset`). This is the
  highest-visibility "glass over scrolling content" moment on the screen,
  since the fact card scrolls directly underneath it.
- **Motion**: `PressableScale` (used by the gear and action buttons) gets a
  single tuned spring preset — fast press-in, controlled release, no
  overshoot bounce — applied consistently. This replaces whatever per-usage
  spring values exist today so gear/like/share all feel identical to the
  touch. Exact spring constants are an implementation-time tuning detail, not
  a spec-level number.
- **Everything else unchanged**: `Animated.FlatList` paging behavior, dwell
  tracking, `onViewableItemsChanged`, `contentInset`/`maxReadingWidth`
  responsive centering, empty state, accessibility roles/labels/hit slops.

## 4. Bottom dock changes

Scoped to `BottomDock.tsx`.

- **Pill surface**: swaps from `backgroundColor: colors.bgAlt` + `borders.default`
  + `shadows.sheet` to a `BlurView` using `glass.dock`, same pill shape,
  same `DOCK_PILL_HEIGHT`/`DOCK_PILL_BOTTOM_MARGIN` sizing and position.
- **Icon treatment**: inactive tabs (Discover, Profile when not selected) drop
  to a reduced-opacity `textMuted`-equivalent on glass, matching iOS's
  convention for inactive tab-bar glyphs. Active tab uses the lavender accent
  at full opacity — same `colors.accentPrimary` logic already in place, no
  change to the active/inactive color decision itself, only to the surface
  behind it.
- **Dive Deeper button**: stays exactly as-is — solid `colors.accentPrimary`
  filled circle with `shadows.button` — this remains the one deliberately
  non-glass, fully-saturated element in the dock, per the "one accent used
  sparingly" rule pushed further in this pass (everything else is glass; the
  one action Spark wants you to notice stays solid and lavender).
- **Motion**: dock tab presses use the same shared spring preset as Feed's
  action buttons (see above) for a consistent feel across the two most-used
  surfaces in the app.

## Technical notes

**New dependencies:**
- `expo-blur` — BlurView for all glass surfaces.
- `@expo-google-fonts/inter` — Android/web system-font substitute, loaded
  alongside the existing `@expo-google-fonts/manrope` font-loading call
  (Manrope itself is removed from active use once this phase's screens no
  longer reference it, but the package can stay if other not-yet-migrated
  screens still use it — resolved at implementation time based on what's
  still importing `manropeWeights`).

**Files expected to change:**
- `src/theme.ts` — typography tokens, new `glass` export, remove
  `fontSerif`/`manrope` where superseded.
- `src/screens/FeedScreen.tsx` — settings button surface + motion.
- `src/components/FactCard.tsx` — action button surfaces + motion, category
  tag if applicable.
- `src/components/BottomDock.tsx` — pill surface, icon opacity, motion.
- `src/components/PressableScale.tsx` — shared spring preset, if the tuning
  lives there rather than per-caller (implementation-time decision based on
  current structure).
- `App.tsx` — font loading, if Inter needs to be added to the existing
  `useFonts` call.
- `package.json` / `package-lock.json` — new dependencies.

**Out of scope files** (confirmed untouched by this phase): `WelcomeScreen.tsx`,
`SignUpScreen.tsx`, `OnboardingScreen.tsx`, `PopButton.tsx`,
`DiveDeeperScreen.tsx`, `SettingsScreen.tsx`, `ProfileScreen.tsx`.

## Verification

- Visual: run the app (Expo web and/or iOS simulator/device via Expo Go) and
  confirm Feed and Dock render the glass/blur effect, system font, and unified
  motion feel on both light and dark system appearance.
- Functional regression check: personalization scoring (like/share/dwell),
  haptics on like, `SparkBurst` animation, empty-feed state, paging/snap
  behavior, and accessibility labels all behave identically to before this
  change — this phase is presentation-only and must not alter any of them.
- Reduced Motion: confirm the shared spring preset still respects
  `useReducedMotion`/`ReduceMotion.System` the way today's animations already
  do.
- Cross-platform: confirm `BlurView` renders acceptably on iOS, Android, and
  web (web via `react-native-web`'s `backdrop-filter` fallback) — Android's
  blur fidelity is historically weaker than iOS's; if it renders as a flat
  translucent tint rather than a true blur, treat that the same way
  `theme.ts` already treats Android's grayscale-only `elevation` shadow tint
  (an accepted platform tradeoff, documented in a comment, not a bug to
  chase).
