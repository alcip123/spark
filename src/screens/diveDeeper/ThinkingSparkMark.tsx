import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { G, Line, Path, Svg } from 'react-native-svg'
import { SPARK_INNER_TRANSFORM, SPARK_ROTATE_TRANSFORM, SPARK_STROKES } from '../../components/icons/sparkGeometry'

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedLine = Animated.createAnimatedComponent(Line)

const SIZE = 44

// Same burst-direction math as AnimatedSplash (rotate(-35°) group, so each
// stroke's on-screen direction is its viewBox direction rotated the same
// way), but with much smaller travel distances — this is a repeating,
// subtle "breathing" loop, not a one-time launch burst.
const ROT = (-35 * Math.PI) / 180
const COS = Math.cos(ROT)
const SIN = Math.sin(ROT)
const DISTANCES = [14, 12, 11, 15, 13, 13, 12, 10, 16, 15]
const SPINS = [18, -14, 20, -18, 14, -20, 18, -10, -14, 14]

const BREATHS = SPARK_STROKES.map((s, i) => {
  const vx = s.x2 - s.x1
  const vy = s.y2 - s.y1
  const len = Math.hypot(vx, vy)
  const dirX = (vx * COS - vy * SIN) / len
  const dirY = (vx * SIN + vy * COS) / len
  return { dx: dirX * DISTANCES[i], dy: dirY * DISTANCES[i], spin: SPINS[i] }
})

const CYCLE_COLORS = ['#3B6FE0', '#8A4FE0', '#D63BB0', '#3BC7E0']
const BREATHE_MS = 900
const STAGGER_MS = 45

function BreathingStroke({ index }: { index: number }) {
  const spec = SPARK_STROKES[index]
  const t = useSharedValue(0)

  useEffect(() => {
    t.value = withDelay(
      index * STAGGER_MS,
      withRepeat(
        withTiming(1, {
          duration: BREATHE_MS,
          easing: Easing.inOut(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        true, // reverse each cycle: burst apart, then reassemble, forever
        undefined,
        ReduceMotion.System
      )
    )
  }, [t, index])

  const colorStops = [
    CYCLE_COLORS[index % 4],
    CYCLE_COLORS[(index + 1) % 4],
    CYCLE_COLORS[(index + 2) % 4],
  ]
  const animatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(t.value, [0, 0.5, 1], colorStops),
  }))

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [1, 0.2]),
    transform: [
      { translateX: t.value * BREATHS[index].dx },
      { translateY: t.value * BREATHS[index].dy },
      { rotate: `${t.value * BREATHS[index].spin}deg` },
    ],
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 1024 1024">
        <G transform={SPARK_INNER_TRANSFORM}>
          <G transform={SPARK_ROTATE_TRANSFORM} strokeLinecap="round">
            {spec.d ? (
              <AnimatedPath d={spec.d} strokeWidth={spec.width} fill="none" animatedProps={animatedProps} />
            ) : (
              <AnimatedLine
                x1={spec.x1}
                y1={spec.y1}
                x2={spec.x2}
                y2={spec.y2}
                strokeWidth={spec.width}
                animatedProps={animatedProps}
              />
            )}
          </G>
        </G>
      </Svg>
    </Animated.View>
  )
}

// The Dive Deeper "thinking" indicator: the brand mark continuously bursts
// apart and reassembles — the same gesture as AnimatedSplash's one-shot
// launch burst, looped — instead of a plain pulsing "Thinking…" caption.
export function ThinkingSparkMark() {
  return (
    <View style={styles.wrap}>
      {SPARK_STROKES.map((_, i) => (
        <BreathingStroke key={i} index={i} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    marginLeft: 16,
    marginVertical: 8,
  },
})
