import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CategoryPicker } from '../components/CategoryPicker'
import { SparkMark } from '../components/icons/SparkMark'
import { PrimaryButton } from '../components/PrimaryButton'
import { useFeedStore } from '../store/feedStore'
import { borders, colors, layout, radii, shadows, spacing, typography } from '../theme'

const MIN_CATEGORIES = 3

export function OnboardingScreen() {
  const [selected, setSelected] = useState<string[]>([])
  const setPreferredCategories = useFeedStore((s) => s.setPreferredCategories)
  const setOnboardingComplete = useFeedStore((s) => s.setOnboardingComplete)

  const canContinue = selected.length >= MIN_CATEGORIES

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  function handleContinue() {
    if (!canContinue) return
    setPreferredCategories(selected)
    setOnboardingComplete(true)
  }

  return (
    <View style={styles.page}>
      <View style={styles.sheet}>
        {/* Indicator left on (unlike other scroll views in the app): 12 chips
            can overflow the sheet's capped height, and this is the only
            affordance telling a new user there's more to see below. */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.illustrationWrap}>
            <View style={[styles.tintShape, styles.tintShapeBack]} />
            <View style={[styles.tintShape, styles.tintShapeFront]} />
            <View style={[styles.illustrationCard, borders.accent, shadows.card]}>
              <SparkMark size={40} color={colors.illustrationIcon} />
            </View>
          </View>

          <Text style={[typography.h1, styles.headline]}>What sparks your curiosity?</Text>
          <Text style={[typography.body, styles.subline]}>
            Pick at least {MIN_CATEGORIES} topics to start with. Your feed will still mix in everything — it
            learns what you love as you scroll.
          </Text>

          <CategoryPicker selected={selected} onToggle={toggle} />
        </ScrollView>

        <View style={styles.ctaWrap}>
          <PrimaryButton
            label={canContinue ? 'Continue' : `Pick ${MIN_CATEGORIES - selected.length} more`}
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    maxHeight: '90%',
    backgroundColor: colors.bgAlt,
    borderRadius: radii.sheet,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sheet,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  illustrationWrap: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  tintShape: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 32,
  },
  tintShapeBack: {
    backgroundColor: colors.illustrationFill1,
    transform: [{ rotate: '12deg' }, { translateX: 10 }, { translateY: 6 }],
  },
  tintShapeFront: {
    backgroundColor: colors.illustrationFill2,
    transform: [{ rotate: '-8deg' }, { translateX: -8 }, { translateY: -4 }],
  },
  illustrationCard: {
    width: 88,
    height: 88,
    borderRadius: radii.card,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subline: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  // Standardized to spacing.lg to match the same gap used above the CTA in
  // FeedScreen/DiveDeeperScreen's empty states (this one previously used
  // spacing.md — a smaller, unexplained gap for the same button-above-content
  // relationship elsewhere in the app).
  ctaWrap: {
    marginTop: spacing.lg,
  },
})
