# Rook Welcome Animation Specification

## Motion principle

Animation should make Rook feel alive without calling attention to itself. Every movement must support comfort, attention, or causality.

If a user consciously notices the idle loop repeating, the motion is too strong.

## Entrance sequence

Total duration: approximately 1.4 seconds.

### Timing

| Time | Action |
|---|---|
| 0 to 0.85 s | Arch fades in and rises approximately 8 px |
| 0.35 to 1.25 s | Window light fades in |
| 0.48 to 1.40 s | Rook rises approximately 8 px and settles |
| 0.90 to 1.40 s | Headline and button appear with restrained upward motion |

### Rook entrance

- Begin with eyes closed or nearly closed
- Open eyes toward the user during the settle
- Let the crown tuft lag by approximately 100 ms
- Use one soft ease-out curve
- Do not overshoot or bounce

The Get Started button must accept taps throughout the animation.

## Idle breathing

Cycle length: 4.5 to 5 seconds.

- Chest expands approximately 1.5 percent
- Shoulders rise approximately 2 px
- Belly expands slightly
- Head counter-moves enough to remain visually stable
- Return smoothly to rest
- Include a short resting plateau before the next breath

Do not scale the entire character uniformly. Production animation should deform the chest and body layers separately.

## Blinking

- Random interval: 4 to 8 seconds
- Blink duration: approximately 160 ms
- Occasional double blink: approximately 20 percent probability
- Delay between double blinks: approximately 220 to 280 ms
- Pause automatic blink scheduling during other facial states

Blinking must use eyelid layers. Do not shrink the eyes vertically.

## Curiosity glance

Trigger once approximately 3 seconds after entrance completion.

Sequence:

1. Pupils move toward the headline.
2. Head tilts approximately 2 degrees.
3. Raised eyebrow feather lifts by 1 to 2 degrees.
4. Hold for approximately 350 ms.
5. Pupils return to the user.
6. Head and eyebrow feather settle.

Total duration: approximately 1.1 to 1.3 seconds.

Do not repeat the curiosity glance frequently during the same visit.

## Feather follow-through

- Crown tuft trails head rotation by approximately 100 ms
- Wing tips settle slightly after body movement
- Eyebrow feather reacts during the curiosity glance
- Tail may compress by 1 or 2 px during the button response
- No elastic bouncing

## Window light

Cycle length: 12 to 16 seconds.

- Horizontal movement: approximately 1 percent
- Brightness range: no more than 3 percent
- Use a slow ease-in-out curve
- Preserve text and character contrast

The light represents natural evening light. Do not pulse or glow.

## Optional resting adjustment

Interval: 10 to 15 seconds.

- One wing shifts approximately 2 to 3 px
- Feather group compresses slightly
- Rook settles into the ledge
- Total duration: approximately 700 to 900 ms

Do not trigger this movement during the curiosity glance or button response.

## Get Started response

Trigger immediately on button press.

Sequence:

1. Button depresses by approximately 3 to 4 px.
2. Rook nods by approximately 3 degrees.
3. Body compresses vertically by less than 1 percent.
4. Wings draw inward slightly.
5. Window light warms subtly.
6. Navigation begins after approximately 300 ms.

The response confirms the interaction without delaying the user.

## State priority

Use this priority order:

1. Reduced motion
2. Button response
3. Entrance
4. Curiosity glance
5. Blink
6. Resting adjustment
7. Breathing

Higher-priority states should interrupt or temporarily suppress lower-priority states.

## Reduced motion

When reduced motion is enabled:

- Render the completed static state immediately
- Disable breathing
- Disable curiosity glance
- Disable moving window light
- Keep a standard button press state
- Allow normal navigation without delay

## Motion exclusions

- No bouncing
- No floating
- No waving
- No jumping
- No confetti
- No sparkle effects
- No pulsing button
- No exaggerated squash and stretch
- No repeated head tilts
- No guilt reaction when the user leaves
- No continuous motion in every layer

## Prototype limitations

The included HTML prototype uses a raster Rook asset and approximates breathing, blinking, tilting, light movement, and button response. It demonstrates timing and mood, not final character rig quality.

The production version must use separated vector layers so pupils, eyelids, feathers, wings, body, and light can move independently.

