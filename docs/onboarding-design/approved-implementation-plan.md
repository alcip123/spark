# Plan: Spark onboarding as one continuous scene (portal → Rook → topics → sign up)

## Context
Today onboarding is three unrelated screens (`WelcomeScreen` → `SignUpScreen` → `OnboardingScreen`) glued by a horizontal `ScreenTransition` slide in `App.tsx`. The Welcome screen is a small static Rook in a flat SVG arch, a heavy black-shadow `PopButton`, and a large dead zone before the CTA.

The redesign treats the welcome portal and everything after it as **one persistent spatial scene viewed from different camera positions**. Final art (7 layered PNGs) and a Rive Rook rig come later from the user; this pass builds the full architecture, layout, motion, and state flow with isolated, replaceable placeholders. Placeholders are engineering stand-ins, not the visual benchmark.

Decisions already made with the user:
- Art: user supplies layered PNGs later; no cropping the mockup; no SVG attempt at final art. Placeholders (gradient/SVG + existing `assets/mascot/rook.png`) stay isolated in one file.
- Scope: full experience (static layout, idle life, Get Started choreography, camera push with parallax, Rook greeting bubble, Continue → curiosity prompt).
- Rook: Rive is the production target. For now the Rook component is an abstraction over `rook.png` with whole-body motion only (breathe, tilt, sway, scale, position, hop). **No faked blink/eye/turn by distorting the PNG.** Must not require Rive to boot.
- Flow order becomes: Welcome portal → Rook greeting → curiosity prompt → topic picker → Sign Up → completion. Sign Up is kept, just moved after topics. Selected topics persist in the store before Sign Up.
- No `ScreenTransition` slide anywhere in the finished flow. Big move (portal) happens once; later steps are foreground-UI changes over the same persistent room.

