# HANDOFF — Spark onboarding (portal → Rook) checkpoint

Written at the checkpoint commit `checkpoint: sonnet onboarding implementation` (branch `tiktok-rook`) for the next
engineer/model. **The current onboarding implementation is NOT visually approved.** It was built to prove the
architecture and the choreography with placeholder art. Audit it; do not assume it is correct, and do not preserve
something just because it exists. Known problems and hypotheses are kept apart below — nothing in "Hypotheses" was
profiled.

Read first: `CLAUDE.md`, `AGENTS.md` (Expo has changed — read the versioned docs), `PRODUCT.md`, `DESIGN.md`.

## 1. Intended experience (the goal)

Onboarding is **one persistent spatial scene viewed from different camera positions**, not a sequence of screens.

1. Cream wall, calm. A tall arched portal containing Rook (purple raven) in a mysterious warm room, with a small
   ambiguous violet glow deeper inside. Headline "Find your / Spark.", one button "Get started →". Nothing else.
2. Tap → Rook notices the glow, headline/CTA fade, Rook hops, the camera pushes through the arch (frame scales past the
   viewport, cream disappears, parallax between depth layers), Rook settles and turns back.
3. Inside the *same* room Rook says "Hey there, I'm Rook!" → Continue → "Before we find your Spark, what are you
   curious about?" → topic picker (foreground UI over the dimmed room, **not** a modal card) → Sign Up → feed.
4. The portal move happens **once**. Later steps are foreground UI changes over the persistent room (opacity, small
   drift, dimming) — never a slide, never a second dramatic transition.

Rule of thumb from the owner: *big conceptual change = camera movement; small conversational change = interface changes
around the user.* Motion must establish character, depth, or navigation — otherwise remove it. Restraint over spectacle.

Source documents (all in this repo):
- `docs/onboarding-design/portal-transition-spec.md` — the 40-section production spec (verbatim-in-substance). Numbers are
  starting values.
- `docs/onboarding-design/portal-redesign-mockup.webp` — the target mock (before/after + the 4-frame transition).
- `docs/onboarding-design/ChatGPT Spark Onboarding Files/` — the earlier approved package (Rook character spec, animation
  spec, Rive handoff, generation prompt, HTML motion prototype). Note it predates the portal redesign; where they
  conflict, the portal spec wins.
- `docs/onboarding-design/approved-implementation-plan.md` — the plan this implementation followed.
- Other files in that folder (`concepts.html`, `visual-directions.html`, screenshots, the zip) are earlier exploration.

## 2. Product decisions already made (don't relitigate without the owner)

- **Flow order:** `welcome → entering → rookGreeting → curiosityPrompt → topicSelection → signUp → (complete)`.
  Sign Up moved *after* topics (Rook's question needs an immediate behavioural answer; account creation comes after
  personalization). Sign Up is kept, not removed. Topics persist to the store before Sign Up.
- **Art is generated separately** as 7 independent transparent layers (see §5). Don't crop the mockup; don't try to draw
  final art in SVG.
- **Rook = Rive** in production (recurring character). For now `rook.png` is a stand-in; never fake eye movement,
  blink, wing articulation, or a body turn by distorting the PNG. Spark must boot without Rive.
- **Georgia is a placeholder** display face, not the approved typeface; keep it behind a token (`displayType`).
- **Idle motion must be near-still.** Occasional micro-behaviours with long rests; no continuous bobbing.
- **Placeholders are not the visual benchmark.** After the architecture works: stop adding features, go make art.

## 3. Current architecture

State machine (`OnboardingPhase`, in `App.tsx`, in-memory only — a cold start/reload always begins at `welcome`):

```
welcome → entering → rookGreeting → curiosityPrompt → topicSelection → signUp → feed (onboardingComplete = true)
```

- `OnboardingScreen` (topic picker) only calls `setPreferredCategories`; `onboardingComplete` flips when Sign Up
  finishes (`App.tsx` `onComplete`).
- Reset for design work: Settings → DEVELOPER → "Reset onboarding" (dev-only, `__DEV__`).

Scene layering (`src/onboarding/OnboardingScene.tsx`), back to front:

