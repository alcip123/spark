import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import Svg, { G, Line, Path } from 'react-native-svg'
import { SPARK_STROKES as STROKES, type StrokeSpec } from './icons/sparkGeometry'
import { colors } from '../theme'

// Renders the launch splash: the spark mark sits exactly where the native
// splash image shows it (same PNG composition — see assets/icon-source.svg),
// then each of its 10 strokes bursts outward and fades once `ready` is true.

// Must match the expo-splash-screen plugin's imageWidth in app.json so the
// native splash image and this overlay's logo are the same rendered size.
const LOGO_SIZE = 120

// The mark is drawn inside a rotate(-35°) group, so each stroke's on-screen
// burst direction is its viewBox direction rotated by the same angle.
const ROT = (-35 * Math.PI) / 180
const COS = Math.cos(ROT)
const SIN = Math.sin(ROT)

// Per-stroke flight distance (px) and spin (deg); hand-tuned variety so the
// burst reads organic rather than mechanical. Index-aligned with STROKES.
const DISTANCES = [200, 170, 150, 210, 180, 190, 160, 140, 230, 220]
const SPINS = [25, -20, 30, -25, 20, -30, 25, -15, -20, 20]

const BURSTS = STROKES.map((s, i) => {
  const vx = s.x2 - s.x1
  const vy = s.y2 - s.y1
  const len = Math.hypot(vx, vy)
  const dirX = (vx * COS - vy * SIN) / len
  const dirY = (vx * SIN + vy * COS) / len
  return { dx: dirX * DISTANCES[i], dy: dirY * DISTANCES[i], spin: SPINS[i] }
})

// Minimum time the assembled logo stays on screen after the app is ready,
// so the mark registers before it bursts — without this, a fast launch
// bursts instantly and the whole sequence is over before it's seen.
const HOLD_MS = 700
const BURST_MS = 800
const STAGGER_MS = 50
const EASING = Easing.out(Easing.cubic)
// Last stroke starts at HOLD + 9 × STAGGER and flies for BURST_MS; small buffer after.
const TOTAL_MS = HOLD_MS + STAGGER_MS * (STROKES.length - 1) + BURST_MS + 80

// When the background starts fading — App.tsx times the feed's entrance to this.
export const REVEAL_DELAY_MS = HOLD_MS + 350

function BurstStroke({ spec, index, ready }: { spec: StrokeSpec; index: number; ready: boolean }) {
  const t = useSharedValue(0)

  useEffect(() => {
    if (ready) {
      // With Reduce Motion on, strokes jump to their faded end state and the
      // splash resolves as a simple crossfade via the background fade below.
      t.value = withDelay(
        HOLD_MS + index * STAGGER_MS,
        withTiming(1, { duration: BURST_MS, easing: EASING, reduceMotion: ReduceMotion.System }),
        ReduceMotion.System
      )
    }
  }, [ready, index, t])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.4, 1], [1, 0.9, 0]),
    transform: [
      { translateX: t.value * BURSTS[index].dx },
      { translateY: t.value * BURSTS[index].dy },
      { rotate: `${t.value * BURSTS[index].spin}deg` },
    ],
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 1024 1024">
        <G transform="translate(512 512) scale(42) translate(-11.22 -14.37)">
          <G transform="rotate(-35 13 12)" strokeLinecap="round">
            {spec.d ? (
              <Path d={spec.d} stroke={spec.color} strokeWidth={spec.width} fill="none" />
            ) : (
              <Line x1={spec.x1} y1={spec.y1} x2={spec.x2} y2={spec.y2} stroke={spec.color} strokeWidth={spec.width} />
            )}
          </G>
        </G>
      </Svg>
    </Animated.View>
  )
}

// Dev-only escape hatch for tuning: on web, load with ?splashHold to freeze
// the splash in its pre-burst state so the logo can be inspected.
const HOLD =
  __DEV__ && typeof location !== 'undefined' && location.search.includes('splashHold')

export function AnimatedSplash({ ready: readyProp, onDone }: { ready: boolean; onDone: () => void }) {
  const ready = readyProp && !HOLD
  const bg = useSharedValue(1)

  useEffect(() => {
    if (ready) {
      // Background starts fading partway through the burst so the feed shows
      // through while sparks are still in flight.
      bg.value = withDelay(REVEAL_DELAY_MS, withTiming(0, { duration: 500 }))
      const timer = setTimeout(onDone, TOTAL_MS)
      return () => clearTimeout(timer)
    }
  }, [ready, bg, onDone])

  const bgStyle = useAnimatedStyle(() => ({ opacity: bg.value }))

  return (
    <View
      style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      onLayout={() => SplashScreen.hideAsync()}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }, bgStyle]} />
      <View style={styles.center}>
        <View style={{ width: LOGO_SIZE, height: LOGO_SIZE }}>
          {STROKES.map((spec, i) => (
            <BurstStroke key={i} spec={spec} index={i} ready={ready} />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
