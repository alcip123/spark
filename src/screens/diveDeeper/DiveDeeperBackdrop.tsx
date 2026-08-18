import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, LinearGradient, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg'
import { diveDeeperColors } from './diveDeeperTheme'

const AnimatedRect = Animated.createAnimatedComponent(Rect)

const SWEEP_COLORS = [diveDeeperColors.sweepBlue, diveDeeperColors.sweepViolet, diveDeeperColors.sweepMagenta]
const SWEEP_CYCLE_MS = 5000
const SWEEP_TRAVEL_MS = 3600

interface DiveDeeperBackdropProps {
  width: number
  height: number
}

// Pure react-native-svg + Reanimated backdrop — no native shader dependency,
// so this (and the rest of Dive Deeper) runs in plain Expo Go. Approximates
// the halftone stipple + perimeter glow from the original Skia version with
// a tiled dot pattern, two ambient radial-gradient "light source" glows, and
// a traveling dashed stroke around the edge for the perimeter sweep.
export function DiveDeeperBackdrop({ width, height }: DiveDeeperBackdropProps) {
  const travel = useSharedValue(0)
  const huePhase = useSharedValue(0)

  useEffect(() => {
    travel.value = withRepeat(
      withTiming(1, { duration: SWEEP_TRAVEL_MS, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
      false,
      undefined,
      ReduceMotion.System
    )
    huePhase.value = withRepeat(
      withTiming(1, { duration: SWEEP_CYCLE_MS, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
      false,
      undefined,
      ReduceMotion.System
    )
  }, [travel, huePhase])

  // A short lit segment chasing around a long gap reads as a traveling
  // sweep rather than a static dashed border. Computed even at width/height
  // 0 (pre-layout) so the hook below is always called in the same order —
  // the actual guard against rendering before layout happens in the return
  // below, never before a hook.
  const perimeter = 2 * (width + height)
  const segment = perimeter * 0.16
  const gap = perimeter - segment

  const sweepProps = useAnimatedProps(() => ({
    strokeDashoffset: -travel.value * perimeter,
    stroke: interpolateColor(huePhase.value, [0, 0.5, 1], SWEEP_COLORS),
  }))

  if (width === 0 || height === 0) return null

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="ddBase" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor={diveDeeperColors.gradientBottomAlt} />
          <Stop offset="18%" stopColor={diveDeeperColors.gradientBottom} />
          <Stop offset="55%" stopColor={diveDeeperColors.gradientMid} />
          <Stop offset="80%" stopColor={diveDeeperColors.gradientMidAlt} />
          <Stop offset="100%" stopColor={diveDeeperColors.gradientTop} />
        </LinearGradient>
        <RadialGradient id="ddGlowA" cx="72%" cy="22%" r="60%">
          <Stop offset="0%" stopColor={diveDeeperColors.gradientRim} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={diveDeeperColors.gradientRim} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="ddGlowB" cx="22%" cy="82%" r="55%">
          <Stop offset="0%" stopColor={diveDeeperColors.sweepBlue} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={diveDeeperColors.sweepBlue} stopOpacity={0} />
        </RadialGradient>
        <Pattern id="ddDots" width={10} height={10} patternUnits="userSpaceOnUse">
          <Circle cx={5} cy={5} r={1.1} fill="#FFFFFF" fillOpacity={0.22} />
        </Pattern>
      </Defs>

      <Rect width="100%" height="100%" fill="url(#ddBase)" />
      <Rect width="100%" height="100%" fill="url(#ddGlowA)" />
      <Rect width="100%" height="100%" fill="url(#ddGlowB)" />
      <Rect width="100%" height="100%" fill="url(#ddDots)" />

      <AnimatedRect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        rx={0}
        fill="none"
        strokeWidth={4}
        strokeDasharray={`${segment} ${gap}`}
        opacity={0.85}
        animatedProps={sweepProps}
      />
    </Svg>
  )
}
