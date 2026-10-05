// Pure layout maths for the onboarding scene — no react-native imports so
// scripts/check-scene-geometry.ts can exercise it under tsx.
//
// All numbers here are STARTING VALUES taken from the onboarding spec. They are
// expected to be re-tuned once the production art exists (optical balance beats
// the spec's percentages).

export interface SceneInput {
  width: number
  height: number
  insetTop: number
  insetBottom: number
}

export interface PortalBox {
  left: number
  top: number
  width: number
  height: number
  cx: number
  cy: number
}

export interface SceneGeometry {
  width: number
  height: number
  portal: PortalBox
  /** Room scale at camera 0: the room is shrunk so it exactly fills the portal's width. */
  roomScale0: number
  /** Room-centre → portal-centre offset at camera 0 (screen px); eases to 0 at camera 1. */
  roomOffset0: { x: number; y: number }
  /** Wall scale at camera 1 — large enough that the arch hole (incl. its round top) clears the viewport. */
  wallScaleMax: number
  /** Top of the headline, directly under the portal. */
  headlineTop: number
  ctaTop: number
  ctaHeight: number
  ctaWidth: number
  bubbleTop: number
  bottomPad: number
}

export const HEADLINE_GAP = 28 // portal → headline (spec: 24–36)
export const HEADLINE_HEIGHT = 72 // "Find your" (24/28) + "Spark." (38/42), tight
export const CTA_GAP = 40 // headline → CTA (spec: 32–48)
export const CTA_HEIGHT = 58 // spec: 56–62
const PORTAL_WIDTH_FRACTION = 0.72 // spec: 68–76%
const PORTAL_TOP_FRACTION = 0.1 // spec: 8–11% below the safe area
const PORTAL_HEIGHT_FRACTION = 0.48 // spec: 42–48% of usable height
const MAX_PORTAL_WIDTH = 360
const MIN_ARCH_ASPECT = 1.1 // height / width — below this the arch stops reading as an arch
const BOTTOM_PAD = 24

export function computeSceneGeometry({ width, height, insetTop, insetBottom }: SceneInput): SceneGeometry {
  const usable = height - insetTop - insetBottom
  const top = insetTop + usable * PORTAL_TOP_FRACTION

  let portalW = Math.min(width * PORTAL_WIDTH_FRACTION, MAX_PORTAL_WIDTH)
  // Whatever is left after the headline + CTA group (never squeeze the CTA).
  const lowerGroup = HEADLINE_GAP + HEADLINE_HEIGHT + CTA_GAP + CTA_HEIGHT + BOTTOM_PAD
  const roomForPortal = usable * (1 - PORTAL_TOP_FRACTION) - lowerGroup
  let portalH = Math.min(usable * PORTAL_HEIGHT_FRACTION, portalW * 1.6, roomForPortal)
  // Short screens: shrink the whole portal rather than flatten the arch.
  portalH = Math.max(portalH, 120)
  portalW = Math.min(portalW, portalH / MIN_ARCH_ASPECT)

  const portal: PortalBox = {
    left: (width - portalW) / 2,
    top,
    width: portalW,
    height: portalH,
    cx: width / 2,
    cy: top + portalH / 2,
  }

  const roomScale0 = Math.max(portalW / width, portalH / height)
  const headlineTop = top + portalH + HEADLINE_GAP
  const ctaTop = headlineTop + HEADLINE_HEIGHT + CTA_GAP

  return {
    width,
    height,
    portal,
    roomScale0,
    roomOffset0: { x: portal.cx - width / 2, y: portal.cy - height / 2 },
    wallScaleMax: 2.2 * Math.max(width / portalW, height / portalH),
    headlineTop,
    ctaTop,
    ctaHeight: CTA_HEIGHT,
    ctaWidth: Math.min(width * 0.8, 600),
    bubbleTop: insetTop + usable * 0.1,
    bottomPad: BOTTOM_PAD,
  }
}

/** End-of-push scale for a layer. depth 0 = background (just fills the screen), 1 = nearest foreground. */
export const DEPTH_GAIN = 0.3
export function layerEndScale(depth: number): number {
  return 1 + depth * DEPTH_GAIN
}

/**
 * Scale / translate for a room layer at camera progress c (0 = through the
 * portal, 1 = inside). Scale interpolates geometrically (k0 → end) so the dolly
 * feels constant-speed; the offset eases linearly toward the screen centre.
 * Worklet-safe: plain maths only.
 */
export function roomLayerTransform(c: number, g: SceneGeometry, depth: number) {
  'worklet'
  const end = 1 + depth * DEPTH_GAIN
  const k0 = g.roomScale0
  return {
    scale: k0 * Math.pow(end / k0, c),
    translateX: (1 - c) * g.roomOffset0.x,
    translateY: (1 - c) * g.roomOffset0.y,
  }
}

/** Wall (portal frame) scale at camera progress c, about the arch centre. */
export function wallScale(c: number, g: SceneGeometry) {
  'worklet'
  return Math.pow(g.wallScaleMax, c)
}