## State machine
`welcome → entering → rookGreeting → curiosityPrompt → topicSelection → signUp → completion`
- In-memory only (never persisted). Lives in `App.tsx` as a single `OnboardingPhase` (replaces `step: 'welcome' | 'signup' | 'onboarding'`). Existing reset effect (`!onboardingComplete → welcome`) stays.
- Auth is decoupled from the picker: `OnboardingScreen`'s `handleContinue` currently calls `setPreferredCategories` + `setOnboardingComplete(true)`, which would drop the user into the feed before Sign Up. Change: the picker only calls `setPreferredCategories(selected)` and advances the phase; `setOnboardingComplete(true)` fires when Sign Up's buttons continue (completion). Topics are already in the persisted `feedStore`, so nothing is lost if auth happens later.
- **Interruption / re-entry rules (deterministic, never stuck):** a cold start or reload always begins at `welcome` (phase isn't persisted, `onboardingComplete` is still false). If the app backgrounds and resumes during `entering`, an `AppState` listener snaps the camera/timeline to its end state and sets `rookGreeting` rather than resuming a half-run animation; if it resumes in any other phase nothing changes. Timeline callbacks check the current phase before advancing, so a late callback can't move a user who has already moved on. Previously chosen topics are kept and pre-selected in the picker on re-entry.

## New files (all under `src/onboarding/`)
- `sceneAssets.ts` — **the one place art is configured.** A typed registry, one entry per layer: `background`, `glow`, `midground`, `rook`, `rookTurn`, `foregroundLeft`, `foregroundRight` (matches the 7 files the user will supply, to live in `assets/onboarding/`). Each entry: `source` (PNG require, or `undefined` → placeholder), `placement` (x, y, width, height as fractions of the portal/scene box), `parallax` factor, `z`. Swapping final art = change `source` + placement here only. (Metro can't `require` a missing file, so entries stay `undefined` until the PNG lands.)
- `placeholders.tsx` — restrained gradient/SVG stand-ins per layer, each exported by the same key, with a `PLACEHOLDER` banner comment. Isolated so deleting the file is the only cleanup.
- `OnboardingScene.tsx` — owns the camera shared value (0 = portal view, 1 = inside) and renders the layer stack: background → glow → midground → Rook → portal wall/frame → foreground foliage → UI. Foreground UI (headline/CTA, bubble, picker, sign up) are children swapped by phase over the persistent scene.
- `PortalFrame.tsx` — the cream wall with an arch-shaped hole (SVG even-odd rect-minus-arch) plus thin aubergine frame (`#382644`), inner bevel/recess shading and one faint blurred highlight (≤8% opacity) replacing the diagonal glass polygon. Scaled up about the arch center during the push so it exits the viewport and the cream disappears.
- `parallax.ts` — pure helper: layer transform from `camera` and a per-layer factor. The spec's numbers (background 0.75, glow 0.60, midground/Rook 1.0, foreground 1.15) are **starting values only**, centralized in `sceneAssets.ts` and expected to be re-tuned once production art exists; the requirement is optical depth, not those exact constants. Likewise all placement fractions are tunable starting points. Foreground moves most, background least; portal wall scales fastest.
- `RookCharacter.tsx` — the abstraction. Props: `pose` from the spec's vocabulary (`idle | lookUser | lookGlow | curiousTilt | notice | turnAway | hopForward | land | turnBack | greet | talkIdle`) and `size/position`. Static implementation: breathing scale loop, small irregular tilt/sway, hop/land via translate+squash on the container. Poses the PNG can't express (`lookGlow`, `turnAway`, `turnBack`, blink) map to container-level motion only or no-ops, each marked `// TEMP: needs Rive rig`. Exports a `RookRig` interface (`setPose`, `fire(input)`) so a future `RiveRook` swaps in. A `try`/optional-require loader picks Rive if the package + `.riv` exist, else the static fallback. **Rive is not installed now** (it needs a dev build and breaks Expo Go).
- `useWelcomeTimeline.ts` — choreography using Reanimated `withDelay/withTiming/withSequence` with `runOnJS` callbacks for phase changes, Rook pose triggers, and haptics. Timings from the spec §28: 0 haptic + button compress → 100 glance → 250 headline fades → 300 CTA fades and drops 8–12px → 500 Rook hop → 600–1200 camera push (portal wall scales out, parallax separates) → 1350 decelerate → 1500 Rook settles → 1650 `turnBack` → 1750 bubble in. Cinematic easing, ~1.75s total. One more light haptic on arrival. Second-call guard so rapid double-taps and taps before the entrance finishes are safe.
- `CtaButton.tsx` — new button, **not** a change to `PopButton` (`SignUpScreen` still uses it). "Get started →" (cream `#FFF8E9` on aubergine `#523669`), radius ~24, height ~58, width ~80% (capped by `layout.maxReadingWidth`), soft shadow (y6/blur18/~12%), press scale 1→0.98 over ~100ms, light haptic, `Platform.OS !== 'web'` guard as in `PopButton.tsx:61`, ≥44pt target.
- `SpeechBubble.tsx` — warm cream surface, large radius, soft shadow, aubergine text, small tail, opacity 0→1 + scale 0.96→1 over ~240ms. Two lines of copy driven by phase: "Hey there, I'm Rook!" then a Continue → "Before we find your Spark, what are you curious about?"
- `Headline.tsx` (or inline) — "Find your" sans Medium 24 + "Spark." in a tokenized `displayFont` (temporarily Georgia Bold, matching the current screen, ~38 — about 12% under the current 44). **Georgia is a placeholder, not the approved Spark display typeface;** the font family/weight/size live as a `display` token in `theme.ts` so the final type system can replace it globally, line gap ~0–6px, 24–36px below the portal; the CTA 32–48px below that, grouped as one unit.

## Changes to existing files
- `App.tsx` — replace the `step` flow and `ScreenTransition` usage with `OnboardingScene` driven by the phase machine; keep the reset-onboarding effect. When `onboardingComplete` is true, render the feed as today.
- `src/screens/OnboardingScreen.tsx` — becomes the topic-selection foreground UI (cream only where legibility needs it, no big modal card, restrained scale/colour chip response, light haptic on chip toggle, heading "What are you curious about?"); stops calling `setOnboardingComplete`. Reuses `CategoryPicker`, `PrimaryButton`, `useFeedStore` as-is.
- `src/screens/SignUpScreen.tsx` — rendered as a foreground state over the room; keep its buttons/`PopButton`; its `onContinue` now calls `setOnboardingComplete(true)`.
- `src/screens/WelcomeScreen.tsx` — **not deleted this pass.** Remove its active import from `App.tsx` and add a `@deprecated` header comment. Its `ROOK` palette and arch path are ported into the new theme constants.
- `src/components/ScreenTransition.tsx` — **not deleted this pass.** Remove active usages, mark `@deprecated`. Both files are cleaned up only after the new onboarding is approved on-device.
- `src/theme.ts` — add the onboarding palette (paper `#F7F2E8` pending test against art, frame `#382644`, button `#523669`, button text `#FFF8E9`) as one `onboarding` constant group rather than touching the global scheme.

## Shared-scene guarantee (critical)
The interior seen through the portal before Get Started is **the same live rendered layer stack** that becomes the full-screen room after the push, not a preview image or a second component. `OnboardingScene` renders the room layers once; `PortalFrame` is a mask/window over them (cream wall with the arch hole drawn above the room layers). The camera push only scales/translates the existing layers and the wall, so the interior is revealed rather than swapped. Rook, glow, and foliage layers are mounted for the whole flow.

## Foreground state transitions (minor, same room)
- **Greeting → curiosity prompt**: bubble swaps text on Continue (crossfade, no new scene).
- **Prompt → topic picker** (250–400ms after a 200–300ms hold): Rook shifts slightly aside/back, scene dims/desaturates a little (not a heavy blur; faint depth-of-field at most), bubble fades, the picker UI rises in. Room stays recognizable behind it. The picker is **not assumed to be a conventional rectangular card**: it is foreground UI composed inside the room, with cream surfaces only where needed for legibility (e.g. behind chips or the CTA) and negative space preserved. The exact layout is a placeholder to be revisited once the real room art exists.
- **Picker → Sign Up**: picker fades and drifts down slightly; Sign Up appears in its place; room gets quieter. No slide.

## Reduce Motion
Use `useReducedMotion()` (already used in `FactCard.tsx`) and the existing `ReduceMotion.System` convention. With it on: tap → portal scales ~3–5% with a crossfade into the interior, Rook appears at the interior position, bubble appears, later steps are plain crossfades over the same room. Idle loops reduced to near-static; no camera push, no parallax.

## Idle life (this pass)
**Near stillness is the goal; the spec's values are ceilings, not targets.** Rook spends most of the time at rest: breathing is almost imperceptible (sub-1px / <1% scale), and there is no continuous tilt or sway. Motion happens as occasional micro-behaviours (one small tilt or weight shift every several seconds, randomized) separated by long rests. Glow: very slight pulse (≤2%). One foliage layer: ≤1px sway. No particles. Blink and eye glance are wired as `RookRig` inputs on a randomized scheduler (4–8s blink, glance every few seconds) but are no-ops on the PNG until the Rive rig exists. All idle amplitudes live in one constants block so they can be tuned down further.

## Responsiveness
`useWindowDimensions` + `useSafeAreaInsets`. Portal width ≈72% of screen (clamped), top ≈8–11% below the safe area, height ≈42–48% of usable height and allowed to shrink on short screens. Headline + CTA move up as a group instead of stretching; CTA never drops below 44pt. Verify at small iPhone, large Pro Max, and a tall Android ratio via browser-pane viewport emulation.

## Accessibility / analytics
CTA label "Get started", Rook and scene layers hidden from the accessibility tree, contrast on cream/aubergine checked, large text doesn't overlap the CTA. Fire `welcome_screen_viewed` / `welcome_get_started_pressed` through the existing `src/lib/analytics.ts`.

## After this pass: stop adding features
Once the architecture runs end to end, this phase is done. Next phases are production art (the 7 layers, matching perspective/lighting/palette/Rook proportions) and the Rive rig. Do not polish placeholder art into pseudo-final assets; the code's goal is to reach "give me the assets."

## Out of scope for this pass
Final PNG art, the Rive file/rig, sound, Android-specific polish beyond layout checks, any change to account/auth logic.

## Verification
1. `npx tsc --noEmit` is clean.
2. Browser pane at 375×812, 430×932, and a short 360×640: the Welcome layout (portal ≈72% wide, tight headline, CTA ≈40px under it, no dead zone, no settings gear), then tap Get started and step through the full timeline with screenshots at ~0/400/800/1200/1750 ms, checking the cream wall leaves the viewport and the interior persists.
3. Greeting bubble → Continue → curiosity prompt → topic picker (room visible, not heavily blurred) → pick 3 topics → Sign Up → feed. Confirm topics are in `spark-store` before Sign Up and `onboardingComplete` only flips at the end.
4. Reduce Motion (emulate via `prefers-reduced-motion`): simplified scale/crossfade, no push.
5. Double-tap / tap during entrance doesn't double-fire the timeline.
6. Settings → Reset onboarding replays the whole flow from Welcome.
6b. Interruption: reload the page / background-and-resume mid-`entering`, `rookGreeting`, topics, and Sign Up; confirm each lands in a valid phase (welcome after reload, snapped greeting after resume during entering) and never gets stuck.
7. On the phone over the tunnel: the web pane can't verify haptics, native feel, or 60fps, so confirm those on the iPhone.
