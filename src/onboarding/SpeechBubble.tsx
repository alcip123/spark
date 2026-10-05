import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { onboarding, typography } from '../theme'

interface SpeechBubbleProps {
  text: string
  /** Horizontal tail position as a fraction of the bubble width (points at Rook). */
  tailAt?: number
  maxWidth: number
}

// Warm cream surface lighter than the room, big radius, soft shadow, aubergine
// type, a small tail, no outline. Entrance is opacity 0 → 1 + scale 0.96 → 1
// over ~240ms — deliberately not a bouncy comic-book pop. Remounting
// (key=text) replays it, which is how the greeting becomes the curiosity
// prompt. A manual shared value rather than a Reanimated layout-animation
// preset, which has flaky support on web (same reasoning as ScreenTransition).
export function SpeechBubble({ text, tailAt = 0.5, maxWidth }: SpeechBubbleProps) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    })
  }, [progress])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + 0.04 * progress.value }],
  }))

  return (
    <Animated.View style={[styles.wrap, { maxWidth }, style]} accessibilityLiveRegion="polite">
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={[styles.tail, { left: `${tailAt * 100}%` }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  bubble: {
    backgroundColor: onboarding.bubble,
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: onboarding.frame,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6,
  },
  text: {
    ...typography.bodyLg,
    color: onboarding.bubbleText,
    textAlign: 'center',
  },
  tail: {
    position: 'absolute',
    bottom: -7,
    marginLeft: -9,
    width: 18,
    height: 18,
    backgroundColor: onboarding.bubble,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
})
