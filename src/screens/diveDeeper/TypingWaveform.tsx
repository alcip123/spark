import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { diveDeeperColors } from './diveDeeperTheme'

const BAR_COUNT = 5
const BASE_HEIGHT = 4
const IDLE_AMPLITUDE = 3
const BUMP_AMPLITUDE = 10
const SPRING_CONFIG = { damping: 12, stiffness: 180 }

function WaveBar({ index, bumpTick }: { index: number; bumpTick: number }) {
  const idle = useSharedValue(0)
  const bump = useSharedValue(0)

  // Idle drift: a gentle, staggered up/down loop so the waveform reads as
  // alive even when the user isn't typing.
  useEffect(() => {
    idle.value = withDelay(
      index * 90,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 900 + index * 60,
            easing: Easing.inOut(Easing.sin),
            reduceMotion: ReduceMotion.System,
          }),
          withTiming(0, {
            duration: 900 + index * 60,
            easing: Easing.inOut(Easing.sin),
            reduceMotion: ReduceMotion.System,
          })
        ),
        -1,
        false,
        undefined,
        ReduceMotion.System
      )
    )
  }, [idle, index])

  // Each keystroke bumps every bar slightly, staggered and scaled per bar so
  // it reads as one small ripple rather than a uniform block jump.
  useEffect(() => {
    if (bumpTick === 0) return
    const magnitude = 0.6 + Math.random() * 0.4
    bump.value = withDelay(
      index * 12,
      withSpring(magnitude, SPRING_CONFIG, () => {
        bump.value = withSpring(0, SPRING_CONFIG)
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bumpTick])

  const style = useAnimatedStyle(() => ({
    height: BASE_HEIGHT + idle.value * IDLE_AMPLITUDE + bump.value * BUMP_AMPLITUDE,
  }))

  return <Animated.View style={[styles.bar, style]} />
}

interface TypingWaveformProps {
  // Increment this on every keystroke (e.g. draft.length or a counter) —
  // each change triggers one bump across the bars. Idle drift runs
  // regardless of this prop.
  typingTick: number
}

// Small waveform that sits in the Dive Deeper input row. Purely a typing-
// driven visual (no mic/audio) — see the redesign plan for why voice input
// was explicitly kept out of scope.
export function TypingWaveform({ typingTick }: TypingWaveformProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <WaveBar key={i} index={i} bumpTick={typingTick} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: BASE_HEIGHT + IDLE_AMPLITUDE + BUMP_AMPLITUDE,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: diveDeeperColors.accent,
  },
})
