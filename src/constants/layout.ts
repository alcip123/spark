// Single source for the floating dock's own geometry, shared with BottomDock
// so its visual footprint and the space other screens reserve for it can
// never drift apart the way they previously did (DOCK_HEIGHT was hardcoded
// to 64 here while the dock's actual pill-height + bottom-margin was 76).
export const DOCK_PILL_HEIGHT = 60
export const DOCK_PILL_BOTTOM_MARGIN = 16

// Content height of the bottom dock, excluding the device's bottom safe-area
// inset (the dock adds that itself). Screens that must not render underneath
// the dock reserve DOCK_HEIGHT + insets.bottom of bottom space.
export const DOCK_HEIGHT = DOCK_PILL_HEIGHT + DOCK_PILL_BOTTOM_MARGIN