```
root bg (plum) → background → glow → midground → Rook → [portal wall + frame] → foreground foliage L/R
              → plum dim overlay → cream wash overlay → Reduce-Motion veil → foreground UI
```

- The room layers are mounted once for the whole flow. The portal is a **cream wall with an arch-shaped hole** drawn
  above them, so the interior seen through the arch is the same live layer stack that fills the screen after the push
  (no preview swap).
- Camera = one shared value `camera` 0→1 (`useWelcomeTimeline`). Each room layer's transform is
  `roomLayerTransform(camera, geometry, depth)`: scale goes `k0 → 1+depth*0.3` geometrically (k0 shrinks the room to fit
  the portal), translate eases from "portal centre" to 0. Parallax therefore comes from **different end scales per
  depth**, not from separate translations.
- The wall scales about the arch centre by `wallScale = wallScaleMax^camera`.
- Geometry is pure/testable in `sceneGeometry.ts`. Layout numbers are the spec's starting values.
- Choreography (`useWelcomeTimeline.ts`): continuous values are Reanimated shared values; discrete beats (Rook poses,
  arrival haptic, phase advance) are **JS `setTimeout`s** tracked in a ref and cancelled on unmount/snap.
- Interruption rule: if the app resumes while `entering`, an AppState listener snaps the timeline to its end and sets
  `rookGreeting`.
- Reduce Motion: a dip-to-wall-colour crossfade (veil + small 4% nudge) replaces the push; later steps are plain fades.

## 4. Files

Created:
- `src/onboarding/sceneGeometry.ts` — layout + camera maths (pure). `scripts/check-scene-geometry.ts` asserts it
  (`npx tsx scripts/check-scene-geometry.ts`).
- `src/onboarding/sceneAssets.ts` — **the single place art is configured**: per-layer `source`, placement (fractions of
  the room box), `depth`; plus Rook's feet anchor.
- `src/onboarding/placeholders.tsx` — SVG/gradient stand-ins (see §5).
- `src/onboarding/OnboardingScene.tsx` — the scene, phase-driven foreground, Rook layer, `Rise` wrapper.
- `src/onboarding/PortalFrame.tsx` — wall with arch hole + layered frame + one faint highlight.
- `src/onboarding/useWelcomeTimeline.ts` — entrance choreography, snap, Reduce Motion variant.
- `src/onboarding/RookCharacter.tsx` — Rook abstraction (`RookPose` vocabulary, static PNG implementation, breathing /
  micro-tilt / pose reactions).
- `src/onboarding/CtaButton.tsx` — new "Get started →" button (not a change to `PopButton`).
- `src/onboarding/SpeechBubble.tsx`, `src/onboarding/haptics.ts`.

Modified for onboarding:
- `App.tsx` — phase state + `OnboardingScene` in place of the old `step` flow / `ScreenTransition`.
- `src/screens/OnboardingScreen.tsx` — now the topic-selection foreground UI (props `topInset`, `onContinue`).
- `src/screens/SignUpScreen.tsx` — `overScene` prop (transparent over the washed room).
- `src/screens/SettingsScreen.tsx` — dev-only "Reset onboarding".
- `src/theme.ts` — `onboarding` palette + `displayType` token (appended at the end).
- `src/lib/analytics.ts` — added `welcome_screen_viewed`, `welcome_get_started_pressed` event names.
- `src/screens/WelcomeScreen.tsx`, `src/components/ScreenTransition.tsx` — **no longer used**, marked `@deprecated`,
  deliberately not deleted yet.
- `package.json` / `package-lock.json` — added dev dependency `@expo/ngrok` (for `expo start --tunnel`).
- `.gitignore` — ignores `expo-qr.png`.

**Not part of the onboarding work:** the working tree also held earlier, uncommitted feed work that was committed
together with this checkpoint: `BottomDock`, `FactCard`, `FeedScreen`, `ProfileScreen`, `uiStore`, `layout.ts`, parts
of `App.tsx` (feed/dock wiring), and deletions of `ExpandedFact.tsx` and `FeedHeader.tsx`. They were not authored or
reviewed in this session. The previous commit message was "WIP backup: twitter-style feed + Rook welcome screen before
reverting to TikTok UI". Treat that code as unreviewed.

