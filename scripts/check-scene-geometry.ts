// Run: npx tsx scripts/check-scene-geometry.ts
// Smallest check that fails if the portal layout maths breaks.
import assert from 'node:assert/strict'
import { CTA_HEIGHT, computeSceneGeometry, roomLayerTransform, wallScale } from '../src/onboarding/sceneGeometry'

const devices = [
  { name: 'small iPhone', width: 375, height: 667, insetTop: 20, insetBottom: 0 },
  { name: 'iPhone 14', width: 390, height: 844, insetTop: 47, insetBottom: 34 },
  { name: 'Pro Max', width: 430, height: 932, insetTop: 59, insetBottom: 34 },
  { name: 'short Android', width: 360, height: 640, insetTop: 24, insetBottom: 0 },
  { name: 'tablet', width: 820, height: 1180, insetTop: 24, insetBottom: 20 },
]

for (const d of devices) {
  const g = computeSceneGeometry(d)
  const bottom = d.height - d.insetBottom
  assert.ok(g.portal.height / g.portal.width >= 1.09, `${d.name}: arch too flat`)
  assert.ok(g.portal.width <= d.width * 0.76, `${d.name}: portal too wide`)
  assert.ok(g.ctaTop + g.ctaHeight <= bottom, `${d.name}: CTA falls off the screen`)
  assert.equal(g.ctaHeight, CTA_HEIGHT)
  assert.ok(g.ctaHeight >= 44, `${d.name}: CTA below touch target`)

  // Camera 0 maps the room onto the portal centre; camera 1 is the plain screen.
  const c0 = roomLayerTransform(0, g, 0)
  assert.ok(Math.abs(c0.scale - g.roomScale0) < 1e-9)
  assert.ok(Math.abs(c0.translateY - (g.portal.cy - d.height / 2)) < 1e-9)
  const c1 = roomLayerTransform(1, g, 0)
  assert.ok(Math.abs(c1.scale - 1) < 1e-9 && c1.translateX === 0 && c1.translateY === 0)

  // Wall: identity at 0, and the arch hole clears the whole viewport at 1.
  assert.equal(wallScale(0, g), 1)
  const halfW = (g.portal.width / 2) * wallScale(1, g)
  const topY = g.portal.cy - (g.portal.height / 2) * wallScale(1, g)
  assert.ok(halfW > d.width && topY < -d.height * 0.5, `${d.name}: frame doesn't leave the viewport`)

  // Nearer layers grow more than farther ones.
  assert.ok(roomLayerTransform(1, g, 1).scale > roomLayerTransform(1, g, 0.5).scale)
}
console.log('scene geometry OK')
