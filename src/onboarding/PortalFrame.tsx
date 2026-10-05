import { useState } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  type SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated'
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg'
import { onboarding } from '../theme'
import { type SceneGeometry, wallScale } from './sceneGeometry'

// The portal: a cream wall with an arch-shaped hole cut in it, plus a thin
// aubergine frame. It is drawn ABOVE the room layers, so the interior seen
// through the arch is the live room itself — the same layers that fill the
// screen after the push — not a preview of it.
//
// Vector, with the path recomputed as the camera moves (rather than scaling a
// bitmap), so the frame stays crisp as it expands past the viewport. The wall
// scales about the arch centre; by camera 1 the hole is larger than the screen
// and the cream exterior is gone.
//
// The scale reaches React as state (via useAnimatedReaction) instead of through
// Reanimated animatedProps on the SVG `d`: animatedProps on SVG attributes
// don't update on web, and this is a single ~750ms animation on a tiny tree, so
// the extra renders cost nothing and behave identically on every platform.

interface Props {
  camera: SharedValue<number>
  /** 1 = wall present, 0 = gone (Reduce Motion cross-fade). */
  wallOpacity: SharedValue<number>
  geometry: SceneGeometry
}

// Arch outline (open at the bottom) for a given half-size about (cx, cy).
function archD(cx: number, cy: number, halfW: number, halfH: number, inset: number) {
  const w = Math.max(halfW - inset, 1)
  const top = cy - halfH + inset
  const bottom = cy + halfH
  return `M${cx - w},${bottom} L${cx - w},${top + w} A${w},${w} 0 0 1 ${cx + w},${top + w} L${cx + w},${bottom}`
}

export function PortalFrame({ camera, wallOpacity, geometry: g }: Props) {
  const { portal } = g
  const [scale, setScale] = useState(1)

  useAnimatedReaction(
    () => wallScale(camera.value, g),
    (s, prev) => {
      if (prev === null || Math.abs(s - prev) > 0.001) runOnJS(setScale)(s)
    },
    [g]
  )

  const halfW = (portal.width / 2) * scale
  const halfH = (portal.height / 2) * scale
  const top = portal.cy - halfH
  const bottom = portal.cy + halfH
  const big = 4000

  // Wall = huge rect with the arch carved out (even-odd).
  const wallD =
    `M${-big},${-big} H${g.width + big} V${g.height + big} H${-big} Z ` +
    `M${portal.cx - halfW},${bottom} L${portal.cx - halfW},${top + halfW} ` +
    `A${halfW},${halfW} 0 0 1 ${portal.cx + halfW},${top + halfW} L${portal.cx + halfW},${bottom} Z`

  const wrapStyle = useAnimatedStyle(() => ({ opacity: wallOpacity.value }))
  // The one restrained highlight near the upper curve: soft, ~7% — you feel
  // depth before you notice "glass". Fades out as the camera moves in.
  const glareStyle = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - camera.value * 3) }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrapStyle]} pointerEvents="none">
      <Svg width={g.width} height={g.height} style={StyleSheet.absoluteFill}>
        <Path d={wallD} fill={onboarding.paper} fillRule="evenodd" />
        {/* Layered frame: faint outer shadow → frame → inner recess. */}
        <Path
          d={archD(portal.cx, portal.cy, halfW, halfH, -9 * scale)}
          stroke={onboarding.frame}
          strokeOpacity={0.06}
          strokeWidth={9}
          fill="none"
        />
        <Path d={archD(portal.cx, portal.cy, halfW, halfH, 0)} stroke={onboarding.frame} strokeWidth={5} fill="none" />
        <Path
          d={archD(portal.cx, portal.cy, halfW, halfH, 5 * scale)}
          stroke={onboarding.frame}
          strokeOpacity={0.28}
          strokeWidth={9}
          fill="none"
        />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, glareStyle]} pointerEvents="none">
        <Svg width={g.width} height={g.height}>
          <Defs>
            <RadialGradient id="glare" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.07" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={portal.left + portal.width * 0.3}
            cy={portal.top + portal.height * 0.16}
            rx={portal.width * 0.3}
            ry={portal.height * 0.12}
            fill="url(#glare)"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  )
}
