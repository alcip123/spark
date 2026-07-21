import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DOCK_HEIGHT } from '../constants/layout'
import { colors, spacing, typography } from '../theme'

export function ProfileScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.page, { paddingBottom: DOCK_HEIGHT + insets.bottom }]}>
      <Text style={typography.h2}>Profile</Text>
      <Text style={[typography.body, styles.subline]}>
        Coming soon — this is where your stats and saved facts will live.
      </Text>
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
})
