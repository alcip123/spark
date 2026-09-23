import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { borders, colors, radii, spacing, typography } from '../theme'
import type { FeedTab } from '../store/uiStore'
import { GlassSurface } from './GlassSurface'
import { ProfileIcon } from './icons/ProfileIcon'
import { PressableScale } from './PressableScale'

// Order is deliberate: For you is the default and sits in the middle, so the
// thumb reaches it without crossing the other two.
const TABS: { tab: FeedTab; label: string }[] = [
  { tab: 'topics', label: 'Topics' },
  { tab: 'forYou', label: 'For you' },
  { tab: 'saved', label: 'Saved' },
]

const BRAND_ROW_HEIGHT = 48
const TAB_ROW_HEIGHT = 44

// Content height below the safe-area inset. Shared with FeedScreen so the
// list's top padding and the header's real footprint can't drift apart — if
// this is short, the first fact hides behind the header.
export const HEADER_HEIGHT = BRAND_ROW_HEIGHT + TAB_ROW_HEIGHT + spacing.sm + spacing.xs

interface FeedHeaderProps {
  active: FeedTab
  onSelect: (tab: FeedTab) => void
  onOpenProfile: () => void
}

export function FeedHeader({ active, onSelect, onOpenProfile }: FeedHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.sm }]}>
      <GlassSurface variant="chrome" radius={0} />

      {/* Wrapped so web paints the rows above the absolutely-positioned glass */}
      <View>
        <View style={styles.brandRow}>
          <PressableScale
            onPress={onOpenProfile}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            style={styles.avatar}
          >
            {/* Placeholder until accounts exist and there's a real picture */}
            <ProfileIcon size={20} color={colors.textSecondary} />
          </PressableScale>

          {/* PLACEHOLDER WORDMARK — a real one is being designed. Kept as a
              single element so swapping it for an SVG is a one-line change. */}
          <Text style={styles.wordmark}>Spark</Text>

          {/* Deliberately empty: the mirror of this slot in the reference
              layout is a subscription button, which Spark has nothing to put
              in yet. Sized to balance the avatar so the wordmark sits centred. */}
          <View style={styles.avatarSpacer} />
        </View>

        <View style={styles.tabRow}>
          {TABS.map(({ tab, label }) => {
            const isActive = tab === active
            return (
              <PressableScale
                key={tab}
                onPress={() => onSelect(tab)}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: isActive }}
                style={styles.tab}
              >
                <Text
                  style={[
                    typography.body,
                    { fontSize: 15, color: isActive ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
                {/* Always rendered, transparent when inactive: a conditional
                    underline would shift the label by 2pt as tabs change.
                    Spans the full third, as in the reference layout. */}
                <View
                  style={[
                    styles.underline,
                    { backgroundColor: isActive ? colors.textPrimary : 'transparent' },
                  ]}
                />
              </PressableScale>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingBottom: spacing.xs,
  },
  brandRow: {
    height: BRAND_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgAlt,
    ...borders.default,
  },
  // Same width as the avatar so the wordmark is centred on the screen rather
  // than centred in the leftover space.
  avatarSpacer: {
    width: 36,
  },
  wordmark: {
    ...typography.h2,
    fontSize: 20,
  },
  tabRow: {
    flexDirection: 'row',
  },
  // flex: 1 — each tab takes an equal third of the width, so the labels spread
  // across the screen instead of clustering in the middle.
  tab: {
    flex: 1,
    height: TAB_ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  underline: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
})
