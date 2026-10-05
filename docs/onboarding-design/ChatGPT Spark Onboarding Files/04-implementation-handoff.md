# Production Implementation Handoff

## Recommended stack

- React Native with Expo
- Rive for the production character rig and state machine
- Native safe-area handling
- Platform accessibility APIs for reduced motion
- Local bundled animation asset so onboarding does not depend on the network

Lottie is acceptable only if the screen uses a fixed entrance and idle loop. Rive is preferred because Rook should react to button presses and application state.

## Asset structure

Create a layered vector Rook source with these independent groups:

1. Shadow
2. Tail
3. Rear wing
4. Body
5. Belly
6. Front wing
7. Head
8. Left eye white
9. Left pupil
10. Left eyelid
11. Right eye white
12. Right pupil
13. Right eyelid
14. Beak upper section
15. Beak lower section
16. Standard eyebrow feather
17. Raised lavender eyebrow feather
18. Crown tuft rear feather
19. Crown tuft center feather
20. Crown tuft front feather
21. Feet

Keep the architectural arch, window light, headline, and button in the native UI layer. Do not bake the complete screen into one animation file.

## Rive state machine

Recommended animation states:

- `enter`
- `idle`
- `blink`
- `double_blink`
- `curiosity_glance`
- `resting_adjustment`
- `button_response`
- `reduced_motion`

Recommended inputs:

| Input | Type | Purpose |
|---|---|---|
| `screen_loaded` | Trigger | Starts entrance |
| `blink` | Trigger | Plays one blink |
| `double_blink` | Trigger | Plays double blink |
| `curiosity_glance` | Trigger | Looks toward headline and back |
| `resting_adjustment` | Trigger | Plays rare wing adjustment |
| `get_started_pressed` | Trigger | Plays confirmation response |
| `reduce_motion` | Boolean | Disables nonessential movement |

The application should schedule random blink intervals rather than baking a visibly repeating blink pattern into the animation timeline.

## Component responsibilities

### Native UI

- Safe areas
- Background paper color
- Architectural arch
- Window-light overlay
- Headline
- Get Started button
- Accessibility labels
- Navigation
- Analytics events

### Rive asset

- Rook entrance
- Breathing
- Blinking
- Eye movement
- Head tilt
- Feather follow-through
- Wing adjustment
- Button response

## Suggested React Native structure

```text
WelcomeScreen
├── SafeAreaView
├── WelcomeArch
│   ├── WindowLight
│   └── RookAnimation
├── WelcomeHeadline
├── GetStartedButton
└── HomeIndicator handled by the operating system
```

## Interaction behavior

1. Mount the screen.
2. Read the platform reduced-motion preference.
3. Load the bundled Rive asset.
4. If animation is enabled, trigger `screen_loaded`.
5. Schedule the first curiosity glance after the entrance completes.
6. Schedule randomized blinks between 4 and 8 seconds.
7. Pause timers when the app enters the background.
8. On button press, record the interaction immediately.
9. Trigger `get_started_pressed`.
10. Navigate after approximately 300 ms, or immediately when reduced motion is enabled.

## Accessibility

- Button accessibility label: `Get started`
- Rook should be decorative unless it performs an interactive function
- If decorative, hide Rook from the accessibility tree
- Preserve contrast between headline and background
- Maintain at least a 44-point button height
- Support large text without covering the button
- Respect reduced motion
- Do not require animation to understand the screen

## Analytics

Recommended events:

### `welcome_screen_viewed`

Properties:

- `animation_enabled`
- `platform`
- `app_version`
- `onboarding_version`

### `welcome_get_started_pressed`

Properties:

- `time_on_screen_ms`
- `animation_completed`
- `onboarding_version`

Do not collect personal information on this screen.

## Performance requirements

- Bundle all critical onboarding assets locally
- Avoid blocking the screen on network requests
- Keep animation at a smooth 60 frames per second on supported devices
- Keep the animation asset small enough for fast cold startup
- Pause Rive when the screen is no longer visible
- Avoid rendering large full-screen raster animations

## QA checklist

- Verify small iPhone layout
- Verify large iPhone layout
- Verify common Android aspect ratios
- Verify safe areas and display cutouts
- Verify light and dark system status-bar behavior
- Verify large text settings
- Verify VoiceOver and TalkBack
- Verify reduced motion
- Verify background and foreground transitions
- Verify rapid repeated button taps
- Verify button works before the entrance completes
- Verify no loop seams are visible
- Verify Rook’s eyes and eyelids align at every frame

