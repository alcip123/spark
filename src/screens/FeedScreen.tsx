import { useCallback, useRef } from 'react'
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FactCard } from '../components/FactCard'
import { GearIcon } from '../components/icons/GearIcon'
import { PressableScale } from '../components/PressableScale'
import { useFeed } from '../hooks/useFeed'
import { useFeedStore } from '../store/feedStore'
import { useUiStore } from '../store/uiStore'
import { colors, radii, shadows, spacing, typography } from '../theme'
import type { Fact } from '../types'

// A fact held on screen at least this long counts as genuine interest and
// earns its category one engagement point in the personalization weights.
const DWELL_THRESHOLD_MS = 4000
const POINTS_DWELL = 1

interface FeedScreenProps {
  onOpenSettings: () => void
}

export function FeedScreen({ onOpenSettings }: FeedScreenProps) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { feed, loadMore, hasMore } = useFeed()
  const textSize = useFeedStore((s) => s.textSize)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)

  // Stable renderItem so FactCard's memo isn't defeated by a fresh closure
  // on every FeedScreen render.
  const renderItem = useCallback(
    ({ item }: { item: Fact }) => <FactCard fact={item} textSize={textSize} />,
    [textSize]
  )

  // Dwell tracking: when the visible fact changes, the previous one earns a
  // point if it was held on screen past the threshold. Each fact can earn its
  // dwell point only once per session.
  const current = useRef<{ id: string; slug: string; since: number } | null>(null)
  const dwellCredited = useRef(new Set<string>())
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visible = viewableItems.find((t) => t.isViewable)
      const fact = visible ? (visible.item as Fact) : null
      if (fact?.id === current.current?.id) return

      const prev = current.current
      if (
        prev &&
        Date.now() - prev.since >= DWELL_THRESHOLD_MS &&
        !dwellCredited.current.has(prev.id)
      ) {
        dwellCredited.current.add(prev.id)
        recordEngagement(prev.slug, POINTS_DWELL)
      }

      current.current = fact ? { id: fact.id, slug: fact.categorySlug, since: Date.now() } : null
      // Dive Deeper reads this to know which fact the chat is about
      useUiStore.getState().setCurrentVisibleFact(fact)
    },
    [recordEngagement]
  )

  if (feed.length === 0) {
    return (
      <View style={[styles.emptyState, { height }]}>
        <Text style={typography.h2}>You're all caught up</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          You've seen every fact we have right now. Broaden your topics to keep going, or check
          back soon for more.
        </Text>
        <PressableScale
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Adjust topics"
          style={[styles.emptyCta, shadows.button]}
        >
          <Text style={typography.button}>Adjust your topics</Text>
        </PressableScale>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feed}
        keyExtractor={(item: Fact) => item.id}
        renderItem={renderItem}
        // One-card-per-swipe paging, split by platform: on native, snapToInterval
        // alone (combining it with pagingEnabled is a conflicting scroll spec on
        // iOS); on web, pagingEnabled (which react-native-web implements via CSS
        // scroll-snap — snapToInterval is a no-op there).
        pagingEnabled={Platform.OS === 'web'}
        snapToInterval={Platform.OS === 'web' ? undefined : height}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
      />

      {/* Floating settings button, top-left per the reference layout; offset
          below the status bar / Dynamic Island via the live safe-area inset */}
      <PressableScale
        style={[styles.circleButton, { top: insets.top + spacing.md }, shadows.card]}
        onPress={onOpenSettings}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <GearIcon size={20} color={colors.textPrimary} />
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
  },
  emptyCta: {
    marginTop: spacing.lg,
    backgroundColor: colors.accentPrimary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
  },
  circleButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
