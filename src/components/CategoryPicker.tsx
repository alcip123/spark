import { StyleSheet, Text, View } from 'react-native'
import { categories } from '../data/categories'
import { borders, colors, radii, spacing, typography } from '../theme'
import { PressableScale } from './PressableScale'

interface CategoryPickerProps {
  selected: string[]
  onToggle: (slug: string) => void
}

export function CategoryPicker({ selected, onToggle }: CategoryPickerProps) {
  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const isSelected = selected.includes(category.slug)
        return (
          <PressableScale
            key={category.slug}
            onPress={() => onToggle(category.slug)}
            accessibilityRole="button"
            accessibilityLabel={category.name}
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected ? styles.chipSelected : borders.default]}
          >
            <Text
              style={[
                typography.body,
                { fontSize: 14, color: isSelected ? colors.accentText : colors.textPrimary },
              ]}
            >
              {category.name}
            </Text>
          </PressableScale>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // minHeight meets the 44pt/48dp-with-hitSlop touch-target floor; the chips
  // are the first thing every new user must tap during onboarding.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.bgAlt,
  },
  // Selected state uses the system's one accent color rather than a
  // per-category hue — category identity here is name-only, not color-coded.
  // borders.accent (Lavender Hairline, #C7C2DE) rather than raw accentPrimary
  // — DESIGN.md documents accent borders as this specific hairline shade
  // everywhere else (e.g. the Dive Deeper fact card); accentPrimary directly
  // would be a heavier, more saturated stroke than any other bordered surface.
  chipSelected: {
    backgroundColor: colors.illustrationFill1,
    ...borders.accent,
  },
})
