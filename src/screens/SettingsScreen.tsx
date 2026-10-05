import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeartIcon } from '../components/icons/HeartIcon'
import { PressableScale } from '../components/PressableScale'
import { CategoryPicker } from '../components/CategoryPicker'
import allFacts from '../data/facts.json'
import { useFeedStore } from '../store/feedStore'
import { colors, layout, radii, spacing, typography } from '../theme'
import type { Fact, TextSize } from '../types'

const TEXT_SIZES: TextSize[] = ['small', 'medium', 'large']
const TEXT_SIZE_LABEL: Record<TextSize, string> = { small: 'Small', medium: 'Medium', large: 'Large' }

// Built once: id → fact lookup so rendering the liked list doesn't scan the
// whole corpus per liked id on every render.
const FACT_BY_ID = new Map((allFacts as Fact[]).map((f) => [f.id, f]))

interface SettingsScreenProps {
  onClose: () => void
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const insets = useSafeAreaInsets()
  const preferredCategories = useFeedStore((s) => s.preferredCategories)
  const setPreferredCategories = useFeedStore((s) => s.setPreferredCategories)
  const textSize = useFeedStore((s) => s.textSize)
  const setTextSize = useFeedStore((s) => s.setTextSize)
  const likedFactIds = useFeedStore((s) => s.likedFactIds)
  const toggleLike = useFeedStore((s) => s.toggleLike)
  const setOnboardingComplete = useFeedStore((s) => s.setOnboardingComplete)

  function toggleCategory(slug: string) {
    setPreferredCategories(
      preferredCategories.includes(slug)
        ? preferredCategories.filter((s) => s !== slug)
        : [...preferredCategories, slug]
    )
  }

  // likedFactIds preserves like-order; reverse so most recently liked shows first.
  const likedFacts = [...likedFactIds]
    .reverse()
    .map((id) => FACT_BY_ID.get(id))
    .filter((f): f is Fact => f != null)

  // iOS pageSheet modals already sit below the status bar; Android's Modal is
  // full-screen, so the sheet must add the status-bar inset itself there.
  const topInset = Platform.OS === 'android' ? insets.top + spacing.md : spacing.xl

  return (
    <View style={[styles.page, { paddingTop: topInset }]}>
      <View style={[styles.header, styles.column]}>
        <Text style={typography.h2}>Settings</Text>
        <PressableScale
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
          style={styles.doneButton}
        >
          <Text style={[typography.button, { color: colors.accentPrimary }]}>Done</Text>
        </PressableScale>
      </View>

      <ScrollView
        style={styles.column}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.caption, styles.sectionLabel]}>TEXT SIZE</Text>
        <View style={styles.segmentedControl}>
          {TEXT_SIZES.map((size) => {
            const isActive = textSize === size
            return (
              <PressableScale
                key={size}
                onPress={() => setTextSize(size)}
                accessibilityRole="button"
                accessibilityLabel={`${TEXT_SIZE_LABEL[size]} text size`}
                accessibilityState={{ selected: isActive }}
                style={[styles.segment, isActive && styles.segmentActive]}
              >
                <Text
                  style={[
                    typography.body,
                    { fontSize: 14, color: isActive ? colors.onAccent : colors.textPrimary },
                  ]}
                >
                  {TEXT_SIZE_LABEL[size]}
                </Text>
              </PressableScale>
            )
          })}
        </View>

        <Text style={[typography.caption, styles.sectionLabel]}>FAVORITE TOPICS</Text>
        <Text style={[typography.body, { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Your feed always mixes in everything — favorites just show up more often.
        </Text>
        <CategoryPicker selected={preferredCategories} onToggle={toggleCategory} />

        <Text style={[typography.caption, styles.sectionLabel]}>
          LIKED FACTS{likedFacts.length > 0 ? ` (${likedFacts.length})` : ''}
        </Text>
        {likedFacts.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Facts you like will show up here.
          </Text>
        ) : (
          <View style={styles.likedList}>
            {likedFacts.map((fact) => (
              <View key={fact.id} style={styles.likedItem}>
                <Text style={[typography.body, { fontSize: 14, flex: 1 }]}>{fact.text}</Text>
                <PressableScale
                  onPress={() => toggleLike(fact.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from liked facts"
                  style={styles.likedItemRemoveButton}
                >
                  <HeartIcon size={18} color={colors.accentPrimary} filled />
                </PressableScale>
              </View>
            ))}
          </View>
        )}

        {__DEV__ && (
          <>
            <Text style={[typography.caption, styles.sectionLabel]}>DEVELOPER</Text>
            <PressableScale
              onPress={() => {
                setOnboardingComplete(false)
                onClose()
              }}
              accessibilityRole="button"
              accessibilityLabel="Reset onboarding"
              style={styles.devButton}
            >
              <Text style={[typography.button, { color: colors.accentPrimary }]}>Reset onboarding</Text>
            </PressableScale>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  // Every other screen (FactCard, Onboarding's sheet, Dive Deeper's `column`)
  // caps content at layout.maxReadingWidth on large windows; this screen was
  // the one exception, and would stretch its segmented control, chips, and
  // liked-facts list edge to edge on a wide viewport or tablet.
  column: {
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    alignSelf: 'center',
  },
  content: {
    paddingBottom: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.bgAlt,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  segmentActive: {
    // accentSurface (not accentPrimary): this pill carries regular-weight
    // white text, which needs the darker shade to clear 4.5:1 contrast.
    backgroundColor: colors.accentSurface,
  },
  likedList: {
    gap: spacing.sm,
  },
  likedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgAlt,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  // 44×44 minimum touch target (48dp effective on Android with hitSlop)
  likedItemRemoveButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  doneButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
})
