import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GearIcon } from '../components/icons/GearIcon'
import { PressableScale } from '../components/PressableScale'
import { DOCK_HEIGHT } from '../constants/layout'
import { borders, colors, radii, spacing, typography } from '../theme'

interface ProfileScreenProps {
  onOpenSettings: () => void
}

export function ProfileScreen({ onOpenSettings }: ProfileScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.page, { paddingTop: insets.top + spacing.xl, paddingBottom: DOCK_HEIGHT + insets.bottom }]}>
      <Text style={typography.h2}>Profile</Text>
      <Text style={[typography.body, styles.subline]}>
        Coming soon — this is where your stats and saved facts will live.
      </Text>

      {/* Placeholder home for Settings. The feed's gear button is gone with the
          header redesign, and this is the only remaining way in until Profile
          is designed properly. */}
      <PressableScale
        onPress={onOpenSettings}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        style={styles.row}
      >
        <GearIcon size={20} color={colors.textPrimary} />
        <Text style={typography.body}>Settings</Text>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
  },
  subline: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.bgAlt,
    ...borders.default,
  },
})
