import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CategoryPicker } from '../components/CategoryPicker'
import { PrimaryButton } from '../components/PrimaryButton'
import { lightImpact } from '../onboarding/haptics'
import { useFeedStore } from '../store/feedStore'
import { layout, onboarding, spacing, typography } from '../theme'

const MIN_CATEGORIES = 3

interface OnboardingScreenProps {
  /** Space reserved above the picker for Rook (moved aside) and the heading. */
  topInset: number
  onContinue: () => void
}

// Topic selection — Rook's answer-the-question step. Rendered as foreground UI
// over the persistent onboarding room (see src/onboarding/OnboardingScene.tsx),
// not as a screen of its own: no sheet or modal card, cream only where
// legibility needs it (the chips), and the dimmed room stays visible around it.
// Layout is a placeholder to revisit once the production room art exists.
export function OnboardingScreen({ topInset, onContinue }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets()
  const savedCategories = useFeedStore((s) => s.preferredCategories)
  const setPreferredCategories = useFeedStore((s) => s.setPreferredCategories)
  // Pre-selected from the store so re-entering the flow keeps earlier choices.
  const [selected, setSelected] = useState<string[]>(savedCategories)

  const canContinue = selected.length >= MIN_CATEGORIES

  function toggle(slug: string) {
    lightImpact()
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  function handleContinue() {
    if (!canContinue) return
    // Persist now, so the choices survive whatever happens during Sign Up.
    // Completing onboarding is Sign Up's job, not this step's.
    setPreferredCategories(selected)
    onContinue()
  }

  return (
    <View style={[styles.page, { paddingTop: topInset }]}>
      <View style={styles.column}>
        <Text style={[typography.h1, styles.headline]}>What are you curious about?</Text>
        <Text style={[typography.body, styles.subline]}>
          Pick at least {MIN_CATEGORIES}. Your feed still mixes in everything — it learns as you scroll.
        </Text>
      </View>

      <ScrollView
        style={styles.column}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CategoryPicker selected={selected} onToggle={toggle} />
      </ScrollView>

      <View style={[styles.column, { paddingBottom: insets.bottom + spacing.lg, paddingTop: spacing.md }]}>
        <PrimaryButton
          label={canContinue ? 'Continue' : `Pick ${MIN_CATEGORIES - selected.length} more`}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  column: {
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    alignSelf: 'center',
  },
  headline: {
    textAlign: 'center',
    color: onboarding.onRoom,
    marginBottom: spacing.sm,
  },
  subline: {
    textAlign: 'center',
    color: onboarding.onRoom,
    opacity: 0.85,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
})
