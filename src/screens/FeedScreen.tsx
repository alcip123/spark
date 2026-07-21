import { useCallback, useRef } from 'react'
import { Platform, StyleSheet, Text, View, useWindowDimensions, type ViewToken } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FactCard } from '../components/FactCard'
import { GearIcon } from '../components/icons/GearIcon'
import { SparkMark } from '../components/icons/SparkMark'
import { PressableScale } from '../components/PressableScale'
import { PrimaryButton } from '../components/PrimaryButton'
import { useFeed } from '../hooks/useFeed'
import { useFeedStore } from '../store/feedStore'
import { useUiStore } from '../store/uiStore'
import { colors, layout, shadows, spacing, typography } from '../theme'
import type { Fact } from '../types'

// A fact held on screen at least this long counts as genuine interest and
// earns its category one engagement point in the personalization weights.
const DWELL_THRESHOLD_MS = 4000
const POINTS_DWELL = 1

interface FeedScreenProps {
  onOpenSettings: () => void
}

export function FeedScreen({ onOpenSettings }: FeedScreenProps) {
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  // On phone-width screens this resolves to spacing.lg unchanged (no
  // regression there); on wide viewports/tablets it tracks the centered
  // content column's edge instead of drifting off to the raw screen edge,
  // where it visibly disconnects from the (also-centered) fact text.
  const contentInset = Math.max(spacing.lg, (width - layout.maxReadingWidth) / 2 + spacing.lg)
  const { feed, loadMore, hasMore } = useFeed()
  const textSize = useFeedStore((s) => s.textSize)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)

  // Drives each card's settle-in depth effect (see FactCard) — one shared
  // scroll position, read by whichever cards are near the viewport.
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

  // Stable renderItem so FactCard's memo isn't defeated by a fresh closure
  // on every FeedScreen render.
  const renderItem = useCallback(
    ({ item, index }: { item: Fact; index: number }) => (
      <FactCard fact={item} textSize={textSize} index={index} scrollY={scrollY} />
    ),
    [textSize, scrollY]
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
        <SparkMark size={40} color={colors.borderAccent} />
        <Text style={[typography.h2, { marginTop: spacing.lg }]}>You're all caught up</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          You've seen every fact we have right now. Broaden your topics to keep going, or check
          back soon for more.
        </Text>
        <View style={styles.emptyCtaWrap}>
          <PrimaryButton label="Adjust your topics" onPress={onOpenSettings} accessibilityLabel="Adjust topics" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
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
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />

      {/* Floating settings button, top-left per the reference layout; offset
          below the status bar / Dynamic Island via the live safe-area inset */}
      <PressableScale
        style={[styles.circleButton, { top: insets.top + spacing.md, left: contentInset }, shadows.card]}
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
  emptyCtaWrap: {
    marginTop: spacing.lg,
  },
  circleButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
