import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SparkMark } from '../components/icons/SparkMark'
import { PopButton } from '../components/PopButton'
import { colors, layout, spacing, typography } from '../theme'

interface WelcomeScreenProps {
  onContinue: () => void
}

// Screen 1 of the new onboarding flow: logo in the top half, headline
// centered below it, PopButton pinned above the safe area at the bottom.
export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.page}>
      <View style={styles.logoArea}>
        <SparkMark size={96} color={colors.accentPrimary} />
      </View>

      <View style={styles.headlineArea}>
        <Text style={[typography.h1, styles.headline]}>
          Discover your Spark with only a few minutes a day
        </Text>
      </View>

      <View style={[styles.buttonArea, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PopButton label="Spark today" onPress={onContinue} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  headline: {
    textAlign: 'center',
    maxWidth: layout.maxReadingWidth,
  },
  buttonArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
})
