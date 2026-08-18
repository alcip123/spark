import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Circle, Defs, G, Line, Path, RadialGradient, Stop, Svg } from 'react-native-svg'
import { SPARK_INNER_TRANSFORM, SPARK_ROTATE_TRANSFORM, SPARK_STROKES } from '../../components/icons/sparkGeometry'

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedLine = Animated.createAnimatedComponent(Line)

// The four colors each stroke cycles through — lightened cobalt/violet/
// magenta/cyan so the mark stays legible against the backdrop it shares a
// hue family with (see diveDeeperTheme.ts); the backdrop's own saturated
// tones swallow the mark at equal brightness, so this deliberately reads
// lighter than the backdrop stops.
const CYCLE_COLORS = ['#8FB0FF', '#C4A3FF', '#FF9FE0', '#93E8FA']

const CYCLE_MS = 4000
const STAGGER_MS = 140

function CycleStroke({ index }: { index: number }) {
  const spec = SPARK_STROKES[index]
  const t = useSharedValue(0)

  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: CYCLE_MS,
          easing: Easing.inOut(Easing.sin),
          reduceMotion: ReduceMotion.System,
        })
      ),
      -1,
      true,
      undefined,
      ReduceMotion.System
    )
  }, [t])

  // Stagger the phase per stroke so the cycle reads as a living shimmer
  // rather than every stroke changing color in lockstep.
  const animatedProps = useAnimatedProps(() => {
    const phase = (t.value + index * (STAGGER_MS / CYCLE_MS)) % 1
    return {
      stroke: interpolateColor(phase, [0, 0.33, 0.66, 1], CYCLE_COLORS),
    }
  })

  return spec.d ? (
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
  )
}

interface SparkFocalMarkProps {
  size?: number
}

// The Dive Deeper screen's "AI focal point" — the same 10-stroke brand mark
// AnimatedSplash bursts on launch, here looping instead of one-shot:
// per-stroke color cycling through the backdrop's cobalt/violet/magenta/cyan
// palette, and a pulsing SVG radial-gradient halo behind it. Pure
// react-native-svg + Reanimated — no native shader dependency, so this runs
// in plain Expo Go.
export function SparkFocalMark({ size = 96 }: SparkFocalMarkProps) {
  const haloPulse = useSharedValue(0.65)

  useEffect(() => {
    haloPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
        withTiming(0.65, { duration: 1900, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System })
      ),
      -1,
      false,
      undefined,
      ReduceMotion.System
    )
  }, [haloPulse])

  const haloStyle = useAnimatedStyle(() => ({ opacity: haloPulse.value }))

  const haloSize = size * 2.4

  return (
    <View style={[styles.wrap, { width: haloSize, height: haloSize }]}>
      <Animated.View style={[StyleSheet.absoluteFill, haloStyle]}>
        <Svg width={haloSize} height={haloSize}>
          <Defs>
            <RadialGradient id="focalHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
              <Stop offset="30%" stopColor="#C4A3FF" stopOpacity={0.75} />
              <Stop offset="65%" stopColor="#3B6FE0" stopOpacity={0.4} />
              <Stop offset="100%" stopColor="#3B6FE0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={haloSize / 2} cy={haloSize / 2} r={haloSize / 2} fill="url(#focalHalo)" />
        </Svg>
      </Animated.View>
      <View style={[styles.markCenter, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 1024 1024">
          <G transform={SPARK_INNER_TRANSFORM}>
            <G transform={SPARK_ROTATE_TRANSFORM} strokeLinecap="round">
              {SPARK_STROKES.map((_, i) => (
                <CycleStroke key={i} index={i} />
              ))}
            </G>
          </G>
        </Svg>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  markCenter: {
    position: 'absolute',
  },
})
