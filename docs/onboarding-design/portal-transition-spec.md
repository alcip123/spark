# Spark Onboarding Screen 1: Production Design Specification

> Source: written by the product owner (relayed from a design-review conversation) and given to Claude as the
> hyper-detailed brief for the welcome/portal redesign. Saved here verbatim-in-substance so the repo carries the
> source of truth. The mockup it refers to is `portal-redesign-mockup.webp` in this folder. The pixel/percent/ms
> numbers are **starting values**, not immutable (the spec says so itself: "Optical balance takes priority").

## 1. Core objective

This screen is not simply a welcome page. It is the entrance to the world of Spark.

The user should feel three things within the first 2 to 3 seconds: **curiosity → warmth → desire to enter.**

Communicate almost nothing explicitly. Do not add descriptions of Spark, feature lists, account information,
onboarding explanations, progress indicators, or marketing copy. The only primary copy remains:

```
Find your
Spark.
```

The visual storytelling does the rest. The design language should feel: premium, warm, intelligent, magical, calm,
sophisticated, slightly whimsical, tactile, dimensional, and alive. It must specifically avoid feeling: childish,
educational-app generic, overly gamified, corporate, flat, cluttered, neon, fantasy-game-like, or like a Duolingo
imitation.

## 2. Overall composition

A vertical composition with four zones: status bar, the portal/window containing Rook and the Spark world, the
headline, the CTA, then the home indicator.

The four visual priorities, in order: **1. the portal/window, 2. Rook, 3. "Find your Spark.", 4. Get started.**
Nothing else should compete with them.

## 3. Background

Use the existing warm off-white/cream identity rather than pure white. Target approximately `#F7F2E8`; do not use that
value blindly — test it against the final illustration and adjust slightly warmer or cooler. It should feel like warm
paper, ivory, or a softly illuminated wall.

Do not use: pure `#FFFFFF`, visible gradients across the whole screen, textures, noise, decorative stars, floating
particles outside the portal, background patterns.

Restraint outside the window is critical because it increases the perceived richness inside it.
**Outside Spark = calm. Inside Spark = discovery.** That contrast becomes part of the brand.

## 4. The arched portal

The most important structural redesign. The existing window feels like a flat illustration container; it should feel
like an actual portal into another space.

- **Shape:** retain the tall arched geometry. The arch should eventually become a recurring Spark brand motif meaning
  "there is something interesting on the other side."
- **Size:** approximately 68–76% of screen width — noticeably narrower than the previous implementation, with generous
  cream negative space around it.
- **Top position:** approximately 8–11% below the top safe area.
- **Height:** approximately 42–48% of usable screen height.

## 5. Portal frame

Replace the thick purple outline with a more sophisticated architectural frame, in layers:
cream wall → subtle outer shadow → outer portal frame → inner bevel/recess → interior world.

Outer frame: dark aubergine/brown-purple rather than black, approximately `#382644`. Substantially thinner than before.
Extremely subtle dimensional shading so the portal appears recessed into the wall. No glossy plastic border. Think:
crafted architectural opening, not mobile-game frame.

## 6. Remove the giant glass reflection

The large translucent diagonal polygon must go (crude, makes the window look like a flat vector). If any glass
reflection remains: one soft highlight near the upper curve, ~4–8% opacity, blurred, irregular, barely noticeable.
The user should perceive depth before they consciously perceive "glass."

## 7. Build an actual world behind Rook

The biggest visual upgrade. Rook should no longer sit against an empty lavender gradient. Do not create an obvious
classroom/library/study room. Avoid cliché intelligence symbols: stacks of books, globes, telescopes, microscopes,
equations, graduation caps, light bulbs, chess pieces. Spark is about curiosity, not school.

Create a mysterious, warm interior with extremely subtle suggestions of: an archway deeper into the room,
indistinct shelving, warm pools of light, organic plants, interesting silhouettes, soft architectural shapes, a
distant glowing object. Most background elements stay deliberately indistinct. The user should think
"What's in there?" — not "That's a library."

