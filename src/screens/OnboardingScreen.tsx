import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { PressableScale } from '../components/PressableScale'
import { CategoryPicker } from '../components/CategoryPicker'
import { SparkMark } from '../components/icons/SparkMark'
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        <PressableScale
          onPress={handleContinue}
          disabled={!canContinue}
          style={[styles.cta, shadows.button, !canContinue && styles.ctaDisabled]}
        >
          <Text style={typography.button}>
            {canContinue ? 'Continue' : `Pick ${MIN_CATEGORIES - selected.length} more`}
          </Text>
        </PressableScale>
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
  cta: {
    marginTop: spacing.md,
    backgroundColor: colors.accentPrimary,
    borderRadius: radii.pill,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
})
