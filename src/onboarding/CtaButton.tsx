import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { onboarding, typography } from '../theme'
import { lightImpact } from './haptics'

interface CtaButtonProps {
  label: string
  onPress: () => void
  width: number
  height: number
  /** Subordinate right arrow — suggests entering rather than submitting. */
  arrow?: boolean
  accessibilityLabel?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SHADOW_REST = 0.14
const SHADOW_PRESSED = 0.07
const PRESS_MS = 100

// Onboarding's primary action. A dedicated component rather than a change to
// PopButton, which Sign Up's SSO stack still uses. Deliberately quiet: cream
// text on aubergine, mid radius, soft elevation (not a hard offset shadow),
// sentence case. Press is a 1 → 0.98 scale that also lets some of the shadow
// go, so it reads as tactile without the user noticing a shadow at all.
export function CtaButton({ label, onPress, width, height, arrow = false, accessibilityLabel }: CtaButtonProps) {
  const pressed = useSharedValue(0)

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.02 * pressed.value }],
    shadowOpacity: SHADOW_REST + (SHADOW_PRESSED - SHADOW_REST) * pressed.value,
  }))

  return (
    <View style={{ width, height }}>
      <AnimatedPressable
        onPress={() => {
          lightImpact()
          onPress()
        }}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: PRESS_MS, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System })
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 16, stiffness: 300, reduceMotion: ReduceMotion.System })
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[styles.button, { height }, style]}
      >
        <Text style={styles.label}>{label}</Text>
        {arrow && <Text style={styles.arrow}>→</Text>}
      </AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: onboarding.buttonFill,
    borderRadius: 24,
    // Soft elevation: y6 / blur18, tinted with the frame colour. The opacity
    // is animated in the style above (rest .14 → pressed .07).
    shadowColor: onboarding.frame,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 5,
  },
  label: {
    ...typography.h2,
    fontSize: 18,
    lineHeight: 22,
    color: onboarding.buttonText,
  },
  arrow: {
    ...typography.h2,
    fontSize: 18,
    lineHeight: 22,
    color: onboarding.buttonText,
    opacity: 0.8,
  },
})
