import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CategoryPicker } from '../components/CategoryPicker'
import { ExpandedFact } from '../components/ExpandedFact'
import { FactCard } from '../components/FactCard'
import { FeedHeader, HEADER_HEIGHT } from '../components/FeedHeader'
import { SparkMark } from '../components/icons/SparkMark'
import { PrimaryButton } from '../components/PrimaryButton'
import { DOCK_HEIGHT } from '../constants/layout'
import allFacts from '../data/facts.json'
import { useFeed } from '../hooks/useFeed'
import { track } from '../lib/analytics'
import { useFeedStore } from '../store/feedStore'
import { useUiStore, type FeedTab } from '../store/uiStore'
import { colors, layout, spacing, typography } from '../theme'
import type { Fact } from '../types'

// A fact held on screen long enough to actually be read counts as genuine
// interest and earns its category one engagement point in the personalization
// weights. The bar scales with length — a three-word fact and a thirty-word one
// don't take the same time to absorb, so a flat threshold either lets short
// facts score on a scroll-past or asks too little of long ones. The base covers
// noticing the card and registering the surprise; the per-word rate works out to
// ~230wpm, ordinary adult reading speed. Over the current corpus (781 facts,
// median 15 words) this puts the typical fact at ~5.5s. The clamps handle the
// tails: the shortest facts still demand a real pause, and the rare 30+ word
// outlier can't ask for an implausible hold.
const DWELL_BASE_MS = 1600
const DWELL_PER_WORD_MS = 260
const DWELL_MIN_MS = 3000
const DWELL_MAX_MS = 8000
const POINTS_DWELL = 1
// A dwell well past the threshold earns more than one that barely cleared it,
// capped low — dwell stays the weakest signal relative to POINTS_LIKE/POINTS_SHARE.
const DWELL_MULT_CAP = 2

function dwellThresholdMs(text: string): number {
  const words = text.trim().split(/\s+/).length
  const scaled = DWELL_BASE_MS + words * DWELL_PER_WORD_MS
  return Math.min(Math.max(scaled, DWELL_MIN_MS), DWELL_MAX_MS)
}

// Swipe order, left to right. Must match the tab order in FeedHeader — they are
// two views of the same thing, and a mismatch would make swiping feel wrong
// without any visible cause.
const PAGES: FeedTab[] = ['topics', 'forYou', 'saved']

interface FeedScreenProps {
  onOpenSettings: () => void
}