## 5. Placeholders (all of the visuals are placeholders except the mascot PNG)

- `placeholders.tsx`: gradient background, glow, ledge midground, foliage blobs — engineering stand-ins only, visibly
  crude (grey smudge blobs, flat gradient, a pill-shaped contact shadow). Delete this file when every layer has a
  `source`.
- `assets/mascot/rook.png` — stand-in for `rook-front.png`; no turn/glance/blink possible.
- `rookTurn` is registered in `sceneAssets.ts` but **unused**.
- Georgia for "Spark." (token: `displayType`).
- The topic-picker layout is a placeholder until the room art exists.

## 6. Future layered art (to be delivered by the owner)

Seven transparent PNGs go in `assets/onboarding/`; then only `sceneAssets.ts` (`source`, placement, `depth`) changes:

1. `room-background.png` — deep interior, no Rook/glow/foliage. **Must have bleed**: the arch hole grows faster than the
   room during the push, so the art needs to extend beyond the screen edges (placeholder uses x −0.25, w 1.5).
2. `room-midground.png` — environment immediately around/behind Rook (ledge etc.).
3. `rook-front.png` — large Rook facing the user.
4. `rook-turn.png` — Rook turned toward/interacting with the glow.
5. `foreground-left.png`, 6. `foreground-right.png` — foliage/depth, drawn **above** the portal frame.
7. `spark-glow.png` — isolated violet glow with transparency.

Depth order: background → distant glow → midground → Rook → portal/frame → foreground foliage → UI. Metro can't
`require` a missing file, so entries stay `undefined` until the PNG exists.

## 7. Future Rive plan

`RookCharacter.tsx` is the seam; a `RiveRook` with the same props replaces its body without touching the scene. The scene
already speaks the pose vocabulary: `idle, lookUser, lookGlow, curiousTilt, notice, turnAway, hopForward, land, turnBack,
greet, talkIdle` (ideally state-machine inputs, so behaviours blend). The Get Started beat is intended as
`idle → lookGlow → notice → turnAway → hopForward`; inside: `land → turnBack → greet → talkIdle`. Rive controls
Rook's *internal* motion only; React Native/Reanimated keeps owning the camera, parallax, layers, UI fades and Rook's
container position/scale. Rive is **not installed** (needs a dev build; breaks Expo Go) and Spark must fall back to the
static Rook if the rig/asset is unavailable. No loader/fallback switch is written yet.

Poses currently implemented on the PNG (container motion only): `notice`, `curiousTilt`, `land`, `greet`; everything else is
a no-op marked `TEMP: needs Rive rig`.

## 8. Known problems (observed)

