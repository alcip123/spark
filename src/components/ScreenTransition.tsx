import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

interface ScreenTransitionProps {
  children: ReactNode
}

// Plays a quick slide-and-fade every time this mounts — used to animate
// forward progress between steps of the new onboarding flow. Only the
// incoming screen animates; the outgoing one just unmounts on the parent's
// conditional swap. A manual shared-value animation rather than Reanimated's
// entering/exiting layout-animation props, which have flaky support on web
// (where this flow is being built and tested) — this is just interpolated
// style props, so it behaves identically everywhere.
export function ScreenTransition({ children }: ScreenTransitionProps) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    })
  }, [progress])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * 32 }],
  }))

  return <Animated.View style={[styles.fill, style]}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
})
