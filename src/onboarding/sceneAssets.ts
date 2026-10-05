import type { ImageSourcePropType } from 'react-native'

// THE one place the onboarding scene's artwork is configured.
//
// Swapping placeholder art for the production layers means editing this file
// only: set `source` to the PNG and tune `placement` / `depth`. Nothing in the
// animation system, timeline, or screens refers to a specific image.
//
// Final art goes in assets/onboarding/ (Metro can't `require` a file that
// doesn't exist yet, so entries stay `undefined` until the PNG lands):
//   room-background.png  room-midground.png  rook-front.png  rook-turn.png
//   foreground-left.png  foreground-right.png  spark-glow.png
//
// Placement is in fractions of the ROOM box (the full-screen scene at camera
// 1). At camera 0 the room is shrunk to fit the portal, so the portal shows
// this whole composition. `depth` 0..1 drives parallax (see layerEndScale in
// sceneGeometry.ts): the background moves least, foreground foliage most. All
// of these are tunable starting values, not design constants.

export type LayerKey =
  | 'background'
  | 'glow'
  | 'midground'
  | 'rook'
  | 'rookTurn'
  | 'foregroundLeft'
  | 'foregroundRight'

export interface LayerSpec {
  /** PNG for the layer, or undefined to render the isolated placeholder. */
  source?: ImageSourcePropType
  /** Left / top / width / height as fractions of the room box. */
  x: number
  y: number
  w: number
  h: number
  depth: number
}

export const LAYERS: Record<LayerKey, LayerSpec> = {
  // Deep interior. Oversized on purpose: the arch hole grows faster than the
  // room during the push, so the art needs bleed beyond the screen edges.
  background: { x: -0.25, y: -0.1, w: 1.5, h: 1.2, depth: 0 },
  // Small, ambiguous violet glow deeper in the room — what Rook notices.
  glow: { x: 0.64, y: 0.3, w: 0.26, h: 0.2, depth: 0.1 },
  // Environment immediately around Rook (ledge, nearby shapes).
  midground: { x: -0.1, y: 0.1, w: 1.2, h: 0.85, depth: 0.35 },
  // TEMP: existing mascot PNG as the stand-in for rook-front.png. Rook's
  // box is anchored by his feet (see ROOK_PLACEMENT) rather than x/y/w/h.
  rook: { source: require('../../assets/mascot/rook.png'), x: 0, y: 0, w: 0.58, h: 0, depth: 0.5 },
  // Not rendered yet: needs the turned-toward-the-glow art / Rive rig.
  rookTurn: { x: 0, y: 0, w: 0.58, h: 0, depth: 0.5 },
  // Foliage sits ABOVE the portal frame and moves most.
  foregroundLeft: { x: -0.1, y: 0.5, w: 0.42, h: 0.3, depth: 1 },
  foregroundRight: { x: 0.7, y: 0.54, w: 0.4, h: 0.28, depth: 1 },
}

/** Back-to-front order. Layers up to and including the dim overlay sit under the portal wall. */
export const ROOM_ORDER: LayerKey[] = ['background', 'glow', 'midground', 'rook']
export const FOREGROUND_ORDER: LayerKey[] = ['foregroundLeft', 'foregroundRight']

/** Rook stands on the ledge: feet anchor (fractions of the room box). */
export const ROOK_PLACEMENT = {
  feetX: 0.43, // slightly off-centre (spec: ~43%)
  feetY: 0.755,
  /** PNG aspect (height / width) of the stand-in asset. */
  aspect: 1283 / 1226,
  /** Where he settles after hopping inside. */
  settledFeetX: 0.5,
  settledFeetY: 0.79,
}
