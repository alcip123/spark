import * as Haptics from 'expo-haptics'
import type { ReactNode } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { colors, radii, spacing, typography } from '../theme'

interface PopButtonProps {
  label: string
  onPress: () => void
  accessibilityLabel?: string
  // Leading glyph (brand logo or icon), pinned to the left edge with the
  // label centered in the button — the standard SSO-button layout (Apple's
  // own "Sign in with Apple" button does the same), not shifted by the icon.
  icon?: ReactNode
  backgroundColor?: string
  textColor?: string
  // Auto-width/self-centered (Screen 1's CTA) by default; true stretches to
  // fill the available width for stacked button lists (Screen 2's sign-in).
  fullWidth?: boolean
}

// A new bolder pattern (deliberately outside the app's usual soft-shadow,
// no-heavy-outline system): thick black border, hard unblurred offset
// shadow, bold black label. The shadow is a solid Rect behind the button
// rather than a native shadow prop — RN shadow/elevation can't produce a
// crisp unblurred edge consistently across iOS/Android/web, so a duplicate
// shape offset behind is the reliable way to get a true "pop" shadow
// everywhere. Introduced for the new onboarding flow; intended to become the
// app's new shared primary-button pattern, not a one-off.
const SHADOW_OFFSET = 5
const BORDER_WIDTH = 2.5

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// Same spring feel as PressableScale (the app's shared press physics), but
// translates toward the shadow instead of scaling — the button visually
// pushes down and "swallows" its own shadow on press, then springs back out
// on release, which sells the physical-button read this style is going for
// far better than a uniform scale-down would.
const PRESS_IN = { damping: 22, stiffness: 420, reduceMotion: ReduceMotion.System }
const RELEASE = { damping: 13, stiffness: 320, reduceMotion: ReduceMotion.System }

export function PopButton({
  label,
  onPress,
  accessibilityLabel,
  icon,
  backgroundColor = colors.accentPrimary,
  textColor = '#000000',
  fullWidth = false,
}: PopButtonProps) {
  const press = useSharedValue(0)

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: press.value }, { translateY: press.value }],
  }))

  function handlePressIn() {
    press.value = withSpring(SHADOW_OFFSET, PRESS_IN)
    // Haptics has no web implementation; guard rather than let it reject.
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  function handlePressOut() {
    press.value = withSpring(0, RELEASE)
  }

  return (
    <View style={[styles.wrap, fullWidth && styles.fullWidth]}>
      <View style={styles.shadow} />
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[styles.button, { backgroundColor }, style]}
      >
        {icon && <View style={styles.iconSlot}>{icon}</View>}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    position: 'relative',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: '#000000',
    borderRadius: radii.pill,
  },
  button: {
    borderRadius: radii.pill,
    borderWidth: BORDER_WIDTH,
    borderColor: '#000000',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Absolute, not inline — keeps the label truly centered in the button
  // regardless of icon width, matching the standard SSO-button convention.
  iconSlot: {
    position: 'absolute',
    left: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.h2,
    fontSize: 17,
    fontWeight: '700',
  },
})