- **Smoothness on an iPhone is "not great"** (owner's report: Expo Go over `expo start --tunnel`, dev build). Not
  quantified — no frame-time data was collected. This is the headline problem.
- On **web**, Reanimated `animatedProps` on an SVG `d` attribute did not update (measured: the frame stayed 270px wide for
  the whole push, then the wall unmounted). That is why `PortalFrame` is driven by React state (§9).
- On web, `overflow: hidden` on the scene root let a focused button scroll the whole scene; worked around with
  `overflow: clip` on web only (`OnboardingScene.tsx` styles.root).
- Placeholder art is visibly poor (see §5); there is no "world" behind Rook yet, so the visual goal is not met at all.
- Rook cannot turn/glance/blink on the PNG, so during the choreography he only hops and scales.
- After the push, the status-bar icons stay dark on the plum room (not handled).
- The curiosity prompt has both a Continue button *and* a 3.6 s auto-advance to the picker; the spec said to transition
  after a short hold. The auto-advance duration was a guess.
- On tall screens the Welcome group leaves roughly the bottom fifth empty (grouped upward by design, not tuned).
- First web load takes ~18 s to show Welcome (existing splash + hydration + reveal delay, not onboarding-specific).

## 9. Hypotheses about performance — NOT profiled, do not treat as confirmed

1. `PortalFrame` converts the camera shared value to React state with `useAnimatedReaction` → `runOnJS(setScale)` on every
   frame of the push, re-rendering an SVG whose path strings are recomputed (4 paths + a ±4000px even-odd rect). A smooth
   native animation normally shouldn't push per-frame values through React. I chose this because animatedProps on SVG
   `d` didn't update on web — i.e. I optimised for being verifiable in the browser pane, which may be the wrong trade for
   the iPhone. Native `animatedProps` on `react-native-svg` `Path` is likely worth testing on a device.
2. `setPose(...)` is called ~8 times during the entrance (JS timeouts), each re-rendering `OnboardingScene` and its
   children while the camera animates; the layers aren't memoized.
3. Six full-screen `Animated.View` layers each with its own transform, some containing large SVG placeholders
   (background is 1.5W × 1.2H); transforming rasterised SVG views may be expensive or re-rasterise.
4. Dev-mode JS, Expo Go, and the tunnel could dominate regardless of the implementation. A release/dev-client build and a
   LAN connection should be compared before attributing the jank to the code.
5. The discrete beats being JS `setTimeout`s can drift from UI-thread animations.

Suggested first step for whoever picks this up: profile (Perf Monitor / Reanimated frame data / a release or dev-client
build) before changing anything.

## 10. Implemented differently from the approved spec

- Parallax is per-layer end-scale (`DEPTH_GAIN = 0.3`: background 0, glow 0.1, midground 0.35, Rook 0.5, foreground 1.0),
  not the spec's 0.75/0.60/1.0/1.15 movement multipliers. All values are tunable starting points.
- The wall and the frame are driven via React state rather than UI-thread props (see §9).
- Rook "settle" is a translate + 6% scale; "turnAway/turnBack" are no-ops (no art/rig).
- Reduce Motion is a dip-to-wall-colour veil, not a literal crossfade; the "portal scales 3–5%" is a 4% nudge of the
  whole scene.
- The speech bubble remounts on text change (fade/scale in only; no exit crossfade).
- Idle loop is far quieter than the spec's maximums by the owner's instruction (breathe <1%, a micro-tilt every 6.5–11 s).
- Haptics fire on press (not press-in) and once more on arrival, as specced; untested on a device.
- The new CTA uses `typography.h2` sized to 18 (not the app's bold button style) and is a separate component from
  `PopButton`.

## 11. Things worth reconsidering rather than preserving

- Driving the wall via React state (§9.1) — consider native animated props, a Skia mask, or another approach that keeps the
  per-frame work off the JS/render path (note `@shopify/react-native-skia` is not installed).
- JS-timeout choreography vs a single UI-thread timeline with worklet callbacks.
- Six separately-transformed full-screen layers vs one transformed parent plus per-layer deltas.
- Oversized SVG placeholder layers (consider flat colours or pre-rendered PNGs while art is pending).
- The `overflow: clip` web cast and any other web-only accommodations — the target is iOS/Android; web is just a stand-in.
- Whether the arch hole's growth vs the room's scale (and the need for bleed art) is the best way to do the "camera passes
  through the portal" illusion.
- The prompt's auto-advance, the picker's layout (Rook-aside at the top), and the Rook-aside maths (it hand-solves the
  room→screen transform at camera 1).

## 12. Verified vs unverified

Verified (browser pane, web, 375×812 and 360×640): Welcome layout; frame/Rook sizes sampled through the push (frame ≈270px
until ~600 ms, wider than the screen by ~1000 ms, gone by ~1300 ms); full phase flow; topics saved before Sign Up and
`onboardingComplete` only flipping at the end; Reset replays from the portal; a fast double tap runs one entrance;
`tsc --noEmit` clean; geometry check passes for five device sizes.

NOT verified: anything on a real device (smoothness, haptics, 60 fps), the Reduce Motion path, the app-resume snap,
Android, 430×932, VoiceOver/TalkBack, large text.

## 13. Running it

- Web (stand-in only): `npm run web` (port 8081). Tunnel for Expo Go: `npx expo start --tunnel --port 8095`.
- Dev launch configs live in `../.claude/launch.json` (outside this repo): `spark-web` (8081) and `spark-expo` (8095, tunnel).
- Checks: `npx tsc --noEmit`, `npx tsx scripts/check-scene-geometry.ts`.
