import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppleLogo } from '../components/icons/AppleLogo'
import { FacebookLogo } from '../components/icons/FacebookLogo'
import { MailIcon } from '../components/icons/MailIcon'
import { PopButton } from '../components/PopButton'
import { colors, layout, spacing, typography } from '../theme'

interface SignUpScreenProps {
  onContinue: () => void
}

// Screen 2 of the new onboarding flow: headline centered above a stack of
// three sign-in options. All three currently just advance to the next step —
// the actual Apple/Facebook/email auth flows aren't wired up yet.
const FACEBOOK_BLUE = '#1877F2'

export function SignUpScreen({ onContinue }: SignUpScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.page}>
      <View style={styles.headlineArea}>
        <Text style={[typography.h1, styles.headline]}>
          Sign in to access all of Spark's features
        </Text>
      </View>

      <View style={[styles.buttonArea, styles.column, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PopButton
          label="Continue with Apple"
          onPress={onContinue}
          icon={<AppleLogo size={19} color="#FFFFFF" />}
          backgroundColor="#000000"
          textColor="#FFFFFF"
          fullWidth
        />
        <PopButton
          label="Continue with Facebook"
          onPress={onContinue}
          icon={<FacebookLogo size={19} color="#FFFFFF" />}
          backgroundColor={FACEBOOK_BLUE}
          textColor="#FFFFFF"
          fullWidth
        />
        <PopButton
          label="Continue with Email"
          onPress={onContinue}
          icon={<MailIcon size={19} color="#000000" />}
          backgroundColor={colors.bgAlt}
          textColor="#000000"
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
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
  // Same reading-width cap used across the app (DiveDeeperScreen, Settings)
  // — without it, the fullWidth buttons stretch edge to edge on wide
  // viewports/tablets instead of stopping at a sane content width.
  column: {
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    alignSelf: 'center',
  },
  buttonArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
})