## 8. Interior lighting

Palette: dusty lavender, aubergine, warm peach, muted violet, soft cream, subtle golden warmth. Avoid aggressive
saturation. Depth through foreground / middle ground / background separation:

- Foreground: darker, slightly sharper.
- Rook plane: brightest and clearest.
- Background: softer, more atmospheric, slightly blurred.

A warm light source from one side, a mysterious violet glow deeper inside — tension between comfort and curiosity.

## 9. Introduce one "Spark"

One extremely restrained glowing object deeper inside. Not a literal star, not a light bulb, not a fantasy orb
dominating the composition. Something ambiguous: a small violet/lilac glow. It gives Rook something to notice during
the transition and should only be noticed after looking for a moment — a miniature curiosity loop: sees Rook → notices
Rook may be interested in something → notices the glow → taps Get started.

## 10. Rook must become substantially larger

Increase his visual scale ~50–80% relative to the previous implementation. Face readable instantly (eyes, pupils,
eyebrows, beak, head tilt, wing positioning, body language). Not gigantic, but unquestionably the protagonist.

## 11. Rook positioning

Do not perfectly center him (perfect centering makes him look like an asset placed in a frame). Slightly off-center,
e.g. ~43% horizontal. Feet grounded on the architectural ledge/floor. A very soft shadow on the surface — it says
"Rook exists inside this place," not "this is a transparent PNG."

## 12. Rook's pose

Faces the user, welcoming but curious: slight head tilt, open eyes, very subtle smile, relaxed wings, slightly
asymmetrical posture. Avoid: giant grin, aggressive waving, exaggerated excitement, superhero pose, jumping, pointing
at the CTA. He should feel like he was already doing something interesting and has just noticed the user arrived.

## 13. Rook's rendering style

Maintain the current dimensional cartoon direction; do not flatten him into a vector mascot. Bring the rest of the
illustration language closer to Rook. He retains dimensional feathers, soft highlights, large expressive eyes, subtle
material variation, rounded forms, gentle shadowing — but not full Pixar/Disney realism; he must still work as an app
mascot at small sizes.

## 14. Headline positioning

Move the headline considerably closer to the portal — one composition. Start 24–36 px beneath the portal, then adjust
optically.

## 15. Headline typography

