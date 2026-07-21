@AGENTS.md

## Design Context

- `PRODUCT.md` — register (product), platform (adaptive/RN), users, positioning, brand personality, anti-references, design principles.
- `DESIGN.md` + `.impeccable/design.json` — the "Curious Notebook" visual system extracted from `src/theme.ts`: colors, typography, elevation, component specs, do's/don'ts.

Read both before any `/impeccable` command or new UI work.

## Browser Verification (Claude in Chrome)

This app is React Native/Expo targeting iOS and Android natively; `expo start --web` is used only as a stand-in for device testing when no simulator/emulator is available. Treat it as an approximation, not equivalent to native — Baskerville, haptics, native modal presentation, and real touch targets don't verify accurately on web.

To keep browser verification cheap:

- Prefer `read_page`, `get_page_text`, or a small `javascript_tool` eval (computed styles, DOM measurements, console state) over a screenshot when the question is functional ("did it navigate," "is the value set," "did the click register").
- Reserve screenshots for genuine visual/design verification — layout, spacing, color, motion, matching a reference image.
- Batch read-only checks (multiple screenshots, reads, finds) into one `browser_batch` call instead of sequential individual calls.
