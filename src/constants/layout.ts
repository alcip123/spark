// Single source for the bottom bar's geometry, shared with BottomDock so its
// visual footprint and the space other screens reserve for it can never drift
// apart the way they previously did (DOCK_HEIGHT was hardcoded to 64 here
// while the dock's actual height was 76).
//
// The bar was a floating pill; it is now a full-width tab bar with labels, so
// there is no bottom margin to account for — it sits flush against the bottom
// edge and adds the safe-area inset itself.
// 24pt icon + 4pt gap + ~14pt label + 8pt padding each side.
export const DOCK_HEIGHT = 58
