# Spark Welcome Screen Specification

## Creative direction

The approved welcome direction is **The Quiet Curiosity Nook**.

The screen should feel like opening a beautifully designed book in a peaceful room during warm evening light. The experience is comforting and reflective while remaining credible as a serious consumer product.

The composition should resemble a premium editorial cover adapted to mobile rather than a standard gamified education screen.

## Exact copy

The only product copy below the mobile status bar is:

> Find your Spark.

> GET STARTED

Do not include a subtitle, app description, account message, login link, secondary action, progress dots, or top wordmark.

## Canvas

- Portrait mobile layout
- Reference aspect ratio: 9:19.5
- Design against current iPhone and common Android safe areas
- Full-bleed product surface
- No device frame inside the app

## Background

Use a premium warm paper surface:

- Base: `#F6F1E8`
- Optional tonal variation: less than 3 percent
- No visible noise at normal phone size
- No pure white background

The paper surface should feel warm and tactile without looking vintage or textured like stationery.

## Architectural arch

The arch is Spark’s primary visual device for this screen.

- Position in the upper half
- Width: approximately 86 percent of screen width
- Height: approximately 46 to 48 percent of screen height
- Horizontal margin: approximately 7 percent
- Border: muted deep plum, approximately `#3D2A4D`
- Border width: approximately 3 percent of arch width
- Flat ledge at the bottom
- Soft semicircular upper shape
- Minimal geometry

### Arch interior

Use a quiet vertical color transition:

- Upper interior: dusty lavender
- Middle: muted mauve
- Lower interior: warm cream

Add soft angled window-light shapes on the right side. They must resemble natural evening light rather than magic, stars, or a portal.

## Rook placement

- Place Rook on the lower ledge inside the arch
- Position slightly left of center
- Character height: approximately 24 to 28 percent of total screen height
- Preserve generous empty space around the character
- Rook must remain visually separate from the arch border
- Ground the feet naturally on the ledge

## Headline

- Left-align with the arch’s left edge
- Place below the arch with generous breathing room
- Text: `Find your Spark.`
- Use a clean humanist sans-serif for `Find your`
- Use a refined high-contrast serif for `Spark.`
- Color: deep charcoal plum, approximately `#2D2431`
- Maintain strong contrast against the paper surface
- Avoid bubbly, rounded, juvenile display fonts
- Avoid an excessively large headline

The different type styles should feel editorial and intentional. They should not look like two unrelated fonts.

## Primary button

- Text: `GET STARTED`
- Align to the same left and right margins as the arch
- Place near the bottom safe area
- Fill: deep muted plum, approximately `#4E3563`
- Text: warm ivory, approximately `#FFF5DD`
- Corner radius: medium, approximately 12 to 16 pixels at standard phone scale
- Height: approximately 56 to 62 pixels
- Add a restrained darker lower edge for tactile depth
- Avoid gradients, glow, gloss, and fully rounded pill geometry

The button must be immediately usable while the entrance animation plays.

## Spacing hierarchy

1. Generous space beneath the status bar
2. Arch dominates the upper half
3. Clear separation between arch and headline
4. Headline occupies the middle-lower region
5. Large calm gap before the button
6. Button remains comfortably above the home indicator

## Visual exclusions

- No floating stars
- No spark icons
- No constellations
- No particles
- No magical glow
- No books or classroom imagery
- No streaks, trophies, coins, badges, or levels
- No gradients on the button
- No card stack
- No additional navigation
- No oversized centered mascot
- No giant bubbly headline
- No bright green
- No Duolingo layout imitation

## Responsive behavior

- Preserve the arch’s proportions across small and large phones
- Keep Rook fully inside the arch
- Scale the headline fluidly while preserving its line break
- Maintain a minimum 44-point interactive button height
- Respect platform safe-area insets
- Avoid content clipping with large accessibility text settings
- If text scaling forces reflow, reduce decorative spacing before reducing type readability

## Static acceptance criteria

- The screen feels complete with animation disabled
- Rook is recognizable immediately
- The mood is calm and intelligent
- Only the required copy appears
- The button is visually dominant as the action
- Typography is legible and editorial
- Nothing resembles a game reward screen