export function FeedScreen({ onOpenSettings }: FeedScreenProps) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { feed, loadMore, hasMore } = useFeed()
  const feedTab = useUiStore((s) => s.feedTab)
  const setFeedTab = useUiStore((s) => s.setFeedTab)
  const selectedTopic = useUiStore((s) => s.selectedTopic)
  const setSelectedTopic = useUiStore((s) => s.setSelectedTopic)
  const likedFactIds = useFeedStore((s) => s.likedFactIds)
  const textSize = useFeedStore((s) => s.textSize)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)
  const recordSeen = useFeedStore((s) => s.recordSeen)

  // Saved and Topics read the whole catalog directly rather than going through
  // useFeed — neither wants personalized sampling, they want a specific,
  // complete set. Memoized so scrolling doesn't re-filter 781 facts per render.
  // All three pages are mounted at once now (they're swipeable), so each needs
  // its own dataset rather than one that switches on the active tab.
  const savedItems = useMemo(() => {
    const all = allFacts as Fact[]
    // Newest save first: likedFactIds is append-ordered, so walking it
    // backwards puts the most recent at the top without storing a timestamp.
    return likedFactIds
      .map((id) => all.find((f) => f.id === id))
      .filter((f): f is Fact => f !== undefined)
      .reverse()
  }, [likedFactIds])

  const topicItems = useMemo(
    () =>
      selectedTopic ? (allFacts as Fact[]).filter((f) => f.categorySlug === selectedTopic) : [],
    [selectedTopic]
  )

  // Stable renderItem so FactCard's memo isn't defeated by a fresh closure
  // on every FeedScreen render.
  // App renders the expanded view (above the dock); the feed only opens it.
  const openFact = useUiStore((s) => s.setExpandedFact)

  const renderItem = useCallback(
    ({ item }: { item: Fact }) => (
      <FactCard fact={item} textSize={textSize} onPress={openFact} />
    ),
    [textSize, openFact]
  )

  // Dwell tracking. Several cards share the viewport now, so this tracks a set
  // of currently-visible facts rather than a single one: a fact is timed from
  // when it appears until it leaves, and settles on the way out.
  // The threshold is captured on entry, not exit — once a fact has scrolled
  // away its text is no longer in hand to measure.
  const visible = useRef(
    new Map<string, { slug: string; tags: string[]; since: number; thresholdMs: number }>()
  )
  const dwellCredited = useRef(new Set<string>())
  // The three pages stay mounted side by side, so an off-screen list still
  // reports its rows as "viewable" within its own viewport. Without this guard
  // the feed would record views and dwell for facts nobody is looking at.
  // A ref, not the prop, because FlatList doesn't support swapping
  // onViewableItemsChanged after mount.
  const activeTabRef = useRef(feedTab)
  activeTabRef.current = feedTab
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (activeTabRef.current !== 'forYou') return
      const now = Date.now()
      const nowVisible = viewableItems
        .filter((t) => t.isViewable)
        .map((t) => t.item as Fact)
      const nowIds = new Set(nowVisible.map((f) => f.id))

      // Settle anything that just left the viewport.
      for (const [id, entry] of visible.current) {
        if (nowIds.has(id)) continue
        const dwellMs = now - entry.since
        // Logged on exit, not entry, so dwell_ms is real time on screen — the
        // number BUSINESS_PLAN §11 uses to tell a read from a scroll-past.
        track('fact_viewed', {
          fact_id: id,
          category: entry.slug,
          dwell_ms: dwellMs,
          met_threshold: dwellMs >= entry.thresholdMs,
        })
        if (dwellMs >= entry.thresholdMs && !dwellCredited.current.has(id)) {
          dwellCredited.current.add(id)
          const dwellPoints = POINTS_DWELL * Math.min(dwellMs / entry.thresholdMs, DWELL_MULT_CAP)
          recordEngagement({ categorySlug: entry.slug, tags: entry.tags }, dwellPoints)
        }
        visible.current.delete(id)
      }

      // Start timing anything newly on screen.
      for (const fact of nowVisible) {
        if (visible.current.has(fact.id)) continue
        visible.current.set(fact.id, {
          slug: fact.categorySlug,
          tags: fact.tags,
          since: now,
          thresholdMs: dwellThresholdMs(fact.text),
        })
        // Persisted view history — drives the resurfacing weight in useFeed so
        // a fact just shown doesn't come straight back on the next app launch.
        recordSeen(fact.id)
      }

      // Dive Deeper reads this. With several cards visible, the topmost one is
      // the least surprising answer to "which fact am I looking at?".
      useUiStore.getState().setCurrentVisibleFact(nowVisible[0] ?? null)
    },
    [recordEngagement, recordSeen]
  )

  // How fast a user runs out is the corpus-size question in §6.3, measured
  // rather than assumed. In an effect, and latched, so it logs the moment the
  // feed empties rather than on every render while the empty state is up.
  const exhaustedLogged = useRef(false)
  useEffect(() => {
    if (feed.length === 0 && !hasMore && !exhaustedLogged.current) {
      exhaustedLogged.current = true
      track('feed_exhausted', { facts_credited: dwellCredited.current.size })
    }
  }, [feed.length, hasMore])

  // --- pager <-> tab sync ---------------------------------------------------
  // Page order must match FeedHeader's tab order.
  const pagerRef = useRef<ScrollView>(null)
  const tabIndex = Math.max(0, PAGES.indexOf(feedTab))
  // Set when the tab changed *because* of a swipe, so the effect below doesn't
  // then animate the pager to where it already is and fight the finger.
  const fromSwipe = useRef(false)
  const didInitPager = useRef(false)

  const onPagerScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // layoutMeasurement is the pager's own width where it's reported, but
      // react-native-web doesn't always populate it; the window width is the
      // same thing here (the pager is full-bleed) and keeps this working
      // rather than silently never switching tabs.
      const w = e.nativeEvent.layoutMeasurement?.width || width
      if (!w) return
      // Rounding means the tab flips as you pass halfway, so the header keeps
      // up with the drag instead of waiting for it to settle.
      const next = PAGES[Math.round(e.nativeEvent.contentOffset.x / w)]
      if (next && next !== useUiStore.getState().feedTab) {
        fromSwipe.current = true
        setFeedTab(next)
      }
    },
    [setFeedTab, width]
  )

  useEffect(() => {
    if (fromSwipe.current) {
      fromSwipe.current = false
      return
    }
    pagerRef.current?.scrollTo({ x: tabIndex * width, animated: true })
  }, [tabIndex, width])

  const listPadding = {
    // Clears the floating header and the dock, both of which overlay the list.
    paddingTop: insets.top + HEADER_HEIGHT,
    paddingBottom: DOCK_HEIGHT + insets.bottom + spacing.lg,
    maxWidth: layout.maxReadingWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
  }

  function emptyState(title: string, body: string, cta?: { label: string; onPress: () => void }) {
    return (
      <View style={styles.emptyState}>
        <SparkMark size={40} color={colors.borderAccent} />
        <Text style={[typography.h2, { marginTop: spacing.lg, textAlign: 'center' }]}>{title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
          {body}
        </Text>
        {cta && (
          <View style={styles.emptyCtaWrap}>
            <PrimaryButton label={cta.label} onPress={cta.onPress} accessibilityLabel={cta.label} />
          </View>
        )}
      </View>
    )
  }

  // Topics, undrilled: the category grid instead of a list of facts. Reuses the
  // onboarding picker rather than a second grid that would drift from it.
  function topicPicker() {
    return (
      <ScrollView contentContainerStyle={[listPadding, styles.topicPad]}>
        <Text style={[typography.h2, { marginBottom: spacing.md }]}>Browse topics</Text>
        <CategoryPicker
          selected={selectedTopic ? [selectedTopic] : []}
          onToggle={(slug) => setSelectedTopic(slug === selectedTopic ? null : slug)}
        />
      </ScrollView>
    )
  }

  // Free-scrolling vertical list: no paging, no snapping, and no getItemLayout
  // — cards size to their text, so a fixed row height would be a lie and would
  // misplace every scroll offset.
  function factList(data: Fact[], tab: FeedTab) {
    return (
      <FlatList
        data={data}
        keyExtractor={(item: Fact) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        // Separator rather than a border on the row itself: a bottom border
        // would leave a stray hairline hanging under the final fact.
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        onEndReached={tab === 'forYou' && hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={tab === 'forYou' ? onViewableItemsChanged : undefined}
        // 60, not 80: a one-line card can be entirely on screen while a long
        // one at the same position isn't, and both should count as read.
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        contentContainerStyle={listPadding}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Horizontal pager: the three tabs are pages you can swipe between, in
          the same order they appear in the header. pagingEnabled gives the
          smooth snap for free on native, and maps to CSS scroll-snap on web. */}
      <ScrollView
        ref={pagerRef}
        style={styles.pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onPagerScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onPagerScroll}
        // "For you" is the middle page and the default, so the pager has to
        // start there rather than at x=0. `contentOffset` is iOS-only, so the
        // initial jump is done on first layout instead — unanimated, so it
        // reads as the starting position rather than a swipe on launch.
        onLayout={() => {
          if (didInitPager.current) return
          didInitPager.current = true
          pagerRef.current?.scrollTo({ x: tabIndex * width, animated: false })
        }}
      >
        <View style={[styles.page, { width }]}>
          {selectedTopic
            ? factList(topicItems, 'topics')
            : /* Undrilled Topics: the category grid rather than a list of
                 facts. Reuses the onboarding picker instead of a second grid
                 that would drift from it. */
              topicPicker()}
        </View>

        <View style={[styles.page, { width }]}>
          {feed.length === 0
            ? emptyState(
                "You're all caught up",
                "You've seen every fact we have right now. Broaden your topics to keep going, or check back soon for more.",
                { label: 'Adjust your topics', onPress: onOpenSettings }
              )
            : factList(feed, 'forYou')}
        </View>

        <View style={[styles.page, { width }]}>
          {savedItems.length === 0
            ? emptyState('Nothing saved yet', 'Tap the heart on a fact to keep it here.')
            : factList(savedItems, 'saved')}
        </View>
      </ScrollView>

      <FeedHeader
        active={feedTab}
        onSelect={setFeedTab}
        onOpenProfile={() => useUiStore.getState().setActiveTab('profile')}
      />
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
  // Each swipe page fills the pager's height so its content can centre in the
  // screen rather than collapsing to the height of its own text.
  pager: {
    flex: 1,
  },
  page: {
    height: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyCtaWrap: {
    marginTop: spacing.lg,
  },
  topicPad: {
    paddingHorizontal: spacing.lg,
  },
})
