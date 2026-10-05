# Spark Final Onboarding Package

This is the approved handoff package for Spark’s welcome screen and Rook the raven. It contains only the finished direction and the information required to reproduce, animate, and implement it.

## Approved direction

- **Product mood:** Quiet curiosity
- **Mascot:** Rook the raven
- **Welcome environment:** Warm architectural reading nook
- **Headline:** `Find your Spark.`
- **Primary action:** `GET STARTED`
- **Visual tone:** Comforting, reflective, intelligent, and premium
- **Animation tone:** Subtle, natural, and nearly subconscious

## Package contents

| File | Purpose |
|---|---|
| `README.md` | Package overview and decision summary |
| `01-rook-character-spec.md` | Definitive character model and personality rules |
| `02-onboarding-screen-spec.md` | Exact visual and layout specification for the welcome screen |
| `03-animation-spec.md` | Entrance, idle, interaction, and reduced-motion behavior |
| `04-implementation-handoff.md` | React Native and Rive production guidance |
| `05-rook-generation-prompt.md` | Canonical prompt for recreating the approved Rook direction |
| `assets/final-onboarding-reference.png` | Approved still image and primary visual reference |
| `assets/rook-transparent-reference.png` | Isolated Rook reference asset |
| `prototype/onboarding-animation.html` | Interactive motion prototype |

## Source of truth

The primary visual source is `assets/final-onboarding-reference.png`. Written specifications clarify the intended design when image-generation artifacts or implementation differences appear.

The following decisions are locked unless user testing provides evidence to change them:

1. Rook remains a purple raven.
2. Rook has no star, spark, or emblem printed on the body.
3. The architectural arch remains the primary environmental device.
4. The screen contains only the headline and one primary button below the status bar.
5. Motion stays quiet and restrained.
6. The screen must remain usable when animation is disabled.

## Acceptance test

The completed screen should pass these questions:

- Does Rook feel like a calm companion rather than a performer?
- Does the screen feel appropriate for teenagers and adults?
- Is the headline readable immediately?
- Is the Get Started action unmistakable?
- Does the motion remain secondary to the message?
- Would the screen still look complete as a static image?
- Can Rook be recognized from silhouette, tuft, eyebrow feather, beak, and proportions alone?