Keep "Find your" / "Spark." Do not change the copy. Do not add a subtitle ("Discover the world around you", "Learn
something new every day" are explicitly rejected). Mystery is more valuable.

- "Find your": primary sans-serif, Regular or Medium, not bold — conversational and quiet.
- "Spark.": the distinctive editorial serif, Bold/Semibold depending on typeface. This is the brand moment.

## 16. Tighten headline spacing

The relationship between the two lines was too loose. Bring them together (≈0–6 px perceived separation depending on
font metrics). They read as one statement, not a heading and subheading.

## 17. Reduce the size of "Spark." slightly

Reduce ~10–15% from the previous perceived scale. Hierarchy: 1. Rook / portal, 2. Spark., 3. Get started, 4. Find your.

## 18. Fix the enormous dead zone

The huge empty area between headline and CTA must disappear. Move the CTA significantly upward: ~32–48 px below the
headline (depending on device height). On taller devices do not stretch the space; maintain proportional grouping —
`Find your / Spark. / [Get started →]` is one compositional unit.

## 19. Redesign the CTA

Previous button: too heavy, too tall, too game-like, excessive black shadow, all-caps aggressive, generic giant
capsule. Replace it.

- Copy: `GET STARTED` → `Get started`
- Background: deep aubergine/purple, ~`#523669` (test against palette)
- Text: warm cream, ~`#FFF8E9`
- Shape: rounded corners, not the exaggerated capsule; radius ~22–28 px
- Height: ~56–62 px
- Width: ~78–84% of screen width, or aligned to the content grid

## 20. Remove the black button shadow

Delete the hard black offset shadow. Replace with subtle elevation (≈ x 0, y 6, blur 18, opacity 10–14%), potentially
a very subtle purple ambient glow. The button feels tactile; the user doesn't consciously notice a shadow.

## 21. Add a subtle arrow

A small right-facing arrow after the label: `Get started →`. Visually subordinate to the text. It suggests entering
rather than submitting.

## 22. Remove the settings gear

The blue settings gear cannot appear on this screen (fine only if it's a debug overlay). Zero secondary navigation:
no settings, hamburger, skip, login, help, profile, or back button. The first screen has one decision: Enter Spark.

## 23. The screen should already be alive before interaction

Do not wait for the tap. Rook has an extremely subtle idle animation — living character, not animated mascot. Idle
loop ~6–10 s and intentionally irregular. Possible behaviors: chest moves 1–2 px (breathing), tiny feather movement,
occasional blink, pupils shift slightly, tiny head tilt, very subtle weight shift. Do not synchronize everything; real
characters don't blink on an exact 4 s cycle — introduce randomness.

> Later product-owner amendment: keep idle motion **substantially quieter** than these maximums. Most of the time Rook
> should appear nearly still; motion occurs as occasional micro-behaviors separated by rest. No continuous
> bobbing/swaying.

## 24. Rook eye behavior

Rook occasionally glances toward the mysterious glow. Example: 0.0 s looking at user; 2.8 s eyes subtly move right;
3.1 s head follows by 3–5°; 3.8 s blink; 4.2 s eyes return toward user. It communicates that Rook knows there's
something interesting in there, without saying anything.

## 25. Environmental animation

Microscopic only: distant glow pulses 2–4%, a plant leaf moves 1–2 px, extremely subtle atmospheric dust, almost
imperceptible lighting shifts. No dozens of floating spark particles (that is generic fantasy UI).

## 26. CTA interaction

Touch-down responds instantly: 80–120 ms, scale 1.00 → 0.98, shadow decreases slightly, optional light haptic.
Release returns toward 1.00, but the transition begins before it fully settles — physically responsive.

## 27. The transition is the centerpiece

Do not navigate to Screen 2 with a fade, slide-left, standard React Navigation transition, dissolve, or hard cut.
**The portal itself becomes the navigation mechanism.** The user should literally enter Spark.

## 28. Transition choreography

~1.5–2.0 s total: cinematic but fast enough not to annoy.

| t (ms) | Beat |
|---|---|
| 0 | User taps Get started. Haptic. Button compresses. |
| 100 | Rook's pupils move toward the mysterious glow. |
| 180 | Rook's head turns slightly toward it. |
| 250 | Headline begins fading. |
| 300 | CTA begins fading while moving ~8–12 px down. |
| 400 | Rook turns his body toward the interior. |
| 500 | Rook makes a tiny hop/step forward (not a giant cartoon leap). |
| 600 | Camera movement begins; the entire portal scales toward the user. |
| 800 | Portal frame begins extending beyond the display; the cream exterior begins disappearing. |
| 1000 | Camera passes through the arch; ~80–90% of the display is the interior world. |
| 1200 | Portal frame disappears completely beyond the viewport; the user is visually inside Spark. |
| 1350 | Camera movement decelerates (smooth cinematic easing). |
| 1500 | Rook reaches his new position. |
| 1650 | Rook turns back toward the user. |
| 1750 | Speech bubble animates in. |

## 29. First dialogue

Rook says: **"Hey there, I'm Rook!"** Do not immediately present another paragraph; give the user a moment. Provide a
clear Continue interaction. On continue: **"Before we find your Spark, what are you curious about?"** then interest
selection. Narrative structure: Arrival → introduction → curiosity → personalization.

## 30. Make the camera transition spatially correct

The transition cannot simply scale a screenshot. It should feel like the camera itself approaches the portal:
the portal frame expands outward; perspective changes slightly; Rook moves relative to the background; foreground
elements move faster than background; background has subtle parallax; depth layers separate. Even very small
parallax massively improves perceived quality. Starting values: foreground foliage 1.15× movement, Rook plane 1.0×,
background architecture 0.75×, distant glow 0.60×. (These are conceptual starting values — tune once art exists;
optical depth is the requirement.)

## 31. Do not make Screen 2 visually unrelated

The interior seen through the window on Screen 1 must literally become the environment on Screen 2. Do not fake it by
showing one illustration through the window and loading another purple background afterward. The user should
recognize: "I'm now standing in the place I was looking at." That continuity is the entire magic trick.

## 32. Preserve the mysterious glowing object

Once inside, the glow can become a recurring narrative device (perhaps Rook investigates it; perhaps it represents
the user's first discovered Spark). Don't explain it immediately.

## 33. Speech bubble design

Not a comic-book bubble. Warm cream surface slightly lighter than the environment, large rounded corners, soft
shadow, dark aubergine type, potentially a tiny tail toward Rook. No giant black border, no purple outline, no
excessive bounce. Appears with opacity 0 → 1 and scale 0.96 → 1.00 over ~200–280 ms.

## 34. Motion philosophy

Every animation must answer one of three questions: Does this establish **character**? Does this establish **depth**?
Does this communicate **navigation**? If no, remove it. Do not animate because animation looks cool. The best
animation makes the interface feel alive without the user thinking "wow, lots of animations."

## 35. Haptics

Extremely sparing. One subtle/light haptic when Get started is tapped; potentially another extremely subtle one when
the camera finishes entering the room. Nothing else. Haptics punctuate meaningful moments.

## 36. Sound

If Spark eventually uses sound: extremely restrained sonic identity; respects device settings; never blasts music.
Possible: a tiny soft chime when the glow appears, extremely quiet movement sound during the transition, a subtle
arrival sound. No cartoon bird noises, no chirping, no fantasy soundtrack. Silence beats bad sound design.

## 37. Accessibility

"Reduce Motion" must have an alternate experience: tap Get started → portal subtly scales ~3–5% → crossfade into the
interior → Rook appears in the corresponding location → speech bubble appears. No full camera movement. Also ensure:
CTA contrast passes accessibility standards; text supports scaling; tap target ≥ 44 pt; Rook animation doesn't
communicate required information; onboarding is understandable without animation.

## 38. Device adaptation

Not designed for one iPhone screenshot. Must adapt across smaller iPhones, large Pro Max devices, Android aspect
ratios, and different safe areas. Use proportional constraints. The portal can shrink slightly on shorter screens; the
headline/CTA group moves upward rather than disappearing below the fold. Never reduce the CTA below an accessible touch
size to preserve the illustration.

## 39. The brand principle

The ordinary world exists outside the window. Spark exists inside it.

- Outside: cream, quiet, simple, flat, calm.
- Inside: dimensional, purple, warm, alive, mysterious, rich.

That contrast is not decoration — it is Spark's brand metaphor: the user enters Spark to discover what's behind the
obvious surface of things.

## 40. What absolutely should NOT be added

Floating stars; dozens of glowing particles; feature descriptions; "Learn something new every day"; progress dots on
Screen 1; a Skip button; account creation; a login button; random cards floating behind Rook; badges; streaks; XP;
obvious educational objects; neon gradients; glassmorphism everywhere; excessive blur; giant shadows; multiple CTA
buttons; decorative icons; mascot speech on the first screen; unnecessary animations.

The sophistication comes from restraint plus extraordinary execution.

## Final target

Open app → notice beautiful portal → meet Rook visually → notice something mysterious behind him → read
"Find your Spark." → become curious → tap → Rook reacts to your touch → follows the mysterious object → camera
physically enters the portal → exterior world disappears → arrive inside the environment you were previously looking at
→ Rook turns around → "Hey there, I'm Rook!"

**Do not treat Screen 1 and Screen 2 as separate screens. Treat them as two camera positions inside one continuous
scene.**
