import { StyleSheet, Text } from 'react-native'
import { colors, radii, shadows, spacing, typography } from '../theme'
import { PressableScale } from './PressableScale'

interface PrimaryButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  accessibilityLabel?: string
}

// The one filled-pill CTA shape used across Onboarding, the exhausted-feed
// empty state, and Dive Deeper's empty state. Previously each screen carried
// its own copy of this style block, and they'd already drifted (one hardcoded
// paddingVertical: 18 where the others wrote spacing.md + 2 for the same
// value) — a single component is the fix, not just realigning the number.
export function PrimaryButton({ label, onPress, disabled, accessibilityLabel }: PrimaryButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.button, shadows.button, disabled && styles.disabled]}
    >
      <Text style={typography.button}>{label}</Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  // Same button, dimmed — not a different gray button. Opacity applies to
  // the whole subtree (fill + label together), matching how iOS dims a
  // disabled control rather than swapping its color identity.
  disabled: {
    opacity: 0.35,
    shadowOpacity: 0,
    elevation: 0,
  },
})
