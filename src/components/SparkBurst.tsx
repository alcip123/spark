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
import { colors } from '../theme'

// Miniature version of the launch burst, fired from behind the like button:
// short rounded bars radiate outward and fade. Fires once each time `trigger`
// increments past 0; idle (trigger 0) renders nothing visible.

// Theme colors, not hardcoded hex — this previously duplicated light-mode
// lavender literals directly, so the burst ignored dark mode entirely even
// though every other accent-colored surface in the app adapts to it.
const LAVENDERS = [colors.accentPrimary, colors.accentPrimaryPressed, colors.borderAccent]

const STROKE_COUNT = 8
const BURST_MS = 450
const STAGGER_MS = 12

// Per-stroke jitter (deg off the even 45° spacing) and sizing so the burst
// reads organic, echoing the hand-placed strokes of the logo mark.
const JITTER = [8, -6, 4, -9, 6, -4, 9, -7]
const LENGTHS = [11, 9, 12, 8, 10, 12, 9, 11]
const TRAVELS = [34, 28, 38, 26, 32, 40, 27, 36]

function Stroke({ index, trigger }: { index: number; trigger: number }) {
  const t = useSharedValue(0)

  useEffect(() => {
    if (trigger > 0) {
      t.value = 0
      // With system Reduce Motion on, t jumps straight to 1, where the
      // opacity curve is 0 — the burst simply doesn't appear.
      t.value = withDelay(
        index * STAGGER_MS,
        withTiming(1, {
          duration: BURST_MS,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        }),
        ReduceMotion.System
      )
    }
  }, [trigger, index, t])

  const angle = index * (360 / STROKE_COUNT) + JITTER[index]

  const style = useAnimatedStyle(() => ({
    // Invisible at rest; pops in at the start of flight and fades on the way out
    opacity: interpolate(t.value, [0, 0.05, 0.4, 1], [0, 1, 0.9, 0]),
    transform: [
      { rotate: `${angle}deg` },
      // Rotate-then-translate sends each bar radially along its own angle
      { translateX: 10 + t.value * TRAVELS[index] },
    ],
  }))

  return (
    <Animated.View
      style={[
        styles.stroke,
        { width: LENGTHS[index], backgroundColor: LAVENDERS[index % LAVENDERS.length] },
        style,
      ]}
    />
  )
}

export function SparkBurst({ trigger }: { trigger: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: STROKE_COUNT }, (_, i) => (
        <Stroke key={i} index={i} trigger={trigger} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    pointerEvents: 'none',
  },
  stroke: {
    position: 'absolute',
    height: 3.5,
    borderRadius: 2,
  },
})
